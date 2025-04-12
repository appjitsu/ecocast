import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { REQUEST_USER_KEY } from '../../../auth/constants/auth.constants';
import { AccessTokenGuard } from './access-token.guard';

interface MockRequest {
  headers: {
    authorization?: string;
  };
  [REQUEST_USER_KEY]?: unknown;
}

interface JwtConfig {
  secret: string | undefined;
  audience: string;
  issuer: string;
  accessTokenTtl: number;
  refreshTokenTtl: number;
  googleClientId: string | undefined;
  googleClientSecret: string | undefined;
}

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let mockJwtService: JwtService;
  let mockJwtConfig: JwtConfig;

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    mockJwtConfig = {
      secret: 'test_secret',
      audience: 'test_audience',
      issuer: 'test_issuer',
      accessTokenTtl: 3600,
      refreshTokenTtl: 86400,
      googleClientId: 'test-client-id',
      googleClientSecret: 'test-client-secret',
    };

    guard = new AccessTokenGuard(mockJwtService, mockJwtConfig);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: MockRequest;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      } as unknown as ExecutionContext;
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      mockRequest.headers.authorization = 'Bearer invalid_token';
      mockJwtService.verifyAsync = jest.fn().mockRejectedValue(new Error());

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true and set user payload when token is valid', async () => {
      const mockPayload = { sub: 1, email: 'test@example.com' };
      mockRequest.headers.authorization = 'Bearer valid_token';
      mockJwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest[REQUEST_USER_KEY]).toEqual(mockPayload);
    });

    it('should extract token correctly from authorization header', async () => {
      const mockPayload = { sub: 1, email: 'test@example.com' };
      mockRequest.headers.authorization = 'Bearer valid_token';
      mockJwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

      await guard.canActivate(mockExecutionContext);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid_token',
        mockJwtConfig,
      );
    });

    it('should throw UnauthorizedException when authorization header is malformed', async () => {
      mockRequest.headers.authorization = 'InvalidFormat';

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
