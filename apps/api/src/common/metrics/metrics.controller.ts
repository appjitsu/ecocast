import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IpWhitelistGuard } from '../guards/ip-whitelist.guard';
import { MetricsService } from './metrics.service';

interface MetricsData {
  timestamp: number;
  responseTimes: {
    routeStats: Record<
      string,
      {
        count: number;
        totalTime: number;
        min: number;
        max: number;
        avg: number;
        statusCodes: Record<number, number>;
      }
    >;
    slow: {
      count: number;
      routes: Record<string, number>;
    };
  };
  database: {
    queries: {
      count: number;
      totalTime: number;
      slow: {
        count: number;
        queries: string[];
      };
      errors: {
        count: number;
        messages: string[];
      };
    };
  };
  errors: {
    count: number;
    byType: Record<string, number>;
    byStatusCode: Record<number, number>;
  };
  system: {
    memory: {
      total: number;
      free: number;
      used: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      rss: number;
    };
    cpu: {
      loadAvg: number[];
      cpus: number;
    };
    uptime: number;
  };
}

@Controller('metrics')
@ApiTags('metrics')
@UseGuards(IpWhitelistGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({
    status: 200,
    description: 'Current application metrics',
  })
  getMetrics(): MetricsData {
    return this.metricsService.getMetrics();
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({
    status: 200,
    description: 'Current system metrics',
  })
  getSystemMetrics(): Pick<MetricsData, 'system' | 'timestamp'> {
    return this.metricsService.getSystemMetrics();
  }

  @Get('database')
  @ApiOperation({ summary: 'Get database metrics' })
  @ApiResponse({
    status: 200,
    description: 'Current database metrics',
  })
  getDatabaseMetrics(): Pick<MetricsData, 'database' | 'timestamp'> {
    return this.metricsService.getDatabaseMetrics();
  }

  @Get('response-times')
  @ApiOperation({ summary: 'Get API response time metrics' })
  @ApiResponse({
    status: 200,
    description: 'API response time metrics',
  })
  getResponseTimeMetrics(): Pick<MetricsData, 'responseTimes' | 'timestamp'> {
    return this.metricsService.getResponseTimeMetrics();
  }

  @Get('reset')
  @ApiOperation({ summary: 'Reset metrics collection' })
  @ApiResponse({
    status: 200,
    description: 'Metrics reset successfully',
  })
  resetMetrics() {
    return this.metricsService.resetMetrics();
  }
}
