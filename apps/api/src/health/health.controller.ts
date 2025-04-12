import { Controller, Get, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicator,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { AuthType } from '@repo/types';
import { Connection, QueryRunner } from 'typeorm';
import { Auth } from '../auth/decorators/auth.decorator';

interface PoolStats {
  used: number | 'unknown';
  size: number | 'unknown';
  free: number | 'unknown';
  pending: number | 'unknown';
}

interface HealthData {
  message?: string;
  responseTime?: string;
  poolStats?: PoolStats;
}

interface DatabasePool {
  used?: number;
  size?: number;
  pending?: number;
}

// Add this interface for database driver with pool
interface DatabaseDriver {
  pool?: DatabasePool;
  [key: string]: unknown;
}

@Injectable()
export class CustomDatabaseHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(CustomDatabaseHealthIndicator.name);

  constructor(@InjectConnection() private connection: Connection) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Create a query runner to perform checks
      const queryRunner: QueryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();

      // Check if we can execute a query
      const startTime = Date.now();
      await queryRunner.query('SELECT 1');
      const queryTime = Date.now() - startTime;

      // Get connection statistics if available
      const poolStats: PoolStats = {
        used: 'unknown',
        size: 'unknown',
        free: 'unknown',
        pending: 'unknown',
      };

      // Try to access pool stats safely
      try {
        const driver = this.connection.driver as unknown as DatabaseDriver;
        const pool = driver.pool;
        if (pool && typeof pool === 'object') {
          if (typeof pool.used === 'number') poolStats.used = pool.used;
          if (typeof pool.size === 'number') {
            poolStats.size = pool.size;
            if (typeof pool.used === 'number') {
              poolStats.free = pool.size - pool.used;
            }
          }
          if (typeof pool.pending === 'number')
            poolStats.pending = pool.pending;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.logger.warn('Could not get pool statistics: ' + error.message);
        }
      }

      // Release the query runner
      await queryRunner.release();

      return this.getStatus(key, true, {
        responseTime: `${queryTime}ms`,
        poolStats,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Database health check failed: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return this.getStatus(key, false, {
        message: errorMessage,
      });
    }
  }

  private getPoolStats(): PoolStats {
    try {
      const driver = this.connection.driver as unknown as DatabaseDriver;
      const pool = driver.pool;
      if (!pool) {
        return {
          used: 'unknown',
          size: 'unknown',
          free: 'unknown',
          pending: 'unknown',
        };
      }

      return {
        used: pool.used || 0,
        size: pool.size || 0,
        free: pool.size && pool.used ? pool.size - pool.used : 0,
        pending: pool.pending || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get pool stats:', error);
      return {
        used: 'unknown',
        size: 'unknown',
        free: 'unknown',
        pending: 'unknown',
      };
    }
  }
}

@Controller('health')
@ApiTags('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private customDb: CustomDatabaseHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({
    status: 200,
    description: 'Health check is successful',
  })
  @ApiResponse({
    status: 503,
    description: 'One or more health checks failed',
  })
  async check(): Promise<HealthCheckResult> {
    this.logger.log('Performing health check');
    const heapUsedThreshold = 1024 * 1024 * 500; // 500MB
    const memoryRssThreshold = 1024 * 1024 * 1000; // 1GB
    const diskStorageThreshold = 10 * 1024 * 1024 * 1024; // 10GB free space
    const diskPath = '/'; // Check root path

    return this.health.check([
      // Database check using custom indicator
      () => this.customDb.isHealthy('database'),

      // Memory check (heap and RSS)
      () => this.memory.checkHeap('memory_heap', heapUsedThreshold),
      () => this.memory.checkRSS('memory_rss', memoryRssThreshold),

      // Disk space check
      () =>
        this.disk.checkStorage('disk', {
          threshold: diskStorageThreshold,
          path: diskPath,
        }),
    ]);
  }

  private getStatus(
    key: string,
    isHealthy: boolean,
    data: HealthData = {},
  ): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data,
      },
    };
  }
}
