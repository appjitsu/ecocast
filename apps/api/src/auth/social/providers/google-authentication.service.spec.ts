import { UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../users/providers/users.service';
import jwtConfig from '../../config/jwt.config';
import { GenerateTokensProvider } from '../../providers/generate-tokens.provider';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { GoogleAuthenticationService } from './google-authentication.service';

// Mock the User entity
jest.mock('../../../users/user.entity', () => ({
  User: class MockUser {
    id: number;
    email: string;
    googleId: string;
  },
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe('GoogleAuthenticationService', () => {
  let service: GoogleAuthenticationService;
  let mockUsersService: Partial<UsersService>;
  let mockGenerateTokensProvider: Partial<GenerateTokensProvider>;
  let mockJwtConfig: Partial<ConfigType<typeof jwtConfig>>;

  beforeEach(async () => {
    mockUsersService = {
      findOneByGoogleId: jest.fn(),
      createGoogleUser: jest.fn(),
    };
    mockGenerateTokensProvider = {
      generateTokens: jest.fn().mockResolvedValue({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      }),
    };
    mockJwtConfig = {
      googleClientId: 'test_client_id',
      googleClientSecret: 'test_client_secret',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthenticationService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: GenerateTokensProvider,
          useValue: mockGenerateTokensProvider,
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    service = module.get<GoogleAuthenticationService>(
      GoogleAuthenticationService,
    );
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    const mockGoogleToken: GoogleTokenDto = {
      token: 'valid_google_token',
    };

    const mockGooglePayload = {
      email: 'test@example.com',
      sub: 'google_user_id',
      given_name: 'John',
      family_name: 'Doe',
    };

    beforeEach(() => {
      // Reset the mock implementation for each test
      service['oauthClient'].verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => mockGooglePayload,
      });
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      service['oauthClient'].verifyIdToken = jest
        .fn()
        .mockRejectedValue(new Error());

      await expect(service.authenticate(mockGoogleToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when payload is invalid', async () => {
      service['oauthClient'].verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({}),
      });

      await expect(service.authenticate(mockGoogleToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens for existing user', async () => {
      const existingUser = {
        id: 1,
        email: mockGooglePayload.email,
        googleId: mockGooglePayload.sub,
      };

      mockUsersService.findOneByGoogleId = jest
        .fn()
        .mockResolvedValue(existingUser);

      const result = await service.authenticate(mockGoogleToken);

      expect(mockUsersService.findOneByGoogleId).toHaveBeenCalledWith(
        mockGooglePayload.sub,
      );
      expect(mockGenerateTokensProvider.generateTokens).toHaveBeenCalledWith(
        existingUser,
      );
      expect(result).toEqual({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      });
    });

    it('should create new user and return tokens when user does not exist', async () => {
      const newUser = {
        id: 1,
        email: mockGooglePayload.email,
        googleId: mockGooglePayload.sub,
        firstName: mockGooglePayload.given_name,
        lastName: mockGooglePayload.family_name,
      };

      mockUsersService.findOneByGoogleId = jest.fn().mockResolvedValue(null);
      mockUsersService.createGoogleUser = jest.fn().mockResolvedValue(newUser);

      const result = await service.authenticate(mockGoogleToken);

      expect(mockUsersService.createGoogleUser).toHaveBeenCalledWith({
        email: mockGooglePayload.email,
        googleId: mockGooglePayload.sub,
        firstName: mockGooglePayload.given_name,
        lastName: mockGooglePayload.family_name,
      });
      expect(mockGenerateTokensProvider.generateTokens).toHaveBeenCalledWith(
        newUser,
      );
      expect(result).toEqual({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      });
    });
  });
});
