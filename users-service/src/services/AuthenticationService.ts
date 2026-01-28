import { IUserRepository, UserData } from "../infrastructure/repositories/IUserRepository.js";
import { IPatientRepository } from "../infrastructure/repositories/IPatientRepository.js";
import { IDoctorRepository } from "../infrastructure/repositories/IDoctorRepository.js";
import { Patient } from "../domains/Patient.js";
import { Doctor } from "../domains/Doctor.js";
import { FiscalCode } from "../domains/value-objects/FiscalCode.js";
import { User } from "../domains/User.js";
import { Credentials } from "../domains/value-objects/Credentials.js";
import { ProfileInfo } from "../domains/value-objects/ProfileInfo.js";
import { AuthenticatedUserFactory, IAuthenticatedUser } from "./AuthenticatedUserFactory.js";
import { toUUID } from "../utils/uuid.js"; 

export class AuthenticationService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly patientRepository: IPatientRepository,
        private readonly doctorRepository: IDoctorRepository
    ) {}

    async login(fiscalCodeValue: string, password: string): Promise<IAuthenticatedUser> {
        const userData = await this.userRepository.findByFiscalCode(fiscalCodeValue);
        if (!userData) throw new Error('Invalid credentials');

        const user = this.reconstructUser(userData);
        const isValid = await user.authenticate(password);
        if (!isValid) throw new Error('Invalid credentials');

        const { patient, doctor } = await this.loadUserProfiles(userData.userId);

        // Use factory to create appropriate authenticated user type
        return AuthenticatedUserFactory.create(user, patient, doctor);
    }

    private reconstructUser(userData: UserData): User {
        const fiscalCode = FiscalCode.reconstitute(userData.fiscalCode);
        const credentials = Credentials.reconstitute(fiscalCode, userData.passwordHash);
        const profileInfo = ProfileInfo.reconstitute(
            userData.name,
            userData.lastName,
            userData.dateOfBirth
        );
        return User.reconstitute(toUUID(userData.userId), fiscalCode, credentials, profileInfo);
    }

    async getProfileData(userId: string, selectedProfile: 'PATIENT' | 'DOCTOR') {
        const userData = await this.userRepository.findById(userId);
        if (!userData) throw new Error('User not found');

        const { patientData, doctorData } = await this.loadUserProfiles(userId);

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
                    activeDelegationIds: patientData.activeDelegationIds,
                },
            };
        }

        if (!doctorData) {
            throw new Error('User does not have doctor profile');
        }

        return {
            ...baseData,
            doctor: {
                userId: doctorData.userId,
                medicalLicenseNumber: doctorData.medicalLicenseNumber,
                specializations: doctorData.specializations,
                assignedPatientUserIds: doctorData.assignedPatientUserIds,
            },
        };
    }

    private async loadUserProfiles(userId: string) {
        const patientData = await this.patientRepository.findByUserId(userId);
        const doctorData = await this.doctorRepository.findByUserId(userId);

        if (!patientData) {
            throw new Error('Patient profile not found. Data integrity issue.');
        }

        const patient = Patient.reconstitute(toUUID(patientData.userId), patientData.activeDelegationIds);
        const doctor = doctorData
            ? Doctor.reconstitute(
                toUUID(doctorData.userId),
                doctorData.medicalLicenseNumber,
                doctorData.specializations,
                doctorData.assignedPatientUserIds
            )
            : null;

        return { patient, doctor, patientData, doctorData };
    }
}