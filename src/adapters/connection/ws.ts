import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import type { ClientConnection, ConnectionHandler } from '../../ports/client-connection.js';
import { logger } from '../../logger.js';

export class WebSocketConnection implements ClientConnection {
  private io: SocketIOServer | null = null;
  private onConn: ConnectionHandler[] = [];
  private onDisc: ConnectionHandler[] = [];

  constructor(private httpServer: HttpServer) {}

  start(_server: unknown): void {
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: true, credentials: true },
      path: '/ws',
    });

    this.io.on('connection', (socket) => {
      const userId = socket.handshake.auth?.['userId'] as string | undefined;
      if (!userId) {
        socket.disconnect(true);
        return;
      }
      socket.join(`user:${userId}`);
      logger.debug({ userId, sid: socket.id }, 'ws connected');
      this.onConn.forEach((h) => h(userId));

      socket.on('disconnect', () => {
        logger.debug({ userId, sid: socket.id }, 'ws disconnected');
        this.onDisc.forEach((h) => h(userId));
      });
    });
  }

  emit(userId: string, event: string, payload: unknown): void {
    this.io?.to(`user:${userId}`).emit(event, payload);
  }

  onConnection(handler: ConnectionHandler): void {
    this.onConn.push(handler);
  }

  onDisconnect(handler: ConnectionHandler): void {
    this.onDisc.push(handler);
  }

  async close(): Promise<void> {
    if (this.io) await this.io.close();
  }
}
