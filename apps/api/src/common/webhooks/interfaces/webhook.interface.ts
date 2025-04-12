/**
 * Webhook entity representing a registered webhook endpoint
 */
export interface Webhook {
  /**
   * Unique ID for the webhook
   */
  id: string;

  /**
   * URL to send webhook events to
   */
  url: string;

  /**
   * Secret used to sign webhook payloads for verification
   */
  secret: string;

  /**
   * Event types this webhook should receive
   */
  events: string[];

  /**
   * Description of the webhook (optional)
   */
  description?: string;

  /**
   * Whether the webhook is active
   */
  isActive: boolean;

  /**
   * Number of times delivery has been attempted
   */
  deliveryAttempts?: number;

  /**
   * Timestamp of the last successful delivery
   */
  lastSuccessfulDelivery?: Date;

  /**
   * Timestamp of the last failed delivery
   */
  lastFailedDelivery?: Date;

  /**
   * Error message from the last failed delivery
   */
  lastErrorMessage?: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Base webhook payload containing common fields for all events
 */
export interface WebhookPayload<T = unknown> {
  /**
   * Unique ID for this webhook event
   */
  id: string;

  /**
   * Type of event (e.g., 'cast.created', 'user.updated')
   */
  event: string;

  /**
   * Timestamp when the event occurred
   */
  timestamp: number;

  /**
   * Event data
   */
  data: T;

  /**
   * API version that generated the webhook
   */
  apiVersion: string;
}

/**
 * Webhook job data passed to the job queue
 */
export interface WebhookJobData<T = unknown> {
  /**
   * Webhook ID to deliver to
   */
  webhookId: string;

  /**
   * Webhook URL
   */
  webhookUrl: string;

  /**
   * Webhook secret for signing
   */
  webhookSecret: string;

  /**
   * Payload to deliver
   */
  payload: WebhookPayload<T>;

  /**
   * Retry attempt number
   */
  attempt: number;

  /**
   * Original event timestamp
   */
  timestamp: number;
}

/**
 * Result of a webhook delivery attempt
 */
export interface WebhookDeliveryResult {
  /**
   * Unique ID for this delivery attempt
   */
  id: string;

  /**
   * Webhook ID
   */
  webhookId: string;

  /**
   * Event type
   */
  event: string;

  /**
   * Whether delivery was successful
   */
  success: boolean;

  /**
   * HTTP status code from response
   */
  statusCode?: number;

  /**
   * Response body from webhook endpoint
   */
  response?: string;

  /**
   * Error message if delivery failed
   */
  error?: string;

  /**
   * Duration of the request in milliseconds
   */
  duration: number;

  /**
   * Request timestamp
   */
  timestamp: Date;
}
