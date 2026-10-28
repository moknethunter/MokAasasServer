export type ConnectionHandler = (userId: string) => void;

export interface ClientConnection {
  start(server: unknown): void;
  emit(userId: string, event: string, payload: unknown): void;
  onConnection(handler: ConnectionHandler): void;
  onDisconnect(handler: ConnectionHandler): void;
  close(): Promise<void>;
}
