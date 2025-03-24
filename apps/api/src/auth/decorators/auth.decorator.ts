import { SetMetadata } from '@nestjs/common';
import { AuthType } from '@repo/types';
import { AUTH_TYPE_KEY } from '../constants/auth.constants';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
