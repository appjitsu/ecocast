import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../../events/events.service';
import { UsersService } from '../../users/providers/users.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { SignInDto } from '../dtos/signin.dto';
import { AuthService } from './auth.service';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { SignInProvider } from './sign-in.provider';

// Mock the User entity
jest.mock('../../users/user.entity', () => ({
  User: class MockUser {
    id: number;
    email: string;
    password: string;
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: Partial<UsersService>;
  let mockSignInProvider: Partial<SignInProvider>;
  let mockRefreshTokensProvider: Partial<RefreshTokensProvider>;
  let mockJwtService: Partial<JwtService>;
  let mockConfigService: Partial<ConfigService>;
  let mockEventsService: Partial<EventsService>;

  beforeEach(async () => {
    mockUsersService = {};
    mockSignInProvider = {
      signIn: jest.fn().mockResolvedValue({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      }),
    };
    mockRefreshTokensProvider = {
      refreshTokens: jest.fn().mockResolvedValue({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      }),
    };
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn(),
    };
    mockEventsService = {
      broadcastEvent: jest.fn(),
      sendToUser: jest.fn(),
      getConnectedClientsCount: jest.fn(),
      getConnectedUsersCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SignInProvider,
          useValue: mockSignInProvider,
        },
        {
          provide: RefreshTokensProvider,
          useValue: mockRefreshTokensProvider,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should call SignInProvider.signIn with correct parameters', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await service.signIn(signInDto);

      expect(mockSignInProvider.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should return tokens from SignInProvider', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.signIn(signInDto);

      expect(result).toEqual({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      });
    });
  });

  describe('refreshTokens', () => {
    it('should call RefreshTokensProvider.refreshTokens with correct parameters', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'old_refresh_token',
      };

      await service.refreshTokens(refreshTokenDto);

      expect(mockRefreshTokensProvider.refreshTokens).toHaveBeenCalledWith(
        refreshTokenDto,
      );
    });

    it('should return new tokens from RefreshTokensProvider', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'old_refresh_token',
      };

      const result = await service.refreshTokens(refreshTokenDto);

      expect(result).toEqual({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });
    });
  });

  describe('isAuth', () => {
    it('should return true', () => {
      expect(service.isAuth()).toBe(true);
    });
  });
});
