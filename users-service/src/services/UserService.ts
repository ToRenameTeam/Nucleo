import crypto from 'crypto';
import { UserFactory } from './UserFactory.js';
import type { IUserRepository, UserData } from '../infrastructure/repositories/IUserRepository.js';
import type { IPatientRepository } from '../infrastructure/repositories/IPatientRepository.js';
import type { IDoctorRepository } from '../infrastructure/repositories/IDoctorRepository.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import type { CreateUserInput, UserResponse } from '../api/dtos/UserDTOs.js';
import mongoose from "mongoose";
import {BloodType} from "../domains/value-objects/BloodType.js";

export class UserService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly patientRepository: IPatientRepository,
        private readonly doctorRepository: IDoctorRepository
    ) {}

    async createUser(data: CreateUserInput): Promise<UserResponse> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const existingUser = await this.userRepository.findByFiscalCode(data.fiscalCode);
            if (existingUser) {
                throw new ConflictError('User with this fiscal code already exists');
            }

            if (!BloodType.isValid(data.patient.bloodType)) {
                throw new ValidationError('Invalid blood type');
            }

            const userId = crypto.randomUUID();

            const {user, patient, doctor} = UserFactory.create({
                userId,
                fiscalCode: data.fiscalCode,
                password: data.password,
                name: data.name,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth),
                patientData: data.patient,
                doctorData: data.doctor,
            });

            await this.userRepository.create(user);
            await this.patientRepository.save(patient);

            if (doctor) {
                await this.doctorRepository.save(doctor);
            }

            return {
                userId,
                fiscalCode: data.fiscalCode,
                name: data.name,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth,
                patient: {
                    patientId: userId,
                    bloodType: data.patient.bloodType,
                },
                doctor: doctor ? {
                    doctorId: userId,
                    medicalLicenseNumber: doctor.medicalLicenseNumber,
                    specializations: doctor.specialization,
                } : undefined,
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getUserById(userId: string): Promise<UserResponse> {
        const userData = await this.userRepository.findUserById(userId);

        if (!userData) {
            throw new NotFoundError('User not found');
        }

        return this.enrichUserWithProfiles(userData);
    }

    async listUsers() {
        const { users } = await this.userRepository.findAll();

        const usersWithProfiles = await Promise.all(
            users.map(user => this.enrichUserWithProfiles(user))
        );

        return {
            users: usersWithProfiles
        };
    }

    async getUserByFiscalCode(fiscalCode: string): Promise<UserResponse> {
        const userData = await this.userRepository.findByFiscalCode(fiscalCode);

        if (!userData) {
            throw new NotFoundError('User not found');
        }

        return this.enrichUserWithProfiles(userData);
    }

    private async enrichUserWithProfiles(userData: UserData): Promise<UserResponse> {
        const patientData = await this.patientRepository.findByUserId(userData.userId);
        const doctorData = await this.doctorRepository.findByUserId(userData.userId);

        return {
            userId: userData.userId,
            fiscalCode: userData.fiscalCode,
            name: userData.name,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth.toISOString(),
            patient: patientData ? {
                patientId: patientData.userId,
                bloodType: patientData.bloodType,
            } : undefined,
            doctor: doctorData ? {
                doctorId: doctorData.userId,
                medicalLicenseNumber: doctorData.medicalLicenseNumber,
                specializations: doctorData.specializations,
            } : undefined,
        };
    }
}