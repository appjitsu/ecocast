import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  ActiveUser as IActiveUser,
  REQUEST_USER_KEY,
  RequestWithUser,
} from '@repo/types';

export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request[REQUEST_USER_KEY];

    return field ? user?.[field] : user;
  },
);
