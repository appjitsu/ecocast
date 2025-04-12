import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that uses Passport's API Key authentication strategy
 * Protects routes with API key authentication
 */
@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api-key') {}
