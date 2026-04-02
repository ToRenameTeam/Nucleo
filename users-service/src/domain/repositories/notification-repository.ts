import type { Notification, NotificationStatus } from '../index.js';

export interface NotificationData {
  id: string;
  receiver: string;
  title: string;
  content: string | null;
  status: NotificationStatus;
  createdAt: Date;
}

export interface NotificationQueryOptions {
  limit?: number;
  since?: Date;
  status?: NotificationStatus;
}

export interface NotificationRepository {
  create(notification: Notification): Promise<void>;
  findByReceiver(userId: string, options?: NotificationQueryOptions): Promise<NotificationData[]>;
  markAsRead(notificationId: string, receiver: string): Promise<NotificationData | null>;
}
