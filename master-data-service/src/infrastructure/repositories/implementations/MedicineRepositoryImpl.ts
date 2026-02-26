import { MedicineModel, type IMedicine } from '../../../domains/medicine/index.js';
import type {
    IMedicineRepository,
    MedicineCreateData,
    MedicineUpdateData
} from '../IMedicineRepository.js';

export class MedicineRepositoryImpl implements IMedicineRepository {
    async findAll(query: Record<string, unknown>): Promise<IMedicine[]> {
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
            ...data
        });

        return medicine.save();
    }

    async updateById(id: string, input: MedicineUpdateData): Promise<IMedicine | null> {
        return MedicineModel.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    }

    async softDelete(id: string): Promise<IMedicine | null> {
        return MedicineModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }

    async permanentDelete(id: string): Promise<IMedicine | null> {
        return MedicineModel.findByIdAndDelete(id);
    }
}
