import { MedicineModel, MedicineCategory, type IMedicine } from '../domains/medicine/index.js';

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
    /**
     * Get all medicines with optional filtering
     */
    async findAll(filter: MedicineFilter = {}): Promise<IMedicine[]> {
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

        return MedicineModel.find(query).sort({ code: 1 });
    }

    /**
     * Get all available categories
     */
    getCategories(): MedicineCategoryInfo[] {
        return Object.values(MedicineCategory).map(category => ({
            value: category,
            label: category
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        }));
    }

    /**
     * Get a single medicine by ID
     */
    async findById(id: string): Promise<IMedicine | null> {
        return MedicineModel.findById(id);
    }

    /**
     * Create a new medicine
     */
    async create(input: CreateMedicineInput): Promise<IMedicine> {
        // Validate code format
        if (!input.code || !/^medicine-\d{3}$/.test(input.code)) {
            throw new MedicineValidationError('Invalid code format. Must be "medicine-XXX" where XXX is a 3-digit number');
        }

        // Check if code already exists
        const existing = await MedicineModel.findOne({ code: input.code });
        if (existing) {
            throw new MedicineConflictError('A medicine with this code already exists');
        }

        const medicine = new MedicineModel({
            _id: input.code,
            code: input.code,
            name: input.name,
            description: input.description,
            category: input.category,
            activeIngredient: input.activeIngredient,
            dosageForm: input.dosageForm,
            strength: input.strength,
            manufacturer: input.manufacturer,
            isActive: input.isActive ?? true
        });

        return medicine.save();
    }

    /**
     * Update a medicine
     */
    async update(id: string, input: UpdateMedicineInput): Promise<IMedicine | null> {
        return MedicineModel.findByIdAndUpdate(
            id,
            input,
            { new: true, runValidators: true }
        );
    }

    /**
     * Soft delete a medicine (sets isActive to false)
     */
    async softDelete(id: string): Promise<IMedicine | null> {
        return MedicineModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }

    /**
     * Permanently delete a medicine
     */
    async permanentDelete(id: string): Promise<IMedicine | null> {
        return MedicineModel.findByIdAndDelete(id);
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
