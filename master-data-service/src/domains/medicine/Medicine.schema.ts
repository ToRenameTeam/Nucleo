import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
    _id: string;
    code: string;
    name: string;
    description: string;
    category: MedicineCategory;
    activeIngredient: string;
    dosageForm: string;
    strength: string;
    manufacturer: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum MedicineCategory {
    ANALGESICO = 'analgesico',
    ANTIBIOTICO = 'antibiotico',
    ANTINFIAMMATORIO = 'antinfiammatorio',
    ANTIVIRALE = 'antivirale',
    CARDIOVASCOLARE = 'cardiovascolare',
    DERMATOLOGICO = 'dermatologico',
    GASTROINTESTINALE = 'gastrointestinale',
    NEUROLOGICO = 'neurologico',
    ONCOLOGICO = 'oncologico',
    RESPIRATORIO = 'respiratorio',
    VITAMINE = 'vitamine',
    ALTRO = 'altro'
}

const MedicineSchema = new Schema<IMedicine>(
    {
        _id: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            match: /^medicine-\d{3}$/
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: Object.values(MedicineCategory)
        },
        activeIngredient: {
            type: String,
            required: true,
            trim: true
        },
        dosageForm: {
            type: String,
            required: true,
            trim: true
        },
        strength: {
            type: String,
            required: true,
            trim: true
        },
        manufacturer: {
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
        collection: 'medicines'
    }
);

// Index for faster queries
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ isActive: 1 });
MedicineSchema.index({ activeIngredient: 1 });
MedicineSchema.index({ name: 'text', description: 'text', activeIngredient: 'text' });

export const MedicineModel = mongoose.model<IMedicine>('Medicine', MedicineSchema);
