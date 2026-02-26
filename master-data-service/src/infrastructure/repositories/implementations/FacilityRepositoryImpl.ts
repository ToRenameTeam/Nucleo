import { FacilityModel, type IFacility } from '../../../domains/facility/index.js';
import type {
    FacilityCreateData,
    FacilityUpdateData,
    IFacilityRepository
} from '../IFacilityRepository.js';

export class FacilityRepositoryImpl implements IFacilityRepository {
    async findAll(query: Record<string, unknown>): Promise<IFacility[]> {
        return FacilityModel.find(query).sort({ code: 1 });
    }

    async findActiveCities(): Promise<string[]> {
        return FacilityModel.distinct('city', { isActive: true });
    }

    async findById(id: string): Promise<IFacility | null> {
        return FacilityModel.findById(id);
    }

    async findByCode(code: string): Promise<IFacility | null> {
        return FacilityModel.findOne({ code });
    }

    async create(data: FacilityCreateData): Promise<IFacility> {
        const facility = new FacilityModel({
            _id: data.code,
            ...data
        });

        return facility.save();
    }

    async updateById(id: string, input: FacilityUpdateData): Promise<IFacility | null> {
        return FacilityModel.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    }

    async softDelete(id: string): Promise<IFacility | null> {
        return FacilityModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }

    async permanentDelete(id: string): Promise<IFacility | null> {
        return FacilityModel.findByIdAndDelete(id);
    }
}
