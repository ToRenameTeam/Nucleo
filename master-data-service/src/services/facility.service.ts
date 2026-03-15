import type { Facility } from '../domain/index.js';
import type { FacilityRepository } from '../domain/index.js';
import { FacilityRepositoryImpl } from '../infrastructure/repositories/implementations/index.js';
import { isValidResourceCode } from './service.utils.js';

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
  constructor(
    private readonly facilityRepository: FacilityRepository = new FacilityRepositoryImpl()
  ) {}

  async findAll(filter: FacilityFilter = {}): Promise<Facility[]> {
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

    return this.facilityRepository.findAll(query);
  }

  async getCities(): Promise<string[]> {
    return this.facilityRepository.findActiveCities();
  }

  async findById(id: string): Promise<Facility | null> {
    return this.facilityRepository.findById(id);
  }

  async create(input: CreateFacilityInput): Promise<Facility> {
    if (!input.code || !isValidResourceCode(input.code, 'facility')) {
      throw new FacilityValidationError(
        'Invalid code format. Must be "facility-XXX" where XXX is a 3-digit number'
      );
    }

    const existing = await this.facilityRepository.findByCode(input.code);
    if (existing) {
      throw new FacilityConflictError('A facility with this code already exists');
    }

    return this.facilityRepository.create({
      code: input.code,
      name: input.name,
      address: input.address,
      city: input.city,
      isActive: input.isActive ?? true,
    });
  }

  async update(id: string, input: UpdateFacilityInput): Promise<Facility | null> {
    return this.facilityRepository.updateById(id, input);
  }

  async softDelete(id: string): Promise<Facility | null> {
    return this.facilityRepository.softDelete(id);
  }

  async permanentDelete(id: string): Promise<Facility | null> {
    return this.facilityRepository.permanentDelete(id);
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
