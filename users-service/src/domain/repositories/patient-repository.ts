import type { Patient } from '../index.js';

export interface PatientData {
  userId: string;
}

export interface PatientRepository {
  findByUserId(userId: string): Promise<PatientData | null>;
  save(patient: Patient): Promise<void>;
  delete(userId: string): Promise<void>;
}
