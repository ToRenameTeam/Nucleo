import { Kafka, type Producer } from 'kafkajs';

interface UserDeletedEvent {
  userId: string;
  deletedAt: string;
}

export class UserEventsPublisher {
  private readonly bootstrapServers: string;
  private readonly clientId: string;
  private readonly userDeletedTopic: string;
  private producer: Producer | null;
  private isConnected: boolean;

  constructor() {
    this.bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS ?? '';
    this.clientId = process.env.KAFKA_CLIENT_ID ?? 'users-service';
    this.userDeletedTopic = process.env.KAFKA_TOPIC_USER_DELETED ?? '';
    this.producer = null;
    this.isConnected = false;
  }

  async publishUserDeleted(event: UserDeletedEvent): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    await this.ensureConnected();

    await this.producer?.send({
      topic: this.userDeletedTopic,
      messages: [
        {
          key: event.userId,
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
    if (!this.bootstrapServers || !this.userDeletedTopic) {
      return false;
    }

    return true;
  }

  private async ensureConnected(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.bootstrapServers.split(',').map(function (broker) {
        return broker.trim();
      }),
    });

    this.producer = kafka.producer();
    await this.producer.connect();
    this.isConnected = true;
  }
}
