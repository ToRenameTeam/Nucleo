import type { IFacility } from '../../domains/facility/index.js';
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

export interface IFacilityRepository {
    findAll(query: RepositoryQuery): Promise<IFacility[]>;
    findActiveCities(): Promise<string[]>;
    findById(id: string): Promise<IFacility | null>;
    findByCode(code: string): Promise<IFacility | null>;
    create(data: FacilityCreateData): Promise<IFacility>;
    updateById(id: string, input: FacilityUpdateData): Promise<IFacility | null>;
    softDelete(id: string): Promise<IFacility | null>;
    permanentDelete(id: string): Promise<IFacility | null>;
}
