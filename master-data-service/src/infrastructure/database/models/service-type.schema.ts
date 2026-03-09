import mongoose, { Schema, type Document } from 'mongoose';
import { ServiceType, ServiceCategory } from '../../../domain/service-catalog/index.js';

type ServiceTypeDocument = Document<string, object, Omit<ServiceType, 'id'>> &
  Omit<ServiceType, 'id'> & { _id: string };

const ServiceTypeSchema = new Schema<ServiceTypeDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      match: /^service-\d{3}$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return (
            v &&
            v.length > 0 &&
            v.every((cat) => Object.values(ServiceCategory).includes(cat as ServiceCategory))
          );
        },
        message: 'Category must be a non-empty array of valid ServiceCategory values',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
    timestamps: true,
    collection: 'service_types',
  }
);

// Index for faster queries
ServiceTypeSchema.index({ category: 1 });
ServiceTypeSchema.index({ isActive: 1 });
ServiceTypeSchema.index({ name: 'text', description: 'text' });

export const ServiceTypeModel = mongoose.model<ServiceTypeDocument>(
  'ServiceType',
  ServiceTypeSchema
);
