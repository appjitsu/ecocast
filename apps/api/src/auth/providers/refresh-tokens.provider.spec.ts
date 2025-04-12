import { UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../users/user.entity';
import jwtConfig from '../config/jwt.config';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { RefreshTokensProvider } from './refresh-tokens.provider';

describe('RefreshTokensProvider', () => {
  let provider: RefreshTokensProvider;
  let mockJwtService: Partial<JwtService>;
  let mockUsersService: Partial<UsersService>;
  let mockGenerateTokensProvider: Partial<GenerateTokensProvider>;
  let mockJwtConfig: Partial<ConfigType<typeof jwtConfig>>;

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };

    mockUsersService = {
      findOneById: jest.fn(),
    };

    mockGenerateTokensProvider = {
      generateTokens: jest.fn(),
    };

    mockJwtConfig = {
      secret: 'test_secret',
      issuer: 'test_issuer',
      audience: 'test_audience',
      accessTokenTtl: 3600,
      refreshTokenTtl: 86400,
      googleClientId: 'google_client_id',
      googleClientSecret: 'google_client_secret',
    };

    provider = new RefreshTokensProvider(
      mockJwtService as JwtService,
      mockJwtConfig as ConfigType<typeof jwtConfig>,
      mockGenerateTokensProvider as GenerateTokensProvider,
      mockUsersService as UsersService,
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('refreshTokens', () => {
    const mockRefreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid_refresh_token',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
    } as User;

    const mockTokens = {
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
    };

    it('should refresh tokens successfully', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: mockUser.id,
      });
      mockUsersService.findOneById = jest.fn().mockResolvedValue(mockUser);
      mockGenerateTokensProvider.generateTokens = jest
        .fn()
        .mockResolvedValue(mockTokens);

      const result = await provider.refreshTokens(mockRefreshTokenDto);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        mockRefreshTokenDto.refreshToken,
        {
          secret: mockJwtConfig.secret,
          audience: mockJwtConfig.audience,
          issuer: mockJwtConfig.issuer,
        },
      );
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(mockUser.id);
      expect(mockGenerateTokensProvider.generateTokens).toHaveBeenCalledWith(
        mockUser,
      );
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      mockJwtService.verifyAsync = jest.fn().mockRejectedValue(new Error());

      await expect(provider.refreshTokens(mockRefreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: mockUser.id,
      });
      mockUsersService.findOneById = jest.fn().mockResolvedValue(null);

      await expect(provider.refreshTokens(mockRefreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token generation fails', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: mockUser.id,
      });
      mockUsersService.findOneById = jest.fn().mockResolvedValue(mockUser);
      mockGenerateTokensProvider.generateTokens = jest
        .fn()
        .mockRejectedValue(new Error());

      await expect(provider.refreshTokens(mockRefreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
