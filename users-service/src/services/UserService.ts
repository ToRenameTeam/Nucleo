import crypto from 'crypto';
import { User } from '../domains/User.js';
import { Patient } from '../domains/Patient.js';
import { Doctor } from '../domains/Doctor.js';
import { FiscalCode } from '../domains/value-objects/FiscalCode.js';
import { Credentials } from '../domains/value-objects/Credentials.js';
import { ProfileInfo } from '../domains/value-objects/ProfileInfo.js';
import type { IUserRepository } from '../infrastructure/repositories/IUserRepository.js';
import type { IPatientRepository } from '../infrastructure/repositories/IPatientRepository.js';
import type { IDoctorRepository } from '../infrastructure/repositories/IDoctorRepository.js';

export class UserService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly patientRepository: IPatientRepository,
        private readonly doctorRepository: IDoctorRepository
    ) {}

    async createUser(data: {
        fiscalCode: string;
        password: string;
        name: string;
        lastName: string;
        dateOfBirth: string;
        doctor?: {
            medicalLicenseNumber: string;
            specializations: string[];
        };
    }) {
        const existing = await this.userRepository.findByFiscalCode(data.fiscalCode);
        if (existing) {
            throw new Error('User with this fiscal code already exists');
        }

        const userId = crypto.randomUUID();
        const fiscalCode = FiscalCode.create(data.fiscalCode);
        const credentials = Credentials.create(fiscalCode, data.password);
        const profileInfo = ProfileInfo.create(
            data.name,
            data.lastName,
            new Date(data.dateOfBirth)
        );

        const user = User.create(userId, fiscalCode, credentials, profileInfo);
        await this.userRepository.create(user);

        const patient = Patient.reconstitute(userId);
        await this.patientRepository.save(patient);

        let doctorInfo = undefined;

        // Optionally create doctor profile
        if (data.doctor) {
            const doctor = Doctor.reconstitute(
                userId,
                data.doctor.medicalLicenseNumber,
                data.doctor.specializations
            );
            await this.doctorRepository.save(doctor);
            doctorInfo = {
                medicalLicenseNumber: data.doctor.medicalLicenseNumber,
                specializations: data.doctor.specializations,
            };
        }

        return {
            userId,
            fiscalCode: data.fiscalCode,
            name: data.name,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            doctor: doctorInfo,
        };
    }

    async getUserById(userId: string) {
        const userData = await this.userRepository.findUserById(userId);

        if (!userData) {
            throw new Error('User not found');
        }

        const patientData = await this.patientRepository.findByUserId(userId);
        const doctorData = await this.doctorRepository.findByUserId(userId);

        return {
            userId: userData.userId,
            fiscalCode: userData.fiscalCode,
            name: userData.name,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth.toISOString(),
            patientData: patientData,
            doctor: doctorData ? {
                medicalLicenseNumber: doctorData.medicalLicenseNumber,
                specializations: doctorData.specializations,
            } : undefined,
        };
    }

    async listUsers() {
        const { users } = await this.userRepository.findAll();

        const usersWithProfiles = await Promise.all(
            users.map(async (userData) => {
                const patientData = await this.patientRepository.findByUserId(userData.userId);
                const doctorData = await this.doctorRepository.findByUserId(userData.userId);

                return {
                    userId: userData.userId,
                    fiscalCode: userData.fiscalCode,
                    name: userData.name,
                    lastName: userData.lastName,
                    dateOfBirth: userData.dateOfBirth.toISOString(),
                    patientData: patientData,
                    doctor: doctorData ? {
                        medicalLicenseNumber: doctorData.medicalLicenseNumber,
                        specializations: doctorData.specializations,
                    } : undefined,
                };
            })
        );

        return {
            users: usersWithProfiles
        };
    }

    async getUserByFiscalCode(fiscalCode: string) {
        const userData = await this.userRepository.findByFiscalCode(fiscalCode);

        if (!userData) {
            throw new Error('User not found');
        }

        const patientData = await this.patientRepository.findByUserId(userData.userId);
        const doctorData = await this.doctorRepository.findByUserId(userData.userId);

        return {
            userId: userData.userId,
            fiscalCode: userData.fiscalCode,
            name: userData.name,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth.toISOString(),
            patientData: patientData,
            doctor: doctorData ? {
                medicalLicenseNumber: doctorData.medicalLicenseNumber,
                specializations: doctorData.specializations,
            } : undefined,
        };
    }
}