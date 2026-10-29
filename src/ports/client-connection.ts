export type ConnectionHandler = (userId: string) => void;
export type MessageHandler = (data: any) => void;

export interface ClientConnection {
  start(server: any): void;
  emitToAll(event: string, payload: unknown): void;
  onConnection(handler: ConnectionHandler): void;
  onMessage(event: string, handler: MessageHandler): void;
}
