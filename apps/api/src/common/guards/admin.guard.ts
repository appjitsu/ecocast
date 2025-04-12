import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface User {
  roles?: string[];
}

interface RequestWithUser extends Request {
  user?: User;
}

/**
 * Guard to protect admin routes
 * Validates admin credentials provided in headers or query params
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has admin role
    const isAdmin = user.roles?.includes('admin');
    if (!isAdmin) {
      throw new UnauthorizedException('User is not an admin');
    }

    return true;
  }
}
