import mongoose, { Schema, type Document } from 'mongoose';
import { Medicine, MedicineCategory } from '../../../domain/index.js';

type MedicineDocument = Document<string, object, Omit<Medicine, 'id'>> &
  Omit<Medicine, 'id'> & { _id: string };

const MedicineSchema = new Schema<MedicineDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      match: /^medicine-\d{3}$/,
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
      type: String,
      required: true,
      enum: Object.values(MedicineCategory),
    },
    activeIngredient: {
      type: String,
      required: true,
      trim: true,
    },
    dosageForm: {
      type: String,
      required: true,
      trim: true,
    },
    strength: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
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
    collection: 'medicines',
  }
);

// Index for faster queries
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ isActive: 1 });
MedicineSchema.index({ activeIngredient: 1 });
MedicineSchema.index({ name: 'text', description: 'text', activeIngredient: 'text' });

export const MedicineModel = mongoose.model<MedicineDocument>('Medicine', MedicineSchema);
