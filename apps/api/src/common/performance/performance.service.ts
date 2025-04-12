import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as os from 'os';

interface ResourceUsage {
  timestamp: number;
  memory: {
    total: number;
    used: number;
    free: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
    percentage: number;
    loadAvg: number[];
  };
  system: {
    uptime: number;
    totalMemory: number;
    freeMemory: number;
    cpuCount: number;
  };
}

@Injectable()
export class PerformanceService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceService.name);
  private readonly isProduction: boolean;
  private readonly monitoringInterval: number;
  private readonly cpuUsage: NodeJS.CpuUsage = process.cpuUsage();
  private readonly startTime: number = Date.now();
  private intervalId: NodeJS.Timeout | null = null;
  private prevCpuUsage: NodeJS.CpuUsage = this.cpuUsage;
  private prevTime: number = this.startTime;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.isProduction = process.env.NODE_ENV === 'production';
    // Default to 30 seconds in production, 10 seconds in development
    this.monitoringInterval = this.isProduction
      ? this.configService.get('MONITORING_INTERVAL', 30) * 1000
      : 10 * 1000;
  }

  onModuleInit() {
    // Start monitoring if enabled in config
    if (this.configService.get('MONITORING_ENABLED', 'false') === 'true') {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    if (this.intervalId) {
      return;
    }

    this.logger.log(
      `Starting performance monitoring every ${this.monitoringInterval / 1000}s`,
    );

    this.intervalId = setInterval(() => {
      const usage = this.getResourceUsage();
      this.logUsage(usage);

      // Emit metrics event for any subscribers
      this.eventEmitter.emit('metrics.resource.usage', usage);

      // Check for high resource usage
      this.checkResourceThresholds(usage);
    }, this.monitoringInterval);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.log('Stopped performance monitoring');
    }
  }

  getCurrentUsage(): ResourceUsage {
    return this.getResourceUsage();
  }

  private getResourceUsage(): ResourceUsage {
    const currentTime = Date.now();
    const elapsedMs = currentTime - this.prevTime;

    // Get current CPU usage and calculate delta from previous measurement
    const currentCpuUsage = process.cpuUsage();
    const userCpuUsageMicros = currentCpuUsage.user - this.prevCpuUsage.user;
    const systemCpuUsageMicros =
      currentCpuUsage.system - this.prevCpuUsage.system;

    // Calculate CPU usage percentage (userTime + systemTime) / elapsedTime
    const totalCpuUsageMicros = userCpuUsageMicros + systemCpuUsageMicros;
    const cpuPercentage = (totalCpuUsageMicros / 1000 / elapsedMs) * 100;

    // Update previous values for next calculation
    this.prevCpuUsage = currentCpuUsage;
    this.prevTime = currentTime;

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    return {
      timestamp: currentTime,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpu: {
        user: userCpuUsageMicros,
        system: systemCpuUsageMicros,
        percentage: cpuPercentage,
        loadAvg: os.loadavg(),
      },
      system: {
        uptime: process.uptime(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuCount: os.cpus().length,
      },
    };
  }

  private logUsage(usage: ResourceUsage) {
    if (!this.isProduction) {
      // Detailed logging in development
      this.logger.debug(
        `Memory: ${this.formatBytes(usage.memory.heapUsed)}/${this.formatBytes(usage.memory.heapTotal)} | CPU: ${usage.cpu.percentage.toFixed(1)}% | Load: ${usage.cpu.loadAvg[0].toFixed(2)}`,
      );
    } else {
      // Log only when resource usage exceeds certain thresholds in production
      const cpuThreshold = 70;
      const memoryThreshold = 0.8; // 80% of heap used

      if (
        usage.cpu.percentage > cpuThreshold ||
        usage.memory.heapUsed / usage.memory.heapTotal > memoryThreshold
      ) {
        this.logger.warn(
          `High resource usage - Memory: ${this.formatBytes(usage.memory.heapUsed)}/${this.formatBytes(usage.memory.heapTotal)} | CPU: ${usage.cpu.percentage.toFixed(1)}% | Load: ${usage.cpu.loadAvg[0].toFixed(2)}`,
        );
      }
    }
  }

  private checkResourceThresholds(usage: ResourceUsage) {
    // Check memory usage (90% of heap)
    if (usage.memory.heapUsed / usage.memory.heapTotal > 0.9) {
      this.logger.warn(
        `CRITICAL: Memory usage is very high (${((usage.memory.heapUsed / usage.memory.heapTotal) * 100).toFixed(1)}%)`,
      );
      this.eventEmitter.emit('metrics.alert', {
        type: 'memory',
        level: 'critical',
        value: usage.memory.heapUsed / usage.memory.heapTotal,
        message: `Memory usage is very high (${((usage.memory.heapUsed / usage.memory.heapTotal) * 100).toFixed(1)}%)`,
      });

      // Force garbage collection if --expose-gc flag was used
      if (global.gc) {
        this.logger.warn('Forcing garbage collection');
        global.gc();
      }
    }

    // Check CPU usage (85%)
    if (usage.cpu.percentage > 85) {
      this.logger.warn(
        `CRITICAL: CPU usage is very high (${usage.cpu.percentage.toFixed(1)}%)`,
      );
      this.eventEmitter.emit('metrics.alert', {
        type: 'cpu',
        level: 'critical',
        value: usage.cpu.percentage,
        message: `CPU usage is very high (${usage.cpu.percentage.toFixed(1)}%)`,
      });
    }

    // Check system load (relative to CPU count)
    const loadPerCore = usage.cpu.loadAvg[0] / usage.system.cpuCount;
    if (loadPerCore > 0.8) {
      this.logger.warn(
        `CRITICAL: System load is very high (${loadPerCore.toFixed(2)} per core)`,
      );
      this.eventEmitter.emit('metrics.alert', {
        type: 'load',
        level: 'critical',
        value: loadPerCore,
        message: `System load is very high (${loadPerCore.toFixed(2)} per core)`,
      });
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
