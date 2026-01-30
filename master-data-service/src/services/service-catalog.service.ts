import { ServiceTypeModel, ServiceCategory, type IServiceType } from '../domains/service-catalog/index.js';

export interface ServiceTypeFilter {
    category?: string;
    active?: boolean;
    search?: string;
}

export interface CreateServiceTypeInput {
    code: string;
    name: string;
    description?: string;
    category: ServiceCategory;
    isActive?: boolean;
}

export interface UpdateServiceTypeInput {
    name?: string;
    description?: string;
    category?: ServiceCategory;
    isActive?: boolean;
}

export interface CategoryInfo {
    value: ServiceCategory;
    label: string;
}

export class ServiceCatalogService {
    /**
     * Get all service types with optional filtering
     */
    async findAll(filter: ServiceTypeFilter = {}): Promise<IServiceType[]> {
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

        return ServiceTypeModel.find(query).sort({ code: 1 });
    }

    /**
     * Get all available categories
     */
    getCategories(): CategoryInfo[] {
        return Object.values(ServiceCategory).map(category => ({
            value: category,
            label: category
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        }));
    }

    /**
     * Get a single service type by ID
     */
    async findById(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findById(id);
    }

    /**
     * Create a new service type
     */
    async create(input: CreateServiceTypeInput): Promise<IServiceType> {
        // Validate code format
        if (!input.code || !/^service-\d{3}$/.test(input.code)) {
            throw new ValidationError('Invalid code format. Must be "service-XXX" where XXX is a 3-digit number');
        }

        // Check if code already exists
        const existing = await ServiceTypeModel.findOne({ code: input.code });
        if (existing) {
            throw new ConflictError('A service type with this code already exists');
        }

        const serviceType = new ServiceTypeModel({
            _id: input.code,
            code: input.code,
            name: input.name,
            description: input.description,
            category: input.category,
            isActive: input.isActive ?? true
        });

        return serviceType.save();
    }

    /**
     * Update a service type
     */
    async update(id: string, input: UpdateServiceTypeInput): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndUpdate(
            id,
            input,
            { new: true, runValidators: true }
        );
    }

    /**
     * Soft delete a service type (sets isActive to false)
     */
    async softDelete(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }

    /**
     * Permanently delete a service type
     */
    async permanentDelete(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndDelete(id);
    }
}

// Custom error classes for better error handling
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
    }
}

// Export singleton instance
export const serviceCatalogService = new ServiceCatalogService();
