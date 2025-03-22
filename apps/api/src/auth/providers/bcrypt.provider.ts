import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class BcryptProvider implements HashingProvider {
  /**
   * Hashes the given data
   *
   * @param {(string | Buffer)} data
   * @returns {Promise<string>}
   */
  async hashPassword(data: string | Buffer): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(data, salt);
  }

  /**
   * Compares the given data with the encrypted password
   *
   * @param {(string | Buffer)} data
   * @param {string} encrypted
   * @returns {Promise<boolean>}
   */
  comparePassword(data: string | Buffer, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
