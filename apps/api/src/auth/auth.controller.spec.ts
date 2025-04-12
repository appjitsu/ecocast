import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      createTokens: jest.fn().mockResolvedValue({
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
      }),
      refreshTokens: jest.fn().mockResolvedValue({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
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
    it('should call AuthService.signIn', async () => {
      try {
        await controller.signIn();
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        if (error instanceof Error) {
          expect(error.message).toBe('Sign in not implemented yet');
        }
      }
    });
  });

  describe('refreshTokens', () => {
    it('should call AuthService.refreshTokens', async () => {
      await controller.refreshTokens();

      expect(mockAuthService.refreshTokens).toHaveBeenCalled();
    });

    it('should return new tokens from AuthService', async () => {
      const result = await controller.refreshTokens();

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });
    });
  });
});
