import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
    _id: string;
    code: string;
    name: string;
    address: string;
    city: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
    {
        _id: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            match: /^facility-\d{3}$/
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        _id: false,
        timestamps: true,
        collection: 'facilities'
    }
);

// Index for faster queries
FacilitySchema.index({ city: 1 });
FacilitySchema.index({ isActive: 1 });
FacilitySchema.index({ name: 'text', address: 'text', city: 'text' });

export const FacilityModel = mongoose.model<IFacility>('Facility', FacilitySchema);
