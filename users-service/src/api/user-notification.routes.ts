import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { success } from './utils/response.js';
import { handleRouteError } from './utils/http-helpers.js';
import { validateWithSchema } from './validation.js';
import { notificationService } from '../services/index.js';

const router = Router();

const NOTIFICATION_ERROR_RULES = [
  { statusCode: 404, messageEquals: 'Notification not found' },
  { statusCode: 400, messageIncludes: 'Invalid' },
];

const userIdParamsSchema = z.object({
  userId: z.string().trim().min(1),
});

const markAsReadParamsSchema = z.object({
  userId: z.string().trim().min(1),
  notificationId: z.string().trim().min(1),
});

const notificationsQuerySchema = z.object({
  limit: z
    .preprocess(function (value) {
      if (value === undefined) {
        return undefined;
      }

      return Number(value);
    }, z.number().int().positive())
    .optional(),
  since: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(['READ', 'UNREAD']).optional(),
});

router.get('/:userId/notifications', async function (req: Request, res: Response) {
  try {
    const { userId } = validateWithSchema(userIdParamsSchema, req.params, 'user params');
    const query = validateWithSchema(notificationsQuerySchema, req.query, 'notification query');

    const since = query.since ? new Date(`${query.since}T00:00:00.000Z`) : undefined;

    const result = await notificationService.getNotifications(userId, {
      limit: query.limit,
      since,
      status: query.status,
    });

    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Get notifications error', NOTIFICATION_ERROR_RULES);
  }
});

router.patch(
  '/:userId/notifications/:notificationId/read',
  async function (req: Request, res: Response) {
    try {
      const { userId, notificationId } = validateWithSchema(
        markAsReadParamsSchema,
        req.params,
        'mark notification read params'
      );

      const result = await notificationService.markAsRead(userId, notificationId);
      return success(res, result);
    } catch (err) {
      return handleRouteError(res, err, 'Mark notification read error', NOTIFICATION_ERROR_RULES);
    }
  }
);

export default router;
