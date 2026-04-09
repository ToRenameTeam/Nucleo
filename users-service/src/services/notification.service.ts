import { randomUUID } from 'crypto';
import { Notification } from '../domain/index.js';
import type {
  NotificationQueryOptions,
  NotificationRepository,
} from '../domain/repositories/index.js';

export interface NotificationEventPayload {
  receiver: string;
  title: string;
  content?: string | null;
}

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async getNotifications(userId: string, options: NotificationQueryOptions = {}) {
    const notifications = await this.notificationRepository.findByReceiver(userId, options);

    return {
      notifications: notifications.map(function (notification) {
        return {
          id: notification.id,
          receiver: notification.receiver,
          title: notification.title,
          content: notification.content,
          status: notification.status,
          created_at: notification.createdAt.toISOString(),
        };
      }),
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const updated = await this.notificationRepository.markAsRead(notificationId, userId);

    if (!updated) {
      throw new Error('Notification not found');
    }

    return {
      id: updated.id,
      receiver: updated.receiver,
      title: updated.title,
      content: updated.content,
      status: updated.status,
      created_at: updated.createdAt.toISOString(),
    };
  }

  async consumeNotificationEvent(payload: NotificationEventPayload): Promise<void> {
    const notification = Notification.create(
      randomUUID(),
      payload.receiver,
      payload.title,
      payload.content ?? null
    );

    await this.notificationRepository.create(notification);
  }
}
