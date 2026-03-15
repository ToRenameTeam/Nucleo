import type { Facility } from '../facility/index.js';
import type { RepositoryQuery } from './types.js';

export interface FacilityCreateData {
  code: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
}

export interface FacilityUpdateData {
  name?: string;
  address?: string;
  city?: string;
  isActive?: boolean;
}

export interface FacilityRepository {
  findAll(query: RepositoryQuery): Promise<Facility[]>;
  findActiveCities(): Promise<string[]>;
  findById(id: string): Promise<Facility | null>;
  findByCode(code: string): Promise<Facility | null>;
  create(data: FacilityCreateData): Promise<Facility>;
  updateById(id: string, input: FacilityUpdateData): Promise<Facility | null>;
  softDelete(id: string): Promise<Facility | null>;
  permanentDelete(id: string): Promise<Facility | null>;
}
