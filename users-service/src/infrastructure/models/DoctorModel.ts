import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorDocument extends Document {
    userId: string;
    medicalLicenseNumber: string;
    specializations: string[];
    assignedPatientUserIds: string[];
}

const DoctorSchema = new Schema<IDoctorDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            ref: 'User',
        },
        medicalLicenseNumber: {
            type: String,
            required: true,
            unique: true,
        },
        specializations: {
            type: [String],
            default: [],
        },
        assignedPatientUserIds: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        collection: 'doctors',
    }
);

export const DoctorModel = mongoose.model<IDoctorDocument>('Doctor', DoctorSchema);