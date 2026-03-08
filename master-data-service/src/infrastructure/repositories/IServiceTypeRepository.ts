import type { IServiceType, ServiceCategory } from '../../domains/service-catalog/index.js';
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

export interface IServiceTypeRepository {
  findAll(query: RepositoryQuery): Promise<IServiceType[]>;
  findById(id: string): Promise<IServiceType | null>;
  findByCode(code: string): Promise<IServiceType | null>;
  create(data: ServiceTypeCreateData): Promise<IServiceType>;
  updateById(id: string, input: ServiceTypeUpdateData): Promise<IServiceType | null>;
  softDelete(id: string): Promise<IServiceType | null>;
  permanentDelete(id: string): Promise<IServiceType | null>;
}
