import type { UUID } from 'crypto';
import { User } from '../domains/User.js';
import { Patient } from '../domains/Patient.js';
import { Doctor } from '../domains/Doctor.js';
import { Credentials, FiscalCode, ProfileInfo } from '../domains/index.js';
import { BloodType } from '../domains/value-objects/BloodType.js';

export interface UserFactoryResult {
    user: User;
    patient: Patient;
    doctor: Doctor | null;
}

export interface CreateUserInput {
    userId: UUID;
    fiscalCode: string;
    password: string;
    name: string;
    lastName: string;
    dateOfBirth: Date;
    patientData: {
        bloodType: string;
    };
    doctorData?: {
        medicalLicenseNumber: string;
        specializations: string[];
    };
}

export interface ReconstituteUserInput {
    userId: UUID;
    fiscalCode: string;
    passwordHash: string;
    name: string;
    lastName: string;
    dateOfBirth: Date;
    patientData: {
        bloodType: string;
    };
    doctorData?: {
        medicalLicenseNumber: string;
        specializations: string[];
    };
}

export class UserFactory {
    static create(input: CreateUserInput): UserFactoryResult {
        const fiscalCode = FiscalCode.create(input.fiscalCode);
        const credentials = Credentials.create(fiscalCode, input.password);
        const profileInfo = ProfileInfo.create(
            input.name,
            input.lastName,
            input.dateOfBirth
        );

        const user = User.create(
            input.userId,
            fiscalCode,
            credentials,
            profileInfo
        );

        const bloodType = BloodType.create(input.patientData.bloodType);

        const patient = Patient.create(
            input.userId,
            bloodType
        );

        const doctor = input.doctorData ? 
            Doctor.create(
                input.userId,
                input.doctorData.medicalLicenseNumber,
                input.doctorData.specializations
            )
            : null;

        return { user, patient, doctor };
    }

    static reconstitute(input: ReconstituteUserInput): UserFactoryResult {
        const fiscalCode = FiscalCode.reconstitute(input.fiscalCode);
        const credentials = Credentials.reconstitute(fiscalCode, input.passwordHash);
        const profileInfo = ProfileInfo.reconstitute(
            input.name,
            input.lastName,
            input.dateOfBirth
        );

        const user = User.reconstitute(
            input.userId,
            fiscalCode,
            credentials,
            profileInfo
        );

        const bloodType = BloodType.reconstitute(input.patientData.bloodType);

        const patient = Patient.reconstitute(
            input.userId,
            bloodType
        );

        const doctor = input.doctorData ?
            Doctor.reconstitute(
                input.userId,
                input.doctorData.medicalLicenseNumber,
                input.doctorData.specializations
            )
            : null;

        return { user, patient, doctor };
    }
}
