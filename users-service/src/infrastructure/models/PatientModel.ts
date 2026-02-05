import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientDocument extends Document {
    userId: string;
    bloodType: string;
}

const PatientSchema = new Schema<IPatientDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            ref: 'User',
        },
        bloodType: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
        collection: 'patients',
    }
);

export const PatientModel = mongoose.model<IPatientDocument>('Patient', PatientSchema);