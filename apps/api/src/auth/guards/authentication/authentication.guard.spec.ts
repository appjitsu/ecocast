import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthType } from '@repo/types';
import { AUTH_TYPE_KEY } from '../../constants/auth.constants';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { ApiKeyGuard } from '../api-key/api-key.guard';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let mockReflector: Partial<Reflector>;
  let mockAccessTokenGuard: Partial<AccessTokenGuard>;
  let mockApiKeyGuard: Partial<ApiKeyGuard>;

  beforeEach(async () => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    mockAccessTokenGuard = {
      canActivate: jest.fn(),
    };

    mockApiKeyGuard = {
      canActivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: AccessTokenGuard,
          useValue: mockAccessTokenGuard,
        },
        {
          provide: ApiKeyGuard,
          useValue: mockApiKeyGuard,
        },
      ],
    }).compile();

    guard = module.get<AuthenticationGuard>(AuthenticationGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToHttp: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as ExecutionContext;
    });

    it('should return true when auth type is None', async () => {
      mockReflector.getAllAndOverride = jest
        .fn()
        .mockReturnValue([AuthType.None]);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should use Bearer auth type when no auth type is provided', async () => {
      mockReflector.getAllAndOverride = jest.fn().mockReturnValue(null);
      mockAccessTokenGuard.canActivate = jest.fn().mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockAccessTokenGuard.canActivate).toHaveBeenCalledWith(
        mockExecutionContext,
      );
    });

    it('should throw UnauthorizedException when all guards fail', async () => {
      mockReflector.getAllAndOverride = jest
        .fn()
        .mockReturnValue([AuthType.Bearer]);
      mockAccessTokenGuard.canActivate = jest
        .fn()
        .mockRejectedValue(new Error());

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true when any guard succeeds', async () => {
      mockReflector.getAllAndOverride = jest
        .fn()
        .mockReturnValue([AuthType.Bearer]);
      mockAccessTokenGuard.canActivate = jest.fn().mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should get auth types from both handler and class', async () => {
      mockReflector.getAllAndOverride = jest
        .fn()
        .mockReturnValue([AuthType.Bearer]);
      mockAccessTokenGuard.canActivate = jest.fn().mockResolvedValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        AUTH_TYPE_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
    });
  });
});
