import type { ServiceType, ServiceCategory } from '../service-catalog/index.js';
import type { RepositoryQuery } from './types.js';

export interface ServiceTypeCreateData {
  code: string;
  name: string;
  description?: string;
  category: ServiceCategory[];
  isActive: boolean;
}

export interface ServiceTypeUpdateData {
  name?: string;
  description?: string;
  category?: ServiceCategory[];
  isActive?: boolean;
}

export interface ServiceTypeRepository {
  findAll(query: RepositoryQuery): Promise<ServiceType[]>;
  findById(id: string): Promise<ServiceType | null>;
  findByCode(code: string): Promise<ServiceType | null>;
  create(data: ServiceTypeCreateData): Promise<ServiceType>;
  updateById(id: string, input: ServiceTypeUpdateData): Promise<ServiceType | null>;
  softDelete(id: string): Promise<ServiceType | null>;
  permanentDelete(id: string): Promise<ServiceType | null>;
}
