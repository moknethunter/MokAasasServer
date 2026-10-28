import { EventEmitter } from 'node:events';
import type { EventBus, EventHandler } from '../../ports/event-bus.js';

export class LocalEventBus implements EventBus {
  private emitter = new EventEmitter();

  async publish<T = unknown>(event: string, payload: T): Promise<void> {
    this.emitter.emit(event, payload);
  }

  async subscribe<T = unknown>(event: string, handler: EventHandler<T>): Promise<void> {
    this.emitter.on(event, handler as (p: unknown) => void);
  }

  async close(): Promise<void> {
    this.emitter.removeAllListeners();
  }
}
