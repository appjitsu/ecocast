import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PerformanceService } from './performance.service';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      // Global event emitter with wildcard support
      wildcard: true,
      // Maximum number of listeners for any single event
      maxListeners: 20,
      // Set to true to log warning if listeners exceed maxListeners
      verboseMemoryLeak: process.env.NODE_ENV !== 'production',
    }),
  ],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
