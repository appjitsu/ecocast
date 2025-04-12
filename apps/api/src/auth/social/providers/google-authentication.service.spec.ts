import { UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
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

// Mock OAuth2Client
const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: mockVerifyIdToken,
      };
    }),
  };
});

describe('GoogleAuthenticationService', () => {
  let service: GoogleAuthenticationService;
  let mockUsersService: Partial<UsersService>;
  let mockGenerateTokensProvider: Partial<GenerateTokensProvider>;
  let mockJwtConfig: Partial<ConfigType<typeof jwtConfig>>;
  let mockOauthClient: Partial<OAuth2Client>;

  beforeEach(() => {
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
      secret: 'test_secret',
      issuer: 'test_issuer',
      audience: 'test_audience',
      accessTokenTtl: 3600,
      refreshTokenTtl: 86400,
    };

    mockOauthClient = {
      verifyIdToken: mockVerifyIdToken,
    };

    service = new GoogleAuthenticationService(
      mockJwtConfig as ConfigType<typeof jwtConfig>,
      mockUsersService as UsersService,
      mockGenerateTokensProvider as GenerateTokensProvider,
      mockOauthClient as OAuth2Client,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    const mockGoogleToken: GoogleTokenDto = {
      token: 'valid_google_token',
    };

    const mockGooglePayload = {
      sub: 'google_user_id',
      email: 'test@example.com',
      given_name: 'Test',
      family_name: 'User',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      googleId: 'google_user_id',
    };

    it('should throw UnauthorizedException when token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error());

      await expect(service.authenticate(mockGoogleToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when payload is invalid', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: undefined,
          email: undefined,
        }),
      });

      await expect(service.authenticate(mockGoogleToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens for existing user', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => mockGooglePayload,
      });
      mockUsersService.findOneByGoogleId = jest
        .fn()
        .mockResolvedValue(mockUser);

      const result = await service.authenticate(mockGoogleToken);

      expect(mockUsersService.findOneByGoogleId).toHaveBeenCalledWith(
        mockGooglePayload.sub,
      );
      expect(mockGenerateTokensProvider.generateTokens).toHaveBeenCalledWith(
        mockUser,
      );
      expect(result).toEqual({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      });
    });

    it('should create new user and return tokens when user does not exist', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => mockGooglePayload,
      });
      mockUsersService.findOneByGoogleId = jest.fn().mockResolvedValue(null);
      mockUsersService.createGoogleUser = jest.fn().mockResolvedValue(mockUser);

      const result = await service.authenticate(mockGoogleToken);

      expect(mockUsersService.findOneByGoogleId).toHaveBeenCalledWith(
        mockGooglePayload.sub,
      );
      expect(mockUsersService.createGoogleUser).toHaveBeenCalledWith({
        email: mockGooglePayload.email,
        googleId: mockGooglePayload.sub,
        firstName: mockGooglePayload.given_name,
        lastName: mockGooglePayload.family_name,
      });
      expect(mockGenerateTokensProvider.generateTokens).toHaveBeenCalledWith(
        mockUser,
      );
      expect(result).toEqual({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      });
    });
  });
});
