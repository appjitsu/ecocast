import { Test, TestingModule } from '@nestjs/testing';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { GoogleAuthenticationController } from './google-authentication.controller';
import { GoogleAuthenticationService } from './providers/google-authentication.service';

describe('GoogleAuthenticationController', () => {
  let controller: GoogleAuthenticationController;
  let mockGoogleAuthenticationService: Partial<GoogleAuthenticationService>;

  beforeEach(async () => {
    mockGoogleAuthenticationService = {
      authenticate: jest.fn().mockResolvedValue({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleAuthenticationController],
      providers: [
        {
          provide: GoogleAuthenticationService,
          useValue: mockGoogleAuthenticationService,
        },
      ],
    }).compile();

    controller = module.get<GoogleAuthenticationController>(
      GoogleAuthenticationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('authenticate', () => {
    it('should call GoogleAuthenticationService.authenticate with correct parameters', async () => {
      const googleTokenDto: GoogleTokenDto = {
        token: 'valid_google_token',
      };

      await controller.authenticate(googleTokenDto);

      expect(mockGoogleAuthenticationService.authenticate).toHaveBeenCalledWith(
        googleTokenDto,
      );
    });

    it('should return tokens from GoogleAuthenticationService', async () => {
      const googleTokenDto: GoogleTokenDto = {
        token: 'valid_google_token',
      };

      const result = await controller.authenticate(googleTokenDto);

      expect(result).toEqual({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      });
    });
  });
});
