import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as os from 'os';
import { PerformanceService } from '../performance/performance.service';

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

interface ResponseTimePayload {
  path: string;
  responseTime: number;
  statusCode?: number;
}

interface SlowResponsePayload {
  path: string;
}

interface SlowQueryPayload {
  query: string;
  time: number;
}

interface QueryErrorPayload {
  error: string;
}

interface ApiErrorPayload {
  errorType?: string;
  statusCode?: number;
}

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);
  private metrics: MetricsData;
  private readonly maxSlowQueries: number;
  private readonly maxErrorMessages: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly performanceService: PerformanceService,
  ) {
    this.maxSlowQueries = this.configService.get(
      'METRICS_MAX_SLOW_QUERIES',
      50,
    );
    this.maxErrorMessages = this.configService.get(
      'METRICS_MAX_ERROR_MESSAGES',
      50,
    );

    // Initialize metrics data
    this.resetMetrics();
  }

  onModuleInit() {
    this.logger.log('Metrics service initialized');
  }

  @OnEvent('api.response.time')
  handleResponseTime(payload: ResponseTimePayload) {
    // Get the route pattern by simplifying the path (replace IDs with :id)
    const routePattern = this.simplifyPath(payload.path);

    // Get or create route stats
    if (!this.metrics.responseTimes.routeStats[routePattern]) {
      this.metrics.responseTimes.routeStats[routePattern] = {
        count: 0,
        totalTime: 0,
        min: Number.MAX_SAFE_INTEGER,
        max: 0,
        avg: 0,
        statusCodes: {},
      };
    }

    const stats = this.metrics.responseTimes.routeStats[routePattern];
    stats.count++;
    stats.totalTime += payload.responseTime;
    stats.min = Math.min(stats.min, payload.responseTime);
    stats.max = Math.max(stats.max, payload.responseTime);
    stats.avg = stats.totalTime / stats.count;

    // Count status codes
    const statusCode = payload.statusCode || 200;
    stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
  }

  @OnEvent('api.response.slow')
  handleSlowResponse(payload: SlowResponsePayload) {
    const routePattern = this.simplifyPath(payload.path);

    // Increment slow response count
    this.metrics.responseTimes.slow.count++;

    // Add or increment route count
    this.metrics.responseTimes.slow.routes[routePattern] =
      (this.metrics.responseTimes.slow.routes[routePattern] || 0) + 1;
  }

  @OnEvent('database.query.slow')
  handleSlowQuery(payload: SlowQueryPayload) {
    // Track slow query
    this.metrics.database.queries.slow.count++;

    // Save query with time for analysis (limit to max)
    if (
      this.metrics.database.queries.slow.queries.length < this.maxSlowQueries
    ) {
      this.metrics.database.queries.slow.queries.push(
        `[${payload.time}ms] ${payload.query}`,
      );
    }

    // Add query execution time to total
    this.metrics.database.queries.totalTime += payload.time;
    this.metrics.database.queries.count++;
  }

  @OnEvent('database.query.error')
  handleQueryError(payload: QueryErrorPayload) {
    // Track database error
    this.metrics.database.queries.errors.count++;

    // Save error message for analysis (limit to max)
    if (
      this.metrics.database.queries.errors.messages.length <
      this.maxErrorMessages
    ) {
      this.metrics.database.queries.errors.messages.push(payload.error);
    }
  }

  @OnEvent('api.error')
  handleApiError(payload: ApiErrorPayload) {
    // Track API error
    this.metrics.errors.count++;

    // Track by error type
    const errorType = payload.errorType || 'unknown';
    this.metrics.errors.byType[errorType] =
      (this.metrics.errors.byType[errorType] || 0) + 1;

    // Track by status code
    const statusCode = payload.statusCode || 500;
    this.metrics.errors.byStatusCode[statusCode] =
      (this.metrics.errors.byStatusCode[statusCode] || 0) + 1;
  }

  /**
   * Get all metrics
   */
  getMetrics(): MetricsData {
    // Update system metrics before returning
    this.updateSystemMetrics();
    return this.metrics;
  }

  /**
   * Get system metrics
   */
  getSystemMetrics() {
    this.updateSystemMetrics();
    return {
      system: this.metrics.system,
      timestamp: Date.now(),
    };
  }

  /**
   * Get database metrics
   */
  getDatabaseMetrics() {
    return {
      database: this.metrics.database,
      timestamp: Date.now(),
    };
  }

  /**
   * Get response time metrics
   */
  getResponseTimeMetrics() {
    return {
      responseTimes: this.metrics.responseTimes,
      timestamp: Date.now(),
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    this.metrics = {
      timestamp: Date.now(),
      responseTimes: {
        routeStats: {},
        slow: {
          count: 0,
          routes: {},
        },
      },
      database: {
        queries: {
          count: 0,
          totalTime: 0,
          slow: {
            count: 0,
            queries: [],
          },
          errors: {
            count: 0,
            messages: [],
          },
        },
      },
      errors: {
        count: 0,
        byType: {},
        byStatusCode: {},
      },
      system: {
        memory: {
          total: 0,
          free: 0,
          used: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
          rss: 0,
        },
        cpu: {
          loadAvg: [0, 0, 0],
          cpus: os.cpus().length,
        },
        uptime: 0,
      },
    };

    this.updateSystemMetrics();

    return { message: 'Metrics reset successfully', timestamp: Date.now() };
  }

  /**
   * Update system metrics with current values
   */
  private updateSystemMetrics() {
    // Get resource usage from performance service
    const resourceUsage = this.performanceService.getCurrentUsage();

    // Update system metrics
    this.metrics.system = {
      memory: {
        total: resourceUsage.memory.total,
        free: resourceUsage.memory.free,
        used: resourceUsage.memory.used,
        heapTotal: resourceUsage.memory.heapTotal,
        heapUsed: resourceUsage.memory.heapUsed,
        external: resourceUsage.memory.external,
        rss: resourceUsage.memory.rss,
      },
      cpu: {
        loadAvg: resourceUsage.cpu.loadAvg,
        cpus: resourceUsage.system.cpuCount,
      },
      uptime: resourceUsage.system.uptime,
    };

    // Update timestamp
    this.metrics.timestamp = Date.now();
  }

  /**
   * Simplify path by replacing IDs with :id for better grouping
   */
  private simplifyPath(path: string): string {
    if (!path) return 'unknown';

    // UUID pattern
    const uuidPattern =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

    // Numeric ID pattern
    const numericIdPattern = /\/\d+/g;

    // Replace known patterns
    return path.replace(uuidPattern, ':id').replace(numericIdPattern, '/:id');
  }
}
