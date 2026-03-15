import type { ServiceType } from '../domain/index.js';
import { ServiceCategory } from '../domain/index.js';
import type { ServiceTypeRepository } from '../domain/index.js';
import { ServiceTypeRepositoryImpl } from '../infrastructure/repositories/implementations/index.js';
import { formatEnumLabel, isValidResourceCode } from './service.utils.js';

export interface ServiceTypeFilter {
  category?: string;
  active?: boolean;
  search?: string;
}

export interface CreateServiceTypeInput {
  code: string;
  name: string;
  description?: string;
  category: ServiceCategory[];
  isActive?: boolean;
}

export interface UpdateServiceTypeInput {
  name?: string;
  description?: string;
  category?: ServiceCategory[];
  isActive?: boolean;
}

export interface CategoryInfo {
  value: ServiceCategory;
  label: string;
}

export class ServiceCatalogService {
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository = new ServiceTypeRepositoryImpl()
  ) {}

  /**
   * Get all service types with optional filtering
   */
  async findAll(filter: ServiceTypeFilter = {}): Promise<ServiceType[]> {
    const query: Record<string, unknown> = {};

    if (filter.category) {
      // Use $in to search for services that include the specified category
      query.category = { $in: [filter.category] };
    }

    if (filter.active !== undefined) {
      query.isActive = filter.active;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    return this.serviceTypeRepository.findAll(query);
  }

  /**
   * Get all available categories
   */
  getCategories(): CategoryInfo[] {
    return Object.values(ServiceCategory).map(function (category) {
      return {
        value: category,
        label: formatEnumLabel(category),
      };
    });
  }

  /**
   * Get a single service type by ID
   */
  async findById(id: string): Promise<ServiceType | null> {
    return this.serviceTypeRepository.findById(id);
  }

  /**
   * Create a new service type
   */
  async create(input: CreateServiceTypeInput): Promise<ServiceType> {
    // Validate code format
    if (!input.code || !isValidResourceCode(input.code, 'service')) {
      throw new ServiceCatalogValidationError(
        'Invalid code format. Must be "service-XXX" where XXX is a 3-digit number'
      );
    }

    // Check if code already exists
    const existing = await this.serviceTypeRepository.findByCode(input.code);
    if (existing) {
      throw new ServiceCatalogConflictError('A service type with this code already exists');
    }

    return this.serviceTypeRepository.create({
      code: input.code,
      name: input.name,
      description: input.description,
      category: input.category,
      isActive: input.isActive ?? true,
    });
  }

  /**
   * Update a service type
   */
  async update(id: string, input: UpdateServiceTypeInput): Promise<ServiceType | null> {
    return this.serviceTypeRepository.updateById(id, input);
  }

  /**
   * Soft delete a service type (sets isActive to false)
   */
  async softDelete(id: string): Promise<ServiceType | null> {
    return this.serviceTypeRepository.softDelete(id);
  }

  /**
   * Permanently delete a service type
   */
  async permanentDelete(id: string): Promise<ServiceType | null> {
    return this.serviceTypeRepository.permanentDelete(id);
  }
}

// Custom error classes for better error handling
export class ServiceCatalogValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceCatalogValidationError';
  }
}

export class ServiceCatalogConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceCatalogConflictError';
  }
}

// Export singleton instance
export const serviceCatalogService = new ServiceCatalogService();
