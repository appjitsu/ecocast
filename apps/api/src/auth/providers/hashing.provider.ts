import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingProvider {
  /**
   * Hashes the given data
   *
   * @abstract
   * @param {(string | Buffer)} data
   * @returns {Promise<string>}
   */
  abstract hashPassword(data: string | Buffer): Promise<string>;

  /**
   * Compares the given data with the encrypted password
   *
   * @abstract
   * @param {(string | Buffer)} data
   * @param {string} encrypted
   * @returns {Promise<boolean>}
   */
  abstract comparePassword(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean>;
}
