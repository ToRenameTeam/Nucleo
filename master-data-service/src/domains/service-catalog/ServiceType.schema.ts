import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IServiceType {
    _id: string;
    code: string;
    name: string;
    description: string;
    category: ServiceCategory[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type ServiceTypeDocument = HydratedDocument<IServiceType>;

export enum ServiceCategory {
    VISITA_SPECIALISTICA = 'visita_specialistica',
    DIAGNOSTICA_IMMAGINI = 'diagnostica_immagini',
    LABORATORIO = 'laboratorio',
    CHIRURGIA = 'chirurgia',
    FISIOTERAPIA = 'fisioterapia',
    PREVENZIONE = 'prevenzione',
    ODONTOIATRIA = 'odontoiatria',
    OCULISTICA = 'oculistica',
    CARDIOLOGIA = 'cardiologia',
    DERMATOLOGIA = 'dermatologia',
    ORTOPEDIA = 'ortopedia',
    NEUROLOGIA = 'neurologia',
    OTORINOLARINGOIATRIA = 'otorinolaringoiatria',
    UROLOGIA = 'urologia',
    ENDOCRINOLOGIA = 'endocrinologia',
    GINECOLOGIA = 'ginecologia',
    PEDIATRIA = 'pediatria',
    ALTRO = 'altro'
}

const ServiceTypeSchema = new Schema<IServiceType>(
    {
        _id: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            match: /^service-\d{3}$/
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
            type: [String],
            required: true,
            validate: {
                validator: function(v: string[]) {
                    return v && v.length > 0 && v.every(cat => Object.values(ServiceCategory).includes(cat as ServiceCategory));
                },
                message: 'Category must be a non-empty array of valid ServiceCategory values'
            }
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        _id: false,
        timestamps: true,
        collection: 'service_types'
    }
);

// Index for faster queries
ServiceTypeSchema.index({ category: 1 });
ServiceTypeSchema.index({ isActive: 1 });
ServiceTypeSchema.index({ name: 'text', description: 'text' });

export const ServiceTypeModel = mongoose.model<IServiceType>('ServiceType', ServiceTypeSchema);
