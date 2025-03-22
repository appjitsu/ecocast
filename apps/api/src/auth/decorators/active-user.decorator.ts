import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUser as IActiveUser } from '@repo/types';
import { REQUEST_USER_KEY } from '../constants/auth.constants';

interface RequestWithUser extends Request {
  [REQUEST_USER_KEY]: IActiveUser;
}

export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request[REQUEST_USER_KEY];

    return field ? user?.[field] : user;
  },
);
