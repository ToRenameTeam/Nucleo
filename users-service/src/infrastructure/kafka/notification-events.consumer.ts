import { Kafka, type Consumer } from 'kafkajs';
import type {
  NotificationEventPayload,
  NotificationService,
} from '../../services/notification.service.js';

interface RawNotificationEvent {
  receiver?: unknown;
  title?: unknown;
  content?: unknown;
}

export class NotificationEventsConsumer {
  private readonly bootstrapServers: string;
  private readonly clientId: string;
  private readonly groupId: string;
  private readonly notificationsTopic: string;
  private consumer: Consumer | null;
  private isRunning: boolean;

  constructor(private readonly notificationService: NotificationService) {
    this.bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS ?? '';
    this.clientId = process.env.KAFKA_CLIENT_ID ?? 'users-service';
    this.groupId = process.env.KAFKA_CONSUMER_GROUP_ID ?? 'users-service-notifications';
    this.notificationsTopic = process.env.KAFKA_TOPIC_NOTIFICATIONS ?? '';
    this.consumer = null;
    this.isRunning = false;
  }

  async start(): Promise<void> {
    if (!this.isEnabled() || this.isRunning) {
      return;
    }

    const kafka = new Kafka({
      clientId: `${this.clientId}-notifications-consumer`,
      brokers: this.bootstrapServers.split(',').map(function (broker) {
        return broker.trim();
      }),
    });

    this.consumer = kafka.consumer({
      groupId: this.groupId,
    });

    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.notificationsTopic, fromBeginning: true });

    this.consumer
      .run({
        eachMessage: async ({ message }) => {
          if (!message.value) {
            return;
          }

          try {
            const parsed = JSON.parse(message.value.toString()) as RawNotificationEvent;
            const payload = this.parseNotificationEvent(parsed);

            if (!payload) {
              return;
            }

            await this.notificationService.consumeNotificationEvent(payload);
          } catch (error) {
            console.error('Failed to consume notification event', error);
          }
        },
      })
      .catch(function (error) {
        console.error('Notification consumer loop failed', error);
      });

    this.isRunning = true;
  }

  async stop(): Promise<void> {
    if (!this.consumer) {
      return;
    }

    await this.consumer.disconnect();
    this.consumer = null;
    this.isRunning = false;
  }

  private isEnabled(): boolean {
    return (
      Boolean(this.bootstrapServers.trim()) &&
      Boolean(this.groupId.trim()) &&
      Boolean(this.notificationsTopic.trim())
    );
  }

  private parseNotificationEvent(payload: RawNotificationEvent): NotificationEventPayload | null {
    if (typeof payload.receiver !== 'string' || !payload.receiver.trim()) {
      return null;
    }

    if (typeof payload.title !== 'string' || !payload.title.trim()) {
      return null;
    }

    if (
      payload.content !== undefined &&
      payload.content !== null &&
      typeof payload.content !== 'string'
    ) {
      return null;
    }

    return {
      receiver: payload.receiver.trim(),
      title: payload.title.trim(),
      content: payload.content ?? null,
    };
  }
}
