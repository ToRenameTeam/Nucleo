import { DoctorModel } from '../../database/index.js';
import type { IDoctorDocument } from '../../database/index.js';
import type { DoctorRepository, DoctorData } from '../../../domain/repositories/index.js';
import type { Doctor } from '../../../domain/index.js';

export class DoctorRepositoryImpl implements DoctorRepository {
  async findByUserId(userId: string): Promise<DoctorData | null> {
    const doctor = await DoctorModel.findOne({ userId });

    if (!doctor) return null;

    return this.toDoctorData(doctor);
  }

  async findByLicenseNumber(licenseNumber: string): Promise<DoctorData | null> {
    const doctor = await DoctorModel.findOne({
      medicalLicenseNumber: licenseNumber,
    });

    if (!doctor) return null;

    return this.toDoctorData(doctor);
  }

  async save(doctor: Doctor): Promise<void> {
    await DoctorModel.findOneAndUpdate(
      { userId: doctor.userId },
      {
        medicalLicenseNumber: doctor.medicalLicenseNumber,
        specializations: doctor.specialization,
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  async delete(userId: string): Promise<void> {
    await DoctorModel.findOneAndDelete({ userId });
  }

  private toDoctorData(doctor: IDoctorDocument): DoctorData {
    return {
      userId: doctor.userId,
      medicalLicenseNumber: doctor.medicalLicenseNumber,
      specializations: doctor.specializations,
    };
  }
}
