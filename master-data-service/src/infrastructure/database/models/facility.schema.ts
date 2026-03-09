import mongoose, { Schema, type Document } from 'mongoose';
import type { Facility } from '../../../domain/facility/index.js';

/** Internal mongoose document interface — infrastructure only */
type FacilityDocument = Document<string, object, Omit<Facility, 'id'>> &
  Omit<Facility, 'id'> & { _id: string };

const FacilitySchema = new Schema<FacilityDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      match: /^facility-\d{3}$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
    timestamps: true,
    collection: 'facilities',
  }
);

// Index for faster queries
FacilitySchema.index({ city: 1 });
FacilitySchema.index({ isActive: 1 });
FacilitySchema.index({ name: 'text', address: 'text', city: 'text' });

export const FacilityModel = mongoose.model<FacilityDocument>('Facility', FacilitySchema);
