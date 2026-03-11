import type { DomainEvent, DomainEventType, DomainEventPayload } from './types';

type EventHandler<T extends DomainEventType> = (payload: DomainEventPayload<T>) => void | Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = EventHandler<any>;

class DomainEventEmitter {
  private listeners = new Map<DomainEventType, Set<AnyHandler>>();

  on<T extends DomainEventType>(eventType: T, handler: EventHandler<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as AnyHandler);
  }

  off<T extends DomainEventType>(eventType: T, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler as AnyHandler);
      if (handlers.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  emit(event: DomainEvent): void {
    const handlers = this.listeners.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    for (const handler of handlers) {
      try {
        const result = handler(event.payload);
        // If handler returns a promise, catch errors asynchronously
        if (result && typeof result.catch === 'function') {
          result.catch((err: unknown) => {
            console.error(`[DomainEvents] Async error in handler for "${event.type}":`, err);
          });
        }
      } catch (err) {
        console.error(`[DomainEvents] Error in handler for "${event.type}":`, err);
      }
    }
  }

  /** Returns all registered event types (useful for webhook matching) */
  getRegisteredTypes(): DomainEventType[] {
    return Array.from(this.listeners.keys());
  }
}

/** Singleton domain event emitter */
export const domainEvents = new DomainEventEmitter();
