import { ServiceTypeModel, type IServiceType } from '../../../domains/service-catalog/index.js';
import type {
    IServiceTypeRepository,
    ServiceTypeCreateData,
    ServiceTypeUpdateData
} from '../IServiceTypeRepository.js';

export class ServiceTypeRepositoryImpl implements IServiceTypeRepository {
    async findAll(query: Record<string, unknown>): Promise<IServiceType[]> {
        return ServiceTypeModel.find(query).sort({ code: 1 });
    }

    async findById(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findById(id);
    }

    async findByCode(code: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findOne({ code });
    }

    async create(data: ServiceTypeCreateData): Promise<IServiceType> {
        const serviceType = new ServiceTypeModel({
            _id: data.code,
            ...data
        });

        return serviceType.save();
    }

    async updateById(id: string, input: ServiceTypeUpdateData): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    }

    async softDelete(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }

    async permanentDelete(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndDelete(id);
    }
}
