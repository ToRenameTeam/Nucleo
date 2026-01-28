import { IPatientRepository, PatientData } from '../IPatientRepository.js';
import { PatientModel } from '../../models/PatientModel.js';
import type { Patient } from '../../../domains/Patient.js';

export class PatientRepositoryImpl implements IPatientRepository {
    async findByUserId(userId: string): Promise<PatientData | null> {
        const patient = await PatientModel.findOne({ userId });

        if (!patient) return null;

        return {
            userId: patient.userId,
            activeDelegationIds: patient.activeDelegationIds,
        };
    }

    async save(patient: Patient): Promise<void> {
        await PatientModel.findOneAndUpdate(
            { userId: patient.userId },
            {
                activeDelegationIds: patient.activeDelegationIds,
            },
            {
                upsert: true,
                new: true,
            }
        );
    }

    async delete(userId: string): Promise<void> {
        await PatientModel.findOneAndDelete({ userId });
    }
}