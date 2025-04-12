import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface EventData {
  [key: string]: unknown;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  namespace: 'events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<
    string,
    { userId?: string; socket: Socket }
  >();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, { socket: client });
    this.logger.log(`Client connected: ${clientId}`);
    this.server.emit('clients', this.getConnectedClientsCount());
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    this.logger.log(`Client disconnected: ${clientId}`);
    this.server.emit('clients', this.getConnectedClientsCount());
  }

  @SubscribeMessage('identity')
  handleIdentity(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const clientId = client.id;
    const existingClient = this.connectedClients.get(clientId);
    if (existingClient) {
      existingClient.userId = data.userId;
      this.connectedClients.set(clientId, existingClient);
      this.logger.log(`Client ${clientId} identified as user ${data.userId}`);
    }
    return { event: 'identity', data: { success: true } };
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: { time: new Date().toISOString() } };
  }

  /**
   * Broadcast an event to all connected clients
   */
  broadcastEvent(event: string, data: EventData): void {
    this.server.emit(event, data);
  }

  /**
   * Send an event to a specific user
   */
  sendToUser(userId: string, event: string, data: EventData): void {
    const userClients = Array.from(this.connectedClients.entries())
      .filter(([, client]) => client.userId === userId)
      .map(([, client]) => client.socket);

    userClients.forEach((socket) => {
      socket.emit(event, data);
    });
  }

  /**
   * Get the number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get the number of unique connected users
   */
  getConnectedUsersCount(): number {
    const uniqueUserIds = new Set(
      Array.from(this.connectedClients.values())
        .map((client) => client.userId)
        .filter((userId): userId is string => userId !== undefined),
    );
    return uniqueUserIds.size;
  }
}
