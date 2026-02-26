import { ServiceTypeModel, type IServiceType } from '../../../domains/service-catalog/index.js';
import type {
    IServiceTypeRepository,
    ServiceTypeCreateData,
    ServiceTypeUpdateData
} from '../IServiceTypeRepository.js';
import type { RepositoryQuery } from '../types.js';
import {
    SOFT_DELETE_UPDATE,
    UPDATE_RETURN_NEW_OPTIONS,
    UPDATE_VALIDATED_OPTIONS
} from './repository.constants.js';

export class ServiceTypeRepositoryImpl implements IServiceTypeRepository {
    async findAll(query: RepositoryQuery): Promise<IServiceType[]> {
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
        return ServiceTypeModel.findByIdAndUpdate(id, input, UPDATE_VALIDATED_OPTIONS);
    }

    async softDelete(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndUpdate(id, SOFT_DELETE_UPDATE, UPDATE_RETURN_NEW_OPTIONS);
    }

    async permanentDelete(id: string): Promise<IServiceType | null> {
        return ServiceTypeModel.findByIdAndDelete(id);
    }
}
