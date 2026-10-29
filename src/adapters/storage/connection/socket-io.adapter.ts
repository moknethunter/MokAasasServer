import { Server as SocketIOServer } from "socket.io";
import { ClientConnection, ConnectionHandler, MessageHandler } from "../../ports/client-connection.js";

export class SocketIOAdapter implements ClientConnection {
  private io: SocketIOServer | null = null;

  start(server: any): void {
    this.io = new SocketIOServer(server, { cors: { origin: "*" } });
  }

  emitToAll(event: string, payload: unknown): void {
    if (this.io) this.io.emit(event, payload);
  }

  onConnection(handler: ConnectionHandler): void {
    if (!this.io) return;
    this.io.on("connection", (socket) => handler(socket.id));
  }

  onMessage(event: string, handler: MessageHandler): void {
    if (!this.io) return;
    this.io.on("connection", (socket) => {
      socket.on(event, (data) => handler(data));
    });
  }
}
