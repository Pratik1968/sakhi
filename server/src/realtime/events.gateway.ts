import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Single Socket.IO gateway shared by the location and SOS features.
 * Every authenticated client joins a private room `user:<id>`; services push
 * events to a specific user via {@link emitToUser}.
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string)?.replace(/^Bearer\s+/i, '');
      if (!token) throw new Error('missing token');
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.sub as string;
      client.data.userId = userId;
      client.join(this.room(userId));
      this.logger.debug(`socket ${client.id} connected as user ${userId}`);
    } catch (err) {
      this.logger.warn(`rejecting socket ${client.id}: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`socket ${client.id} disconnected`);
  }

  private room(userId: string) {
    return `user:${userId}`;
  }

  /** Push an event to a single user's room (all their connected devices). */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(this.room(userId)).emit(event, payload);
  }

  /** Push to many users at once. */
  emitToUsers(userIds: string[], event: string, payload: unknown) {
    for (const id of userIds) this.emitToUser(id, event, payload);
  }
}
