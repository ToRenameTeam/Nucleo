import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  id: string;
  receiver: string;
  title: string;
  content: string | null;
  status: 'UNREAD' | 'READ';
  created_at: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    receiver: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ'],
      required: true,
      default: 'UNREAD',
      index: true,
    },
    created_at: {
      type: Date,
      required: true,
      index: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'notifications',
  }
);

NotificationSchema.index({ receiver: 1, created_at: -1 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema
);
