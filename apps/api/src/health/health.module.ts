import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import {
  CustomDatabaseHealthIndicator,
  HealthController,
} from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [CustomDatabaseHealthIndicator],
})
export class HealthModule {}
