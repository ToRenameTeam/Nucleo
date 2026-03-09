import { PatientModel } from '../../database/models/index.js';
import type { IPatientDocument } from '../../database/models/index.js';
import type { PatientRepository, PatientData } from '../../../domain/repositories/index.js';
import type { Patient } from '../../../domain/index.js';

export class PatientRepositoryImpl implements PatientRepository {
  async findByUserId(userId: string): Promise<PatientData | null> {
    const patient = await PatientModel.findOne({ userId });

    if (!patient) return null;

    return this.toPatientData(patient);
  }

  async save(patient: Patient): Promise<void> {
    await PatientModel.findOneAndUpdate(
      { userId: patient.userId },
      { userId: patient.userId },
      {
        upsert: true,
        new: true,
      }
    );
  }

  async delete(userId: string): Promise<void> {
    await PatientModel.findOneAndDelete({ userId });
  }

  private toPatientData(patient: IPatientDocument): PatientData {
    return {
      userId: patient.userId,
    };
  }
}
