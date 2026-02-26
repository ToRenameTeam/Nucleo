import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientDocument extends Document {
    userId: string;
}

const PatientSchema = new Schema<IPatientDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            ref: 'User',
        }
    },
    {
        timestamps: true,
        collection: 'patients',
    }
);

export const PatientModel = mongoose.model<IPatientDocument>('Patient', PatientSchema);