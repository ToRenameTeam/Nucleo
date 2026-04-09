export type NotificationStatus = 'UNREAD' | 'READ';

export interface NotificationItem {
  id: string;
  receiver: string;
  title: string;
  content: string | null;
  status: NotificationStatus;
  created_at: string;
}

export interface NotificationsCollection {
  notifications: NotificationItem[];
}

export interface NotificationFilters {
  limit?: number;
  since?: string;
  status?: NotificationStatus;
}
