import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashingProvider } from './hashing.provider';

interface BcryptModule {
  genSalt(): Promise<string>;
  hash(data: string | Buffer, salt: string): Promise<string>;
  compare(data: string | Buffer, encrypted: string): Promise<boolean>;
}

@Injectable()
export class BcryptProvider implements HashingProvider {
  private readonly bcrypt: BcryptModule = bcrypt as unknown as BcryptModule;

  /**
   * Hashes the given data
   *
   * @param {(string | Buffer)} data
   * @returns {Promise<string>}
   */
  async hashPassword(data: string | Buffer): Promise<string> {
    const salt = await this.bcrypt.genSalt();
    return this.bcrypt.hash(data, salt);
  }

  /**
   * Compares the given data with the encrypted password
   *
   * @param {(string | Buffer)} data
   * @param {string} encrypted
   * @returns {Promise<boolean>}
   */
  comparePassword(data: string | Buffer, encrypted: string): Promise<boolean> {
    return this.bcrypt.compare(data, encrypted);
  }
}
