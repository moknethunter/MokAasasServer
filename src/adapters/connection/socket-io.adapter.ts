import { Server as SocketIOServer } from "socket.io";
import { ClientConnection, ConnectionHandler, MessageHandler } from "../../ports/client-connection.js";
import { TokenService } from "../../ports/auth.port.js";
import { logger } from "../../logger.js";

export class SocketIOAdapter implements ClientConnection {
  private io: SocketIOServer | null = null;
  private users = new Map<string, string>(); // phoneNumber -> socketId

  constructor(private tokenService: TokenService) {}

  start(server: any): void {
    this.io = new SocketIOServer(server, { cors: { origin: "*" } });
    
    // حماية الاتصال بالتوكن
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      try {
        const payload = this.tokenService.verify(token);
        socket.data.user = payload.phone; // نستخدم رقم الهاتف كمعرف
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });
  }

  emitToAll(event: string, payload: unknown): void {
    if (this.io) this.io.emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    const socketId = this.users.get(userId);
    if (this.io && socketId) {
      this.io.to(socketId).emit(event, payload);
    }
  }

  onConnection(handler: ConnectionHandler): void {
    if (!this.io) return;
    this.io.on("connection", (socket) => {
      const phoneNumber = socket.data.user;
      this.users.set(phoneNumber, socket.id);
      logger.info(`User connected: ${phoneNumber} (${socket.id})`);
      
      handler(phoneNumber);

      socket.on("disconnect", () => {
        this.users.delete(phoneNumber);
        logger.info(`User disconnected: ${phoneNumber}`);
      });
    });
  }

  onMessage(event: string, handler: MessageHandler): void {
    if (!this.io) return;
    this.io.on("connection", (socket) => {
      socket.on(event, (data) => handler({ ...data, sender: socket.data.user }));
    });
  }
}
