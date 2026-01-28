import type { Patient } from '../../domains/Patient.js';

export interface PatientData {
    userId: string;
    activeDelegationIds: string[];
}

export interface IPatientRepository {
    findByUserId(userId: string): Promise<PatientData | null>;
    save(patient: Patient): Promise<void>;
    delete(userId: string): Promise<void>;
}