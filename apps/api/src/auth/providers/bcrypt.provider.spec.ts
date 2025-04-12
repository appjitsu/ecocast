import { Test, TestingModule } from '@nestjs/testing';
import { BcryptProvider } from './bcrypt.provider';

// Mock bcrypt before importing
jest.mock('bcrypt', () => {
  return {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
  };
});

// Import bcrypt after mocking
import * as bcrypt from 'bcrypt';

describe('BcryptProvider', () => {
  let provider: BcryptProvider;

  // Cast the mocked functions with proper type
  const mockBcrypt = bcrypt as unknown as {
    genSalt: jest.Mock;
    hash: jest.Mock;
    compare: jest.Mock;
  };

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptProvider],
    }).compile();

    provider = module.get<BcryptProvider>(BcryptProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should generate salt and hash password', async () => {
      const mockSalt = 'test_salt';
      const password = 'test_password';
      const hashedPassword = 'hashed_password';

      mockBcrypt.genSalt.mockResolvedValue(mockSalt);
      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await provider.hashPassword(password);

      expect(mockBcrypt.genSalt).toHaveBeenCalled();
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(hashedPassword);
    });

    it('should handle Buffer input', async () => {
      const mockSalt = 'test_salt';
      const password = Buffer.from('test_password');
      const hashedPassword = 'hashed_password';

      mockBcrypt.genSalt.mockResolvedValue(mockSalt);
      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await provider.hashPassword(password);

      expect(mockBcrypt.genSalt).toHaveBeenCalled();
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should compare plain text password with encrypted password', async () => {
      const plainTextPassword = 'test_password';
      const encryptedPassword = 'encrypted_password';

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await provider.comparePassword(
        plainTextPassword,
        encryptedPassword,
      );

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        plainTextPassword,
        encryptedPassword,
      );
      expect(result).toBe(true);
    });

    it('should handle Buffer input', async () => {
      const plainTextPassword = Buffer.from('test_password');
      const encryptedPassword = 'encrypted_password';

      mockBcrypt.compare.mockResolvedValue(true);

      const result = await provider.comparePassword(
        plainTextPassword,
        encryptedPassword,
      );

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        plainTextPassword,
        encryptedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const plainTextPassword = 'wrong_password';
      const encryptedPassword = 'encrypted_password';

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await provider.comparePassword(
        plainTextPassword,
        encryptedPassword,
      );

      expect(result).toBe(false);
    });
  });
});
