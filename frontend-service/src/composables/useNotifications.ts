import { computed, ref } from 'vue';
import { notificationsApi } from '../api/notifications';
import type { NotificationItem } from '../types/notification';

const notifications = ref<NotificationItem[]>([]);
const activeUserId = ref<string | null>(null);

export function useNotifications() {
  const unreadCount = computed(function () {
    return notifications.value.filter(function (notification) {
      return notification.status === 'UNREAD';
    }).length;
  });

  async function initializeNotifications(userId: string): Promise<void> {
    if (!userId) {
      return;
    }

    if (activeUserId.value === userId && notifications.value.length > 0) {
      return;
    }

    activeUserId.value = userId;
    await refreshNotifications();
  }

  async function refreshNotifications(): Promise<void> {
    const userId = activeUserId.value;

    if (!userId) {
      return;
    }

    const response = await notificationsApi.getNotifications(userId, { limit: 50 });
    notifications.value = response.notifications;
  }

  async function markNotificationAsRead(notificationId: string): Promise<void> {
    const userId = activeUserId.value;

    if (!userId) {
      return;
    }

    const updated = await notificationsApi.markAsRead(userId, notificationId);

    notifications.value = notifications.value.map(function (notification) {
      if (notification.id === updated.id) {
        return updated;
      }

      return notification;
    });
  }

  async function markAllNotificationsAsRead(): Promise<void> {
    const userId = activeUserId.value;

    if (!userId) {
      return;
    }

    const unreadNotifications = notifications.value.filter(function (notification) {
      return notification.status === 'UNREAD';
    });

    if (unreadNotifications.length === 0) {
      return;
    }

    const updatedNotifications = await Promise.all(
      unreadNotifications.map(function (notification) {
        return notificationsApi.markAsRead(userId, notification.id);
      })
    );

    const updatedById = new Map(
      updatedNotifications.map(function (notification) {
        return [notification.id, notification] as const;
      })
    );

    notifications.value = notifications.value.map(function (notification) {
      return updatedById.get(notification.id) ?? notification;
    });
  }

  function disconnectNotifications(): void {
    activeUserId.value = null;
  }

  return {
    notifications,
    unreadCount,
    initializeNotifications,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    disconnectNotifications,
  };
}
