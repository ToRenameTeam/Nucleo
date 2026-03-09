import type { Medicine, MedicineCategory } from '../medicine/index.js';
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

export interface MedicineRepository {
  findAll(query: RepositoryQuery): Promise<Medicine[]>;
  findById(id: string): Promise<Medicine | null>;
  findByCode(code: string): Promise<Medicine | null>;
  create(data: MedicineCreateData): Promise<Medicine>;
  updateById(id: string, input: MedicineUpdateData): Promise<Medicine | null>;
  softDelete(id: string): Promise<Medicine | null>;
  permanentDelete(id: string): Promise<Medicine | null>;
}
