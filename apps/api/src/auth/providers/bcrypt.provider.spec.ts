import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { BcryptProvider } from './bcrypt.provider';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('BcryptProvider', () => {
  let provider: BcryptProvider;

  beforeEach(async () => {
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

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await provider.hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(hashedPassword);
    });

    it('should handle Buffer input', async () => {
      const mockSalt = 'test_salt';
      const password = Buffer.from('test_password');
      const hashedPassword = 'hashed_password';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await provider.hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should compare plain text password with encrypted password', async () => {
      const plainTextPassword = 'test_password';
      const encryptedPassword = 'encrypted_password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await provider.comparePassword(
        plainTextPassword,
        encryptedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainTextPassword,
        encryptedPassword,
      );
      expect(result).toBe(true);
    });

    it('should handle Buffer input', async () => {
      const plainTextPassword = Buffer.from('test_password');
      const encryptedPassword = 'encrypted_password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await provider.comparePassword(
        plainTextPassword,
        encryptedPassword,
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        plainTextPassword,
        encryptedPassword,
      );
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const plainTextPassword = 'wrong_password';
      const encryptedPassword = 'encrypted_password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await provider.comparePassword(
        plainTextPassword,
        encryptedPassword,
      );

      expect(result).toBe(false);
    });
  });
});
