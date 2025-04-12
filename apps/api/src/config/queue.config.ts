import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  // Queue configuration
  keyPrefix: process.env.QUEUE_KEY_PREFIX || 'ecocast:jobs:',

  // Job retry configuration
  defaultRetryAttempts: parseInt(
    process.env.QUEUE_DEFAULT_RETRY_ATTEMPTS || '3',
    10,
  ),
  maxRetryAttempts: parseInt(process.env.QUEUE_MAX_RETRY_ATTEMPTS || '5', 10),

  // Job timeout configuration (in milliseconds)
  defaultJobTimeout: parseInt(
    process.env.QUEUE_DEFAULT_JOB_TIMEOUT || '30000',
    10,
  ), // 30 seconds
  longJobTimeout: parseInt(process.env.QUEUE_LONG_JOB_TIMEOUT || '300000', 10), // 5 minutes

  // Job retention configuration
  keepCompletedJobs: process.env.QUEUE_KEEP_COMPLETED_JOBS === 'true',
  keepFailedJobs: parseInt(process.env.QUEUE_KEEP_FAILED_JOBS || '500', 10), // Keep last 500 failed jobs

  // Concurrent job processing limits
  concurrency: {
    email: parseInt(process.env.QUEUE_EMAIL_CONCURRENCY || '5', 10),
    reports: parseInt(process.env.QUEUE_REPORTS_CONCURRENCY || '2', 10),
    dataProcessing: parseInt(
      process.env.QUEUE_DATA_PROCESSING_CONCURRENCY || '3',
      10,
    ),
    notifications: parseInt(
      process.env.QUEUE_NOTIFICATIONS_CONCURRENCY || '10',
      10,
    ),
  },

  // Queue monitoring
  monitoringEnabled: process.env.QUEUE_MONITORING_ENABLED === 'true',
  monitoringEndpoint: process.env.QUEUE_MONITORING_ENDPOINT || '/admin/queues',
  monitoringAuth: {
    enabled: process.env.QUEUE_MONITORING_AUTH_ENABLED === 'true',
    username: process.env.QUEUE_MONITORING_USERNAME || 'admin',
    password: process.env.QUEUE_MONITORING_PASSWORD || 'admin',
  },
}));
