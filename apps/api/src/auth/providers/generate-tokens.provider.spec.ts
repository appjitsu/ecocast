import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/user.entity';
import jwtConfig from '../config/jwt.config';
import { GenerateTokensProvider } from './generate-tokens.provider';

describe('GenerateTokensProvider', () => {
  let provider: GenerateTokensProvider;
  let mockJwtService: Partial<JwtService>;
  let mockJwtConfig: Partial<ConfigType<typeof jwtConfig>>;

  beforeEach(async () => {
    mockJwtService = {
      signAsync: jest.fn(),
    };

    mockJwtConfig = {
      secret: 'test_secret',
      issuer: 'test_issuer',
      audience: 'test_audience',
      accessTokenTtl: 3600,
      refreshTokenTtl: 86400,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateTokensProvider,
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

    provider = module.get<GenerateTokensProvider>(GenerateTokensProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('signToken', () => {
    it('should sign token with correct parameters', async () => {
      const userId = 1;
      const expiresIn = 3600;
      const payload = { email: 'test@example.com' };
      const expectedToken = 'signed_token';

      (mockJwtService.signAsync as jest.Mock).mockResolvedValue(expectedToken);

      const result = await provider.signToken(userId, expiresIn, payload);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: userId,
          ...payload,
        },
        {
          secret: mockJwtConfig.secret,
          issuer: mockJwtConfig.issuer,
          audience: mockJwtConfig.audience,
          expiresIn: expiresIn,
        },
      );
      expect(result).toBe(expectedToken);
    });

    it('should sign token without additional payload', async () => {
      const userId = 1;
      const expiresIn = 3600;
      const expectedToken = 'signed_token';

      (mockJwtService.signAsync as jest.Mock).mockResolvedValue(expectedToken);

      const result = await provider.signToken(userId, expiresIn);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: userId,
        },
        {
          secret: mockJwtConfig.secret,
          issuer: mockJwtConfig.issuer,
          audience: mockJwtConfig.audience,
          expiresIn: expiresIn,
        },
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
      } as User;

      const mockAccessToken = 'access_token';
      const mockRefreshToken = 'refresh_token';

      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      const result = await provider.generateTokens(user);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: mockJwtConfig.secret,
          issuer: mockJwtConfig.issuer,
          audience: mockJwtConfig.audience,
          expiresIn: mockJwtConfig.accessTokenTtl,
        },
      );
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          sub: user.id,
        },
        {
          secret: mockJwtConfig.secret,
          issuer: mockJwtConfig.issuer,
          audience: mockJwtConfig.audience,
          expiresIn: mockJwtConfig.refreshTokenTtl,
        },
      );
      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
      });
    });
  });
});
