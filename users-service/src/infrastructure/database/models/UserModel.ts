import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
    userId: string;
    fiscalCode: string;
    passwordHash: string;
    name: string;
    lastName: string;
    dateOfBirth: Date;
}

const UserSchema = new Schema<IUserDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        fiscalCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);