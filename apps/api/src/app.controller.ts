import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as os from 'os';
import { AppService } from './app.service';

@ApiTags('system')
@Controller()
export class AppController {
  private startTime = Date.now();
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Check system health' })
  @Get('/health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.1',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        free: os.freemem(),
        total: os.totalmem(),
      },
      hostname: os.hostname(),
    };
  }
}
