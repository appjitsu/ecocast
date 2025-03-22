import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { SignInDto } from './dtos/signin.dto';
import { AuthService } from './providers/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      signIn: jest.fn().mockResolvedValue({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      }),
      refreshTokens: jest.fn().mockResolvedValue({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call AuthService.signIn with correct parameters', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await controller.signIn(signInDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should return tokens from AuthService', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.signIn(signInDto);

      expect(result).toEqual({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      });
    });
  });

  describe('refreshTokens', () => {
    it('should call AuthService.refreshTokens with correct parameters', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'old_refresh_token',
      };

      await controller.refreshTokens(refreshTokenDto);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenDto,
      );
    });

    it('should return new tokens from AuthService', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'old_refresh_token',
      };

      const result = await controller.refreshTokens(refreshTokenDto);

      expect(result).toEqual({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });
    });
  });
});
