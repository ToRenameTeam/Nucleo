import type {Doctor, Patient, User} from "../../domains/index.js";

export interface CreateUserInput {
    fiscalCode: string;
    password: string;
    name: string;
    lastName: string;
    dateOfBirth: string;
    patient: {
        bloodType: string;
    };
    doctor?: {
        medicalLicenseNumber: string;
        specializations: string[];
    };
}

export interface UserResponse {
    userId: string;
    fiscalCode: string;
    name: string;
    lastName: string;
    dateOfBirth: string;
    patient?: {
        patientId: string;
        bloodType: string;
    };
    doctor?: {
        doctorId: string;
        medicalLicenseNumber: string;
        specializations: string[];
    };
}

export interface LoginInput {
    fiscalCode: string;
    password: string;
}

export interface AuthenticationResult {
    user: User;
    patient: Patient;
    doctor: Doctor | null;
    hasDoctorProfile: boolean;
}
