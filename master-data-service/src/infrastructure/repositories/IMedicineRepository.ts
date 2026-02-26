import type { IMedicine, MedicineCategory } from '../../domains/medicine/index.js';
import type { RepositoryQuery } from './types.js';

export interface MedicineCreateData {
    code: string;
    name: string;
    description: string;
    category: MedicineCategory;
    activeIngredient: string;
    dosageForm: string;
    strength: string;
    manufacturer: string;
    isActive: boolean;
}

export interface MedicineUpdateData {
    name?: string;
    description?: string;
    category?: MedicineCategory;
    activeIngredient?: string;
    dosageForm?: string;
    strength?: string;
    manufacturer?: string;
    isActive?: boolean;
}

export interface IMedicineRepository {
    findAll(query: RepositoryQuery): Promise<IMedicine[]>;
    findById(id: string): Promise<IMedicine | null>;
    findByCode(code: string): Promise<IMedicine | null>;
    create(data: MedicineCreateData): Promise<IMedicine>;
    updateById(id: string, input: MedicineUpdateData): Promise<IMedicine | null>;
    softDelete(id: string): Promise<IMedicine | null>;
    permanentDelete(id: string): Promise<IMedicine | null>;
}
