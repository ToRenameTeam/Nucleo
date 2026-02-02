import { FacilityModel, type IFacility } from '../domains/facility/index.js';

export interface FacilityFilter {
    city?: string;
    active?: boolean;
    search?: string;
}

export interface CreateFacilityInput {
    code: string;
    name: string;
    address: string;
    city: string;
    isActive?: boolean;
}

export interface UpdateFacilityInput {
    name?: string;
    address?: string;
    city?: string;
    isActive?: boolean;
}

export class FacilityService {
    /**
     * Get all facilities with optional filtering
     */
    async findAll(filter: FacilityFilter = {}): Promise<IFacility[]> {
        const query: Record<string, unknown> = {};

        if (filter.city) {
            query.city = { $regex: filter.city, $options: 'i' };
        }

        if (filter.active !== undefined) {
            query.isActive = filter.active;
        }

        if (filter.search) {
            query.$text = { $search: filter.search };
        }

        return FacilityModel.find(query).sort({ code: 1 });
    }

    /**
     * Get all distinct cities
     */
    async getCities(): Promise<string[]> {
        return FacilityModel.distinct('city', { isActive: true });
    }

    /**
     * Get a single facility by ID
     */
    async findById(id: string): Promise<IFacility | null> {
        return FacilityModel.findById(id);
    }

    /**
     * Create a new facility
     */
    async create(input: CreateFacilityInput): Promise<IFacility> {
        // Validate code format
        if (!input.code || !/^facility-\d{3}$/.test(input.code)) {
            throw new FacilityValidationError('Invalid code format. Must be "facility-XXX" where XXX is a 3-digit number');
        }

        // Check if code already exists
        const existing = await FacilityModel.findOne({ code: input.code });
        if (existing) {
            throw new FacilityConflictError('A facility with this code already exists');
        }

        const facility = new FacilityModel({
            _id: input.code,
            code: input.code,
            name: input.name,
            address: input.address,
            city: input.city,
            isActive: input.isActive ?? true
        });

        return facility.save();
    }

    /**
     * Update a facility
     */
    async update(id: string, input: UpdateFacilityInput): Promise<IFacility | null> {
        return FacilityModel.findByIdAndUpdate(
            id,
            input,
            { new: true, runValidators: true }
        );
    }

    /**
     * Soft delete a facility (sets isActive to false)
     */
    async softDelete(id: string): Promise<IFacility | null> {
        return FacilityModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }

    /**
     * Permanently delete a facility
     */
    async permanentDelete(id: string): Promise<IFacility | null> {
        return FacilityModel.findByIdAndDelete(id);
    }
}

// Custom error classes for better error handling
export class FacilityValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FacilityValidationError';
    }
}

export class FacilityConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FacilityConflictError';
    }
}

// Export singleton instance
export const facilityService = new FacilityService();
