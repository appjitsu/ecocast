import type { Request } from 'express';
import { ActiveUser } from './active-user';

/**
 * Enum representing different types of authentication methods
 */
export enum AuthType {
  Bearer = 'Bearer',
  None = 'None',
  ApiKey = 'ApiKey',
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

/**
 * Interface for API client information
 */
export interface ApiClient {
  id: number;
  name: string;
  roles: string[];
  isApiClient: boolean;
}
