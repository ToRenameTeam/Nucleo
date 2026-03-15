import { ServiceTypeModel } from '../../database/index.js';
import type {
  ServiceType,
  ServiceTypeRepository,
  ServiceTypeCreateData,
  ServiceTypeUpdateData,
  RepositoryQuery,
} from '../../../domain/index.js';
import {
  SOFT_DELETE_UPDATE,
  UPDATE_RETURN_NEW_OPTIONS,
  UPDATE_VALIDATED_OPTIONS,
} from './repository-constants.js';

export class ServiceTypeRepositoryImpl implements ServiceTypeRepository {
  async findAll(query: RepositoryQuery): Promise<ServiceType[]> {
    const docs = await ServiceTypeModel.find(query).sort({ code: 1 });
    return docs.map(this.toServiceType);
  }

  async findById(id: string): Promise<ServiceType | null> {
    const doc = await ServiceTypeModel.findById(id);
    return doc ? this.toServiceType(doc) : null;
  }

  async findByCode(code: string): Promise<ServiceType | null> {
    const doc = await ServiceTypeModel.findOne({ code });
    return doc ? this.toServiceType(doc) : null;
  }

  async create(data: ServiceTypeCreateData): Promise<ServiceType> {
    const serviceType = new ServiceTypeModel({ _id: data.code, ...data });
    const doc = await serviceType.save();
    return this.toServiceType(doc);
  }

  async updateById(id: string, input: ServiceTypeUpdateData): Promise<ServiceType | null> {
    const doc = await ServiceTypeModel.findByIdAndUpdate(id, input, UPDATE_VALIDATED_OPTIONS);
    return doc ? this.toServiceType(doc) : null;
  }

  async softDelete(id: string): Promise<ServiceType | null> {
    const doc = await ServiceTypeModel.findByIdAndUpdate(
      id,
      SOFT_DELETE_UPDATE,
      UPDATE_RETURN_NEW_OPTIONS
    );
    return doc ? this.toServiceType(doc) : null;
  }

  async permanentDelete(id: string): Promise<ServiceType | null> {
    const doc = await ServiceTypeModel.findByIdAndDelete(id);
    return doc ? this.toServiceType(doc) : null;
  }

  private toServiceType(doc: InstanceType<typeof ServiceTypeModel>): ServiceType {
    return {
      id: doc._id,
      code: doc.code,
      name: doc.name,
      description: doc.description,
      category: doc.category,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
