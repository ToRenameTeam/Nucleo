import { MedicineModel, type IMedicine } from '../../../domains/medicine/index.js';
import type {
  IMedicineRepository,
  MedicineCreateData,
  MedicineUpdateData,
} from '../IMedicineRepository.js';
import type { RepositoryQuery } from '../types.js';
import {
  SOFT_DELETE_UPDATE,
  UPDATE_RETURN_NEW_OPTIONS,
  UPDATE_VALIDATED_OPTIONS,
} from './repository.constants.js';

export class MedicineRepositoryImpl implements IMedicineRepository {
  async findAll(query: RepositoryQuery): Promise<IMedicine[]> {
    return MedicineModel.find(query).sort({ code: 1 });
  }

  async findById(id: string): Promise<IMedicine | null> {
    return MedicineModel.findById(id);
  }

  async findByCode(code: string): Promise<IMedicine | null> {
    return MedicineModel.findOne({ code });
  }

  async create(data: MedicineCreateData): Promise<IMedicine> {
    const medicine = new MedicineModel({
      _id: data.code,
      ...data,
    });

    return medicine.save();
  }

  async updateById(id: string, input: MedicineUpdateData): Promise<IMedicine | null> {
    return MedicineModel.findByIdAndUpdate(id, input, UPDATE_VALIDATED_OPTIONS);
  }

  async softDelete(id: string): Promise<IMedicine | null> {
    return MedicineModel.findByIdAndUpdate(id, SOFT_DELETE_UPDATE, UPDATE_RETURN_NEW_OPTIONS);
  }

  async permanentDelete(id: string): Promise<IMedicine | null> {
    return MedicineModel.findByIdAndDelete(id);
  }
}
