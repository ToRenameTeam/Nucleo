import { MedicineModel } from '../../database/index.js';
import type {
  Medicine,
  MedicineRepository,
  MedicineCreateData,
  MedicineUpdateData,
  RepositoryQuery,
} from '../../../domain/index.js';
import {
  SOFT_DELETE_UPDATE,
  UPDATE_RETURN_NEW_OPTIONS,
  UPDATE_VALIDATED_OPTIONS,
} from './repository-constants.js';

export class MedicineRepositoryImpl implements MedicineRepository {
  async findAll(query: RepositoryQuery): Promise<Medicine[]> {
    const docs = await MedicineModel.find(query).sort({ code: 1 });
    return docs.map(this.toMedicine);
  }

  async findById(id: string): Promise<Medicine | null> {
    const doc = await MedicineModel.findById(id);
    return doc ? this.toMedicine(doc) : null;
  }

  async findByCode(code: string): Promise<Medicine | null> {
    const doc = await MedicineModel.findOne({ code });
    return doc ? this.toMedicine(doc) : null;
  }

  async create(data: MedicineCreateData): Promise<Medicine> {
    const medicine = new MedicineModel({ _id: data.code, ...data });
    const doc = await medicine.save();
    return this.toMedicine(doc);
  }

  async updateById(id: string, input: MedicineUpdateData): Promise<Medicine | null> {
    const doc = await MedicineModel.findByIdAndUpdate(id, input, UPDATE_VALIDATED_OPTIONS);
    return doc ? this.toMedicine(doc) : null;
  }

  async softDelete(id: string): Promise<Medicine | null> {
    const doc = await MedicineModel.findByIdAndUpdate(
      id,
      SOFT_DELETE_UPDATE,
      UPDATE_RETURN_NEW_OPTIONS
    );
    return doc ? this.toMedicine(doc) : null;
  }

  async permanentDelete(id: string): Promise<Medicine | null> {
    const doc = await MedicineModel.findByIdAndDelete(id);
    return doc ? this.toMedicine(doc) : null;
  }

  private toMedicine(doc: InstanceType<typeof MedicineModel>): Medicine {
    return {
      id: doc._id,
      code: doc.code,
      name: doc.name,
      description: doc.description,
      category: doc.category,
      activeIngredient: doc.activeIngredient,
      dosageForm: doc.dosageForm,
      strength: doc.strength,
      manufacturer: doc.manufacturer,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
