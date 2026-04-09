import { randomUUID } from 'crypto';
import { Notification } from '../../src/domain/notification.js';

describe('Notification', function () {
  it('creates unread notifications with valid values', function () {
    const notification = Notification.create(
      randomUUID(),
      'patient-123',
      'Nuovo appuntamento',
      'Dettagli appuntamento'
    );

    expect(notification.receiver).toBe('patient-123');
    expect(notification.title).toBe('Nuovo appuntamento');
    expect(notification.content).toBe('Dettagli appuntamento');
    expect(notification.status).toBe('UNREAD');
  });

  it('marks a notification as read', function () {
    const notification = Notification.create(randomUUID(), 'patient-123', 'Titolo');

    notification.markAsRead();

    expect(notification.status).toBe('READ');
  });

  it('rejects invalid data', function () {
    expect(function () {
      Notification.create('invalid-uuid', 'patient-123', 'Titolo');
    }).toThrow('Invalid UUID format');

    expect(function () {
      Notification.create(randomUUID(), '', 'Titolo');
    }).toThrow('Invalid receiver');

    expect(function () {
      Notification.create(randomUUID(), 'patient-123', '   ');
    }).toThrow('Invalid title');
  });
});
