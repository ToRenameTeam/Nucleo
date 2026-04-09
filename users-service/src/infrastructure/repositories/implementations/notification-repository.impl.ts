import { NotificationModel } from '../../database/index.js';
import type { INotificationDocument } from '../../database/index.js';
import type { Notification } from '../../../domain/index.js';
import type {
  NotificationData,
  NotificationQueryOptions,
  NotificationRepository,
} from '../../../domain/repositories/index.js';

export class NotificationRepositoryImpl implements NotificationRepository {
  async create(notification: Notification): Promise<void> {
    await NotificationModel.create({
      id: notification.id,
      receiver: notification.receiver,
      title: notification.title,
      content: notification.content,
      status: notification.status,
      created_at: notification.createdAt,
    });
  }

  async findByReceiver(
    userId: string,
    options: NotificationQueryOptions = {}
  ): Promise<NotificationData[]> {
    const filter: Record<string, unknown> = {
      receiver: userId,
    };

    if (options.status) {
      filter.status = options.status;
    }

    if (options.since) {
      filter.created_at = {
        $gte: options.since,
      };
    }

    let query = NotificationModel.find(filter).sort({ created_at: -1 });

    if (options.limit && options.limit > 0) {
      query = query.limit(options.limit);
    }

    const notifications = await query.exec();
    return notifications.map(function (notification) {
      return {
        id: notification.id,
        receiver: notification.receiver,
        title: notification.title,
        content: notification.content,
        status: notification.status,
        createdAt: notification.created_at,
      };
    });
  }

  async markAsRead(notificationId: string, receiver: string): Promise<NotificationData | null> {
    const notification = await NotificationModel.findOneAndUpdate(
      {
        id: notificationId,
        receiver,
      },
      {
        status: 'READ',
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return null;
    }

    return this.toNotificationData(notification);
  }

  private toNotificationData(doc: INotificationDocument): NotificationData {
    return {
      id: doc.id,
      receiver: doc.receiver,
      title: doc.title,
      content: doc.content,
      status: doc.status,
      createdAt: doc.created_at,
    };
  }
}
