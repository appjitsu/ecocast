import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyStrategy {
  constructor(private readonly configService: ConfigService) {}

  validate(apiKey: string): boolean {
    const validApiKey = this.configService.get<string>('API_KEY');
    return apiKey === validApiKey;
  }
}
