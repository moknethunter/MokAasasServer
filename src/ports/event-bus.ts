export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface EventBus {
  publish<T = unknown>(event: string, payload: T): Promise<void>;
  subscribe<T = unknown>(event: string, handler: EventHandler<T>): Promise<void>;
  close(): Promise<void>;
}
