import { isValidUUID } from '../utils/uuid.js';

export type NotificationStatus = 'UNREAD' | 'READ';

export class Notification {
  private readonly _id: string;
  private readonly _receiver: string;
  private readonly _title: string;
  private readonly _content: string | null;
  private _status: NotificationStatus;
  private readonly _createdAt: Date;

  private constructor(
    id: string,
    receiver: string,
    title: string,
    content: string | null,
    status: NotificationStatus,
    createdAt: Date
  ) {
    this._id = id;
    this._receiver = receiver;
    this._title = title;
    this._content = content;
    this._status = status;
    this._createdAt = createdAt;
  }

  static create(
    id: string,
    receiver: string,
    title: string,
    content: string | null = null,
    createdAt: Date = new Date()
  ): Notification {
    this.validateInputs(id, receiver, title, content, 'UNREAD', createdAt);

    return new Notification(id, receiver.trim(), title.trim(), content, 'UNREAD', createdAt);
  }

  static reconstitute(
    id: string,
    receiver: string,
    title: string,
    content: string | null,
    status: NotificationStatus,
    createdAt: Date
  ): Notification {
    this.validateInputs(id, receiver, title, content, status, createdAt);

    return new Notification(id, receiver.trim(), title.trim(), content, status, createdAt);
  }

  markAsRead(): void {
    this._status = 'READ';
  }

  get id(): string {
    return this._id;
  }

  get receiver(): string {
    return this._receiver;
  }

  get title(): string {
    return this._title;
  }

  get content(): string | null {
    return this._content;
  }

  get status(): NotificationStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  private static validateInputs(
    id: string,
    receiver: string,
    title: string,
    content: string | null,
    status: NotificationStatus,
    createdAt: Date
  ) {
    if (!isValidUUID(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    if (!receiver || !receiver.trim()) {
      throw new Error('Invalid receiver');
    }

    if (!title || !title.trim()) {
      throw new Error('Invalid title');
    }

    if (content !== null && typeof content !== 'string') {
      throw new Error('Invalid content');
    }

    if (!['UNREAD', 'READ'].includes(status)) {
      throw new Error('Invalid status');
    }

    if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
      throw new Error('Invalid created_at');
    }
  }
}
