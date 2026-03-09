import type { Medicine } from '../domain/index.js';
import { MedicineCategory } from '../domain/index.js';
import type { MedicineRepository } from '../domain/index.js';
import { MedicineRepositoryImpl } from '../infrastructure/repositories/implementations/index.js';
import { formatEnumLabel, isValidResourceCode } from './service.utils.js';

export interface MedicineFilter {
  category?: string;
  active?: boolean;
  search?: string;
}

export interface CreateMedicineInput {
  code: string;
  name: string;
  description: string;
  category: MedicineCategory;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  isActive?: boolean;
}

export interface UpdateMedicineInput {
  name?: string;
  description?: string;
  category?: MedicineCategory;
  activeIngredient?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  isActive?: boolean;
}

export interface MedicineCategoryInfo {
  value: MedicineCategory;
  label: string;
}

export class MedicineService {
  constructor(
    private readonly medicineRepository: MedicineRepository = new MedicineRepositoryImpl()
  ) {}

  /**
   * Get all medicines with optional filtering
   */
  async findAll(filter: MedicineFilter = {}): Promise<Medicine[]> {
    const query: Record<string, unknown> = {};

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.active !== undefined) {
      query.isActive = filter.active;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    return this.medicineRepository.findAll(query);
  }

  /**
   * Get all available categories
   */
  getCategories(): MedicineCategoryInfo[] {
    return Object.values(MedicineCategory).map(function (category) {
      return {
        value: category,
        label: formatEnumLabel(category),
      };
    });
  }

  /**
   * Get a single medicine by ID
   */
  async findById(id: string): Promise<Medicine | null> {
    return this.medicineRepository.findById(id);
  }

  /**
   * Create a new medicine
   */
  async create(input: CreateMedicineInput): Promise<Medicine> {
    // Validate code format
    if (!input.code || !isValidResourceCode(input.code, 'medicine')) {
      throw new MedicineValidationError(
        'Invalid code format. Must be "medicine-XXX" where XXX is a 3-digit number'
      );
    }

    // Check if code already exists
    const existing = await this.medicineRepository.findByCode(input.code);
    if (existing) {
      throw new MedicineConflictError('A medicine with this code already exists');
    }

    return this.medicineRepository.create({
      code: input.code,
      name: input.name,
      description: input.description,
      category: input.category,
      activeIngredient: input.activeIngredient,
      dosageForm: input.dosageForm,
      strength: input.strength,
      manufacturer: input.manufacturer,
      isActive: input.isActive ?? true,
    });
  }

  /**
   * Update a medicine
   */
  async update(id: string, input: UpdateMedicineInput): Promise<Medicine | null> {
    return this.medicineRepository.updateById(id, input);
  }

  /**
   * Soft delete a medicine (sets isActive to false)
   */
  async softDelete(id: string): Promise<Medicine | null> {
    return this.medicineRepository.softDelete(id);
  }

  /**
   * Permanently delete a medicine
   */
  async permanentDelete(id: string): Promise<Medicine | null> {
    return this.medicineRepository.permanentDelete(id);
  }
}

// Custom error classes for better error handling
export class MedicineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MedicineValidationError';
  }
}

export class MedicineConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MedicineConflictError';
  }
}

// Export singleton instance
export const medicineService = new MedicineService();
