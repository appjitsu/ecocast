import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

interface EventData {
  [key: string]: unknown;
}

@Injectable()
export class EventsService {
  constructor(private readonly eventsGateway: EventsGateway) {}

  /**
   * Broadcast an event to all connected clients
   */
  broadcastEvent(event: string, data: EventData): void {
    this.eventsGateway.broadcastEvent(event, data);
  }

  /**
   * Send an event to a specific user
   */
  sendToUser(userId: string, event: string, data: EventData): void {
    this.eventsGateway.sendToUser(userId, event, data);
  }

  /**
   * Get the number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.eventsGateway.getConnectedClientsCount();
  }

  /**
   * Get the number of unique connected users
   */
  getConnectedUsersCount(): number {
    return this.eventsGateway.getConnectedUsersCount();
  }
}
