import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('API_KEY');

    if (!validApiKey) {
      return true; // If no API key is configured, allow all requests
    }

    return apiKey === validApiKey;
  }
}
