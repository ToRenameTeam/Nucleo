import type { Patient } from '../../domains/Patient.js';

export interface PatientData {
    userId: string;
    bloodType: string;
}

export interface IPatientRepository {
    findByUserId(userId: string): Promise<PatientData | null>;
    findByBloodType(bloodType: string): Promise<{patients: PatientData[] | null}>;
    save(patient: Patient): Promise<void>;
    delete(userId: string): Promise<void>;
}
