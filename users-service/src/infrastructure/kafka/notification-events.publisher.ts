import { Kafka, type Producer } from 'kafkajs';

interface NotificationEvent {
  receiver: string;
  title: string;
  content: string | null;
  sourceService: string;
  occurredAt: string;
}

export class NotificationEventsPublisher {
  private readonly bootstrapServers: string;
  private readonly clientId: string;
  private readonly notificationsTopic: string;
  private producer: Producer | null;
  private isConnected: boolean;

  constructor() {
    this.bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS ?? '';
    this.clientId = process.env.KAFKA_CLIENT_ID ?? 'users-service';
    this.notificationsTopic = process.env.KAFKA_TOPIC_NOTIFICATIONS ?? '';
    this.producer = null;
    this.isConnected = false;
  }

  async publish(payload: {
    receiver: string;
    title: string;
    content?: string | null;
  }): Promise<void> {
    if (!this.isEnabled() || !payload.receiver.trim() || !payload.title.trim()) {
      return;
    }

    await this.ensureConnected();

    const event: NotificationEvent = {
      receiver: payload.receiver.trim(),
      title: payload.title.trim(),
      content: payload.content ?? null,
      sourceService: this.clientId,
      occurredAt: new Date().toISOString(),
    };

    await this.producer?.send({
      topic: this.notificationsTopic,
      messages: [
        {
          key: event.receiver,
          value: JSON.stringify(event),
        },
      ],
    });
  }

  async disconnect(): Promise<void> {
    if (!this.producer || !this.isConnected) {
      return;
    }

    await this.producer.disconnect();
    this.isConnected = false;
  }

  private isEnabled(): boolean {
    return Boolean(this.bootstrapServers.trim()) && Boolean(this.notificationsTopic.trim());
  }

  private async ensureConnected(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const kafka = new Kafka({
      clientId: `${this.clientId}-notifications`,
      brokers: this.bootstrapServers.split(',').map(function (broker) {
        return broker.trim();
      }),
    });

    this.producer = kafka.producer();
    await this.producer.connect();
    this.isConnected = true;
  }
}
