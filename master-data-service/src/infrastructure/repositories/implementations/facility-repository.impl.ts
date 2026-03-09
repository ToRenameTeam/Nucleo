import { FacilityModel } from '../../database/models/index.js';
import type { Facility } from '../../../domain/index.js';
import type {
  FacilityRepository,
  FacilityCreateData,
  FacilityUpdateData,
  RepositoryQuery,
} from '../../../domain/index.js';
import {
  SOFT_DELETE_UPDATE,
  UPDATE_RETURN_NEW_OPTIONS,
  UPDATE_VALIDATED_OPTIONS,
} from './repository-constants.js';

export class FacilityRepositoryImpl implements FacilityRepository {
  async findAll(query: RepositoryQuery): Promise<Facility[]> {
    const docs = await FacilityModel.find(query).sort({ code: 1 });
    return docs.map(this.toFacility);
  }

  async findActiveCities(): Promise<string[]> {
    return FacilityModel.distinct('city', { isActive: true });
  }

  async findById(id: string): Promise<Facility | null> {
    const doc = await FacilityModel.findById(id);
    return doc ? this.toFacility(doc) : null;
  }

  async findByCode(code: string): Promise<Facility | null> {
    const doc = await FacilityModel.findOne({ code });
    return doc ? this.toFacility(doc) : null;
  }

  async create(data: FacilityCreateData): Promise<Facility> {
    const facility = new FacilityModel({ _id: data.code, ...data });
    const doc = await facility.save();
    return this.toFacility(doc);
  }

  async updateById(id: string, input: FacilityUpdateData): Promise<Facility | null> {
    const doc = await FacilityModel.findByIdAndUpdate(id, input, UPDATE_VALIDATED_OPTIONS);
    return doc ? this.toFacility(doc) : null;
  }

  async softDelete(id: string): Promise<Facility | null> {
    const doc = await FacilityModel.findByIdAndUpdate(
      id,
      SOFT_DELETE_UPDATE,
      UPDATE_RETURN_NEW_OPTIONS
    );
    return doc ? this.toFacility(doc) : null;
  }

  async permanentDelete(id: string): Promise<Facility | null> {
    const doc = await FacilityModel.findByIdAndDelete(id);
    return doc ? this.toFacility(doc) : null;
  }

  private toFacility(doc: InstanceType<typeof FacilityModel>): Facility {
    return {
      id: doc._id,
      code: doc.code,
      name: doc.name,
      address: doc.address,
      city: doc.city,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
