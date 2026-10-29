import { Server as SocketIOServer } from "socket.io";
import { ClientConnection, ConnectionHandler, MessageHandler } from "../../ports/client-connection.js";
import { TokenService } from "../../ports/auth.port.js";

export class SocketIOAdapter implements ClientConnection {
  private io: SocketIOServer | null = null;

  constructor(private tokenService: TokenService) {}

  start(server: any): void {
    this.io = new SocketIOServer(server, { cors: { origin: "*" } });
    
    // حماية الاتصال
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      try {
        const payload = this.tokenService.verify(token);
        socket.data.user = payload.username;
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });
  }

  emitToAll(event: string, payload: unknown): void {
    if (this.io) this.io.emit(event, payload);
  }

  onConnection(handler: ConnectionHandler): void {
    if (!this.io) return;
    this.io.on("connection", (socket) => handler(socket.data.user));
  }

  onMessage(event: string, handler: MessageHandler): void {
    if (!this.io) return;
    this.io.on("connection", (socket) => {
      socket.on(event, (data) => handler({ ...data, sender: socket.data.user }));
    });
  }
}
