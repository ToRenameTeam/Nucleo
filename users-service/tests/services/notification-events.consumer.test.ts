import { NotificationEventsConsumer } from '../../src/infrastructure/kafka/notification-events.consumer.js';
import type { NotificationService } from '../../src/services/index.js';

const mockRun = jest.fn();
const mockSubscribe = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockConsumer = {
  connect: mockConnect,
  subscribe: mockSubscribe,
  run: mockRun,
  disconnect: mockDisconnect,
};

jest.mock('kafkajs', function () {
  return {
    Kafka: jest.fn().mockImplementation(function () {
      return {
        consumer: jest.fn().mockReturnValue(mockConsumer),
      };
    }),
  };
});

describe('NotificationEventsConsumer', function () {
  const previousEnv = process.env;

  beforeEach(function () {
    jest.clearAllMocks();
    mockRun.mockResolvedValue(undefined);
    process.env = {
      ...previousEnv,
      KAFKA_BOOTSTRAP_SERVERS: 'localhost:29092',
      KAFKA_CONSUMER_GROUP_ID: 'users-service-notifications',
      KAFKA_TOPIC_NOTIFICATIONS: 'users.notifications',
      KAFKA_CLIENT_ID: 'users-service',
    };
  });

  afterAll(function () {
    process.env = previousEnv;
  });

  it('consumes valid notification messages', async function () {
    const mockNotificationService = {
      consumeNotificationEvent: jest.fn(),
    } as unknown as NotificationService;

    const consumer = new NotificationEventsConsumer(mockNotificationService);

    await consumer.start();

    const runConfig = mockRun.mock.calls[0]?.[0] as {
      eachMessage: (payload: { message: { value: Buffer | null } }) => Promise<void>;
    };

    await runConfig.eachMessage({
      message: {
        value: Buffer.from(
          JSON.stringify({
            receiver: 'patient-123',
            title: 'Nuovo appuntamento',
            content: 'Dettagli',
          })
        ),
      },
    });

    expect(mockNotificationService.consumeNotificationEvent).toHaveBeenCalledWith({
      receiver: 'patient-123',
      title: 'Nuovo appuntamento',
      content: 'Dettagli',
    });

    await consumer.stop();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
