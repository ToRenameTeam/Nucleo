import type { Doctor } from '../../domains/Doctor.js';

export interface DoctorData {
    userId: string;
    medicalLicenseNumber: string;
    specializations: string[];
    assignedPatientUserIds: string[];
}

export interface IDoctorRepository {
    findByUserId(userId: string): Promise<DoctorData | null>;
    findByLicenseNumber(licenseNumber: string): Promise<DoctorData | null>;
    save(doctor: Doctor): Promise<void>;
    delete(userId: string): Promise<void>;
}