import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import jwtConfig from '../../../auth/config/jwt.config';
import { REQUEST_USER_KEY } from '../../../auth/constants/auth.constants';
import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let mockJwtService: Partial<JwtService>;
  let mockJwtConfig: any;

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };

    mockJwtConfig = {
      secret: 'test_secret',
      audience: 'test_audience',
      issuer: 'test_issuer',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    guard = module.get<AccessTokenGuard>(AccessTokenGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as any;
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
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid_token',
        mockJwtConfig,
      );
    });

    it('should extract token correctly from authorization header', async () => {
      const mockPayload = { sub: 1, email: 'test@example.com' };
      mockRequest.headers.authorization = 'Bearer test_token';
      mockJwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

      await guard.canActivate(mockExecutionContext);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'test_token',
        mockJwtConfig,
      );
    });

    it('should throw UnauthorizedException when authorization header is malformed', async () => {
      mockRequest.headers.authorization = 'InvalidFormat token';

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
