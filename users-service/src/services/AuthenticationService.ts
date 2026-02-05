import { IUserRepository } from "../infrastructure/repositories/IUserRepository.js";
import { IPatientRepository } from "../infrastructure/repositories/IPatientRepository.js";
import { IDoctorRepository } from "../infrastructure/repositories/IDoctorRepository.js";
import { UserFactory } from "./UserFactory.js";
import { toUUID } from "../utils/uuid.js";
import { AuthenticationResult } from "../api/dtos/UserDTOs.js";

import {
    UnauthorizedError, 
    UserNotFoundError, 
    UserValidationError 
} from "../utils/errors.js";

export class AuthService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly patientRepository: IPatientRepository,
        private readonly doctorRepository: IDoctorRepository
    ) {}

    async login(credentials: LoginInput): Promise<AuthenticationResult> {
        if (!credentials) {
            throw new UserValidationError('Fiscal code and password are required');
        }

        const userData = await this.userRepository.findByFiscalCode(credentials.fiscalCode);
        if (!userData) {
            throw new UserNotFoundError('User not found');
        }

        const patientData = await this.patientRepository.findByUserId(userData.userId);
        if (!patientData) {
            throw new UserNotFoundError('Patient profile not found. Data integrity issue.');
        }

        const doctorData = await this.doctorRepository.findByUserId(userData.userId);

        const { user, patient, doctor } = UserFactory.reconstitute({
            userId: toUUID(userData.userId),
            fiscalCode: userData.fiscalCode,
            passwordHash: userData.passwordHash,
            name: userData.name,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth,
            patientData: {
                bloodType: patientData.bloodType,
            },
            doctorData: doctorData ? {
                medicalLicenseNumber: doctorData.medicalLicenseNumber,
                specializations: doctorData.specializations,
            } : undefined,
        });

        const isValid = await user.authenticate(credentials.password);
        if (!isValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        return {
            user,
            patient,
            doctor,
            hasDoctorProfile: doctor !== null,
        };
    }

    async selectProfile(userId: string, selectedProfile: 'PATIENT' | 'DOCTOR') {
        if (!userId) {
            throw new UserValidationError('User ID is required');
        }

        if (selectedProfile !== 'PATIENT' && selectedProfile !== 'DOCTOR') {
            throw new UserValidationError('Invalid profile selection');
        }

        const userData = await this.userRepository.findUserById(userId);
        if (!userData) {
            throw new UserNotFoundError('User not found');
        }

        const patientData = await this.patientRepository.findByUserId(userId);
        if (!patientData) {
            throw new UserNotFoundError('Patient profile not found. Data integrity issue.');
        }

        const doctorData = await this.doctorRepository.findByUserId(userId);

        const baseData = {
            userId: userData.userId,
            fiscalCode: userData.fiscalCode,
            name: userData.name,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth,
            activeProfile: selectedProfile,
        };

        if (selectedProfile === 'PATIENT') {
            return {
                ...baseData,
                patient: {
                    userId: patientData.userId,
                    bloodType: patientData.bloodType,
                },
            };
        }

        if (!doctorData) {
            throw new UserValidationError('User does not have doctor profile');
        }

        return {
            ...baseData,
            doctor: {
                userId: doctorData.userId,
                medicalLicenseNumber: doctorData.medicalLicenseNumber,
                specializations: doctorData.specializations,
            },
        };
    }
}

export { AuthService as AuthenticationService };

export { 
    UnauthorizedError, 
    UserNotFoundError, 
    UserValidationError 
};

import { UserRepositoryImpl } from "../infrastructure/repositories/implementations/UserRepositoryImpl.js";
import { PatientRepositoryImpl } from "../infrastructure/repositories/implementations/PatientRepositoryImpl.js";
import { DoctorRepositoryImpl } from "../infrastructure/repositories/implementations/DoctorRepositoryImpl.js";
import {LoginInput} from "../api/dtos/UserDTOs.js";

export const authService = new AuthService(
    new UserRepositoryImpl(),
    new PatientRepositoryImpl(),
    new DoctorRepositoryImpl()
);
