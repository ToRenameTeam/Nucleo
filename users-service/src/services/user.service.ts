import crypto from 'crypto';
import { User, Patient, Doctor, FiscalCode, Credentials, ProfileInfo } from '../domain/index.js';
import type { UserRepository } from '../domain/repositories/index.js';
import type { PatientRepository } from '../domain/repositories/index.js';
import type { DoctorRepository } from '../domain/repositories/index.js';
import type { UserEventsPublisher } from '../infrastructure/kafka/user-events.publisher.js';

interface CreateUserData {
  fiscalCode: string;
  password: string;
  name: string;
  lastName: string;
  dateOfBirth: string;
  doctor?: {
    medicalLicenseNumber: string;
    specializations: string[];
  };
}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly patientRepository: PatientRepository,
    private readonly doctorRepository: DoctorRepository,
    private readonly userEventsPublisher: UserEventsPublisher | null = null
  ) {}

  async createUser(data: CreateUserData) {
    const existing = await this.userRepository.findByFiscalCode(data.fiscalCode);
    if (existing) {
      throw new Error('User with this fiscal code already exists');
    }

    const userId = crypto.randomUUID();
    const fiscalCode = FiscalCode.create(data.fiscalCode);
    const credentials = Credentials.create(fiscalCode, data.password);
    const profileInfo = ProfileInfo.create(data.name, data.lastName, new Date(data.dateOfBirth));

    const user = User.create(userId, fiscalCode, credentials, profileInfo);
    await this.userRepository.create(user);

    const patient = Patient.reconstitute(userId);
    await this.patientRepository.save(patient);

    let doctorInfo:
      | {
          medicalLicenseNumber: string;
          specializations: string[];
        }
      | undefined;

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
    return this.buildUserWithProfiles(userData);
  }

  async listUsers() {
    const { users } = await this.userRepository.findAll();

    const usersWithProfiles = await Promise.all(
      users.map(async (userData) => this.buildUserWithProfiles(userData))
    );

    return {
      users: usersWithProfiles,
    };
  }

  async getUserByFiscalCode(fiscalCode: string) {
    const userData = await this.userRepository.findByFiscalCode(fiscalCode);
    return this.buildUserWithProfiles(userData);
  }

  async deleteUser(userId: string) {
    const existingUser = await this.userRepository.findUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await this.patientRepository.delete(userId);
    await this.doctorRepository.delete(userId);
    await this.userRepository.delete(userId);

    try {
      await this.userEventsPublisher?.publishUserDeleted({
        userId,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to publish user-deleted event', error);
    }

    return {
      userId,
    };
  }

  private async buildUserWithProfiles(
    userData: Awaited<ReturnType<UserRepository['findByFiscalCode']>>
  ) {
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
      patient: patientData,
      doctor: doctorData
        ? {
            userId: doctorData.userId,
            medicalLicenseNumber: doctorData.medicalLicenseNumber,
            specializations: doctorData.specializations,
          }
        : undefined,
    };
  }
}
