import { z } from 'zod';
import { API_ENDPOINTS, USERS_API_URL } from './config';
import {
  idSchema,
  nonEmptyTrimmedStringSchema,
  parseApiResponse,
  parseWithSchema,
} from './validation';
import type {
  NotificationFilters,
  NotificationItem,
  NotificationsCollection,
} from '../types/notification';

const notificationStatusSchema = z.enum(['READ', 'UNREAD']);

const notificationItemSchema: z.ZodType<NotificationItem> = z.object({
  id: idSchema,
  receiver: nonEmptyTrimmedStringSchema,
  title: nonEmptyTrimmedStringSchema,
  content: z.string().nullable(),
  status: notificationStatusSchema,
  created_at: nonEmptyTrimmedStringSchema,
});

const notificationsCollectionSchema: z.ZodType<NotificationsCollection> = z.object({
  notifications: z.array(notificationItemSchema),
});

const markAsReadSchema = notificationItemSchema;

function buildNotificationQuery(filters: NotificationFilters): string {
  const params = new URLSearchParams();

  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }

  if (filters.since) {
    params.set('since', filters.since);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  return params.toString();
}

export const notificationsApi = {
  async getNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<NotificationsCollection> {
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'notifications userId');
    const query = buildNotificationQuery(filters);
    const baseUrl = `${USERS_API_URL}${API_ENDPOINTS.USERS}/${sanitizedUserId}/notifications`;
    const requestUrl = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseApiResponse(response, notificationsCollectionSchema, 'notifications list response');
  },

  async markAsRead(userId: string, notificationId: string): Promise<NotificationItem> {
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'notifications markAsRead userId');
    const sanitizedNotificationId = parseWithSchema(
      idSchema,
      notificationId,
      'notifications markAsRead notificationId'
    );

    const response = await fetch(
      `${USERS_API_URL}${API_ENDPOINTS.USERS}/${sanitizedUserId}/notifications/${sanitizedNotificationId}/read`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    return parseApiResponse(response, markAsReadSchema, 'notifications markAsRead response');
  },
};
