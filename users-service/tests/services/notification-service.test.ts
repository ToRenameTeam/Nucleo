import { NotificationService } from '../../src/services/notification.service.js';
import type {
  NotificationData,
  NotificationQueryOptions,
  NotificationRepository,
} from '../../src/domain/repositories/notification-repository.js';

describe('NotificationService', function () {
  let notificationService: NotificationService;
  let mockNotificationRepository: jest.Mocked<NotificationRepository>;

  beforeEach(function () {
    mockNotificationRepository = {
      create: jest.fn(),
      findByReceiver: jest.fn(),
      markAsRead: jest.fn(),
    };

    notificationService = new NotificationService(mockNotificationRepository);
  });

  it('returns notifications filtered by query options', async function () {
    const now = new Date();
    const storedNotifications: NotificationData[] = [
      {
        id: '3f9f8f37-00af-4d99-8e51-773d307ec16f',
        receiver: 'patient-123',
        title: 'Titolo',
        content: 'Contenuto',
        status: 'UNREAD',
        createdAt: now,
      },
    ];
    const options: NotificationQueryOptions = { limit: 10, status: 'UNREAD' };

    mockNotificationRepository.findByReceiver.mockResolvedValue(storedNotifications);

    const result = await notificationService.getNotifications('patient-123', options);

    expect(mockNotificationRepository.findByReceiver).toHaveBeenCalledWith('patient-123', options);
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]?.created_at).toBe(now.toISOString());
  });

  it('marks notifications as read', async function () {
    const now = new Date();
    mockNotificationRepository.markAsRead.mockResolvedValue({
      id: '3f9f8f37-00af-4d99-8e51-773d307ec16f',
      receiver: 'patient-123',
      title: 'Titolo',
      content: null,
      status: 'READ',
      createdAt: now,
    });

    const result = await notificationService.markAsRead(
      'patient-123',
      '3f9f8f37-00af-4d99-8e51-773d307ec16f'
    );

    expect(result.status).toBe('READ');
  });

  it('persists consumed notification events', async function () {
    await notificationService.consumeNotificationEvent({
      receiver: 'patient-123',
      title: 'Nuova notifica',
      content: 'Contenuto',
    });

    expect(mockNotificationRepository.create).toHaveBeenCalledTimes(1);
  });
});
