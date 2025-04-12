import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiVersion } from '../decorators/api-version.decorator';
import { WebhookEntity } from './entities/webhook.entity';
import { WebhookPayload } from './interfaces/webhook.interface';

interface WebhookError extends Error {
  code?: string;
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
}

/**
 * Service for managing webhooks and dispatching events
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly apiUrl: string;

  constructor(
    @InjectRepository(WebhookEntity)
    private webhooksRepository: Repository<WebhookEntity>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>(
      'app.apiUrl',
      'https://api.ecocast.com',
    );
  }

  /**
   * Create a new webhook subscription
   */
  async createWebhook(
    url: string,
    events: string[],
    description?: string,
  ): Promise<WebhookEntity> {
    const webhook = new WebhookEntity();
    webhook.id = uuidv4();
    webhook.url = url;
    webhook.events = events;
    webhook.description = description || '';
    webhook.secret = this.generateWebhookSecret();
    webhook.isActive = true;

    this.logger.log(
      `Creating webhook for URL: ${url} with events: ${events.join(', ')}`,
    );

    return this.webhooksRepository.save(webhook);
  }

  /**
   * Get a webhook by ID
   */
  async getWebhookById(id: string): Promise<WebhookEntity | null> {
    return this.webhooksRepository.findOne({ where: { id } });
  }

  /**
   * Update a webhook
   */
  async updateWebhook(
    id: string,
    data: Partial<
      Pick<WebhookEntity, 'url' | 'events' | 'description' | 'isActive'>
    >,
  ): Promise<WebhookEntity | null> {
    await this.webhooksRepository.update(id, data);
    return this.getWebhookById(id);
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<boolean> {
    const result = await this.webhooksRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * List all webhooks
   */
  async listWebhooks(): Promise<WebhookEntity[]> {
    return this.webhooksRepository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Regenerate webhook secret
   */
  async regenerateSecret(id: string): Promise<string | null> {
    const webhook = await this.getWebhookById(id);
    if (!webhook) {
      return null;
    }

    const newSecret = this.generateWebhookSecret();
    await this.webhooksRepository.update(id, { secret: newSecret });

    return newSecret;
  }

  /**
   * Dispatch an event to all subscribed webhooks
   */
  async dispatchEvent<T>(
    event: string,
    data: T,
    apiVersion: string = ApiVersion.V1,
  ): Promise<void> {
    const webhooks = await this.webhooksRepository.find({
      where: {
        isActive: true,
      },
    });

    const eventWebhooks = webhooks.filter(
      (webhook) =>
        webhook.events.includes(event) || webhook.events.includes('*'),
    );

    if (eventWebhooks.length === 0) {
      this.logger.debug(`No webhooks subscribed to event: ${event}`);
      return;
    }

    const payload: WebhookPayload<T> = {
      id: uuidv4(),
      event,
      timestamp: Date.now(),
      data,
      apiVersion,
    };

    this.logger.debug(
      `Dispatching event ${event} to ${eventWebhooks.length} webhooks`,
    );

    const deliveryPromises = eventWebhooks.map((webhook) =>
      this.sendWebhookDirectly(webhook, payload),
    );
    await Promise.allSettled(deliveryPromises);
  }

  private async sendWebhookDirectly<T>(
    webhook: WebhookEntity,
    payload: WebhookPayload<T>,
  ): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = this.generateSignature(body, webhook.secret);

    try {
      this.logger.debug(
        `Sending webhook to ${webhook.url} for event ${payload.event}`,
      );
      await lastValueFrom(
        this.httpService.post(webhook.url, body, {
          headers: {
            'Content-Type': 'application/json',
            'X-Ecocast-Signature': signature,
            'User-Agent': `EcocastWebhookNotifier/1.0 (+${this.apiUrl})`,
          },
          timeout: this.configService.get<number>('webhook.timeout', 10000),
          validateStatus: (status) => status >= 200 && status < 300,
        }),
      );
      this.logger.log(
        `Successfully sent webhook to ${webhook.url} for event ${payload.event}`,
      );
    } catch (error) {
      const err = error as WebhookError;
      this.logger.error(`Failed to send webhook to ${webhook.url}`, {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseBody: err.response?.data,
        stack: err.stack,
      });
    }
  }

  /**
   * Update webhook delivery status
   */
  async updateWebhookDeliveryStatus(
    webhookId: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    const webhook = await this.getWebhookById(webhookId);
    if (!webhook) {
      this.logger.warn(
        `Webhook ${webhookId} not found when updating delivery status`,
      );
      return;
    }

    const updateData: Partial<WebhookEntity> = {
      deliveryAttempts: webhook.deliveryAttempts + 1,
    };

    if (success) {
      updateData.lastSuccessfulDelivery = new Date();
    } else {
      updateData.lastFailedDelivery = new Date();
      updateData.lastErrorMessage = errorMessage;
    }

    await this.webhooksRepository.update(webhookId, updateData);
  }

  /**
   * Generate a webhook signature for payload verification
   */
  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Generate a random webhook secret
   */
  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
