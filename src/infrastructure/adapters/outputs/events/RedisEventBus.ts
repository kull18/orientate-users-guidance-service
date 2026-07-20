import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import { EventBusPort, IntegrationEvent } from '../../../../application/ports/outputs/EventBusPort';

export class RedisEventBus implements EventBusPort {
  private readonly pubClient: Redis;
  private readonly subClient: Redis;
  private readonly handlers: Map<string, Array<(event: IntegrationEvent) => Promise<void> | void>> = new Map();

  constructor(redisConnectionString: string) {
    this.pubClient = new Redis(redisConnectionString, {
      maxRetriesPerRequest: null,
    });
    this.subClient = new Redis(redisConnectionString, {
      maxRetriesPerRequest: null,
    });

    this.subClient.on('message', async (channel, message) => {
      const handlers = this.handlers.get(channel);
      if (handlers) {
        try {
          const event: IntegrationEvent = JSON.parse(message);
          for (const handler of handlers) {
            await handler(event);
          }
        } catch (err) {
          console.error(`[RedisEventBus] Error processing message on channel ${channel}:`, err);
        }
      }
    });
  }

  async publish(eventName: string, payload: any): Promise<void> {
    const event: IntegrationEvent = {
      id: randomUUID(),
      eventName,
      timestamp: new Date(),
      payload,
    };
    await this.pubClient.publish(eventName, JSON.stringify(event));
  }

  async subscribe(eventName: string, handler: (event: IntegrationEvent) => Promise<void> | void): Promise<void> {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
      await this.subClient.subscribe(eventName);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async close(): Promise<void> {
    await Promise.all([
      this.pubClient.quit(),
      this.subClient.quit()
    ]);
  }
}
