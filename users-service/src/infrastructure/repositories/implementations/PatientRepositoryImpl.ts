import { IPatientRepository, PatientData } from '../IPatientRepository.js';
import { PatientModel } from '../../models/PatientModel.js';
import type { Patient } from '../../../domains/Patient.js';

export class PatientRepositoryImpl implements IPatientRepository {
    async findByUserId(userId: string): Promise<PatientData | null> {
        const patient = await PatientModel.findOne({ userId });

        if (!patient) return null;

        return {
            userId: patient.userId,
            bloodType: patient.bloodType,
        };
    }

    async findByBloodType(bloodType: string): Promise<{patients: PatientData[] | null}> {
        const patients = await PatientModel.find({ bloodType });

        if (patients.length == 0) return { patients: null };

        return {
            patients: patients.map((patient) => ({
                userId: patient.userId,
                bloodType: patient.bloodType,
            })),
        }
    }

    async save(patient: Patient): Promise<void> {
        await PatientModel.findOneAndUpdate(
            { userId: patient.userId },
            {
                bloodType: patient.bloodType,
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