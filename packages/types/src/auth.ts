import type { Request } from 'express';
import { ActiveUser } from './active-user';

/**
 * Enum representing different types of authentication methods
 */
export enum AuthType {
  Bearer = 'Bearer',
  None = 'None',
}

/**
 * Interface for authentication tokens
 */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/**
 * Key for storing the authenticated user in the request object
 */
export const REQUEST_USER_KEY = 'user' as const;

/**
 * Interface for requests that include an authenticated user
 */
export interface RequestWithUser extends Request {
  [REQUEST_USER_KEY]: ActiveUser;
}
