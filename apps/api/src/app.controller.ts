import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as os from 'os';

@ApiTags('system')
@Controller()
export class AppController {
  private startTime = Date.now();

  @ApiOperation({ summary: 'Check system health' })
  @Get('/health')
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
