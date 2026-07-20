export interface IntegrationEvent<T = any> {
  id: string;
  eventName: string;
  timestamp: Date;
  payload: T;
}

export interface EventBusPort {
  publish(eventName: string, payload: any): Promise<void>;
  subscribe(eventName: string, handler: (event: IntegrationEvent) => Promise<void> | void): Promise<void>;
  close(): Promise<void>;
}
