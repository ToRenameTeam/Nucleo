import mongoose, { Schema, Document } from 'mongoose';

export interface IDelegationDocument extends Document {
    delegationId: string;
    delegatingUserId: string;
    delegatorUserId: string;
    status: 'Pending' | 'Active' | 'Declined' | 'Deleted';
}

const DelegationSchema = new Schema<IDelegationDocument>(
    {
        delegationId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        delegatingUserId: {
            type: String,
            required: true,
            index: true,
            ref: 'Patient',
        },
        delegatorUserId: {
            type: String,
            required: true,
            index: true,
            ref: 'Patient',
        },
        status: {
            type: String,
            enum: ['Pending', 'Active', 'Declined', 'Deleted'],
            default: 'Pending',
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'delegations',
    }
);

export const DelegationModel = mongoose.model<IDelegationDocument>('Delegation', DelegationSchema);