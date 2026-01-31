import { IDoctorRepository, DoctorData } from '../IDoctorRepository.js';
import { DoctorModel } from '../../models/DoctorModel.js';
import type { Doctor } from '../../../domains/Doctor.js';
import type {UUID} from "crypto";

export class DoctorRepositoryImpl implements IDoctorRepository {

    async findByUserId(userId: UUID): Promise<DoctorData | null> {
        const doctor = await DoctorModel.findOne({ userId });

        if (!doctor) return null;

        return {
            userId: doctor.userId,
            medicalLicenseNumber: doctor.medicalLicenseNumber,
            specializations: doctor.specializations,
            assignedPatientUserIds: doctor.assignedPatientUserIds
        };
    }

    async findByLicenseNumber(licenseNumber: string): Promise<DoctorData | null> {
        const doctor = await DoctorModel.findOne({
            medicalLicenseNumber: licenseNumber
        });

        if (!doctor) return null;

        return {
            userId: doctor.userId,
            medicalLicenseNumber: doctor.medicalLicenseNumber,
            specializations: doctor.specializations,
            assignedPatientUserIds: doctor.assignedPatientUserIds
        };
    }

    async save(doctor: Doctor): Promise<void> {
        await DoctorModel.findOneAndUpdate(
            { userId: doctor.userId },
            {
                medicalLicenseNumber: doctor.medicalLicenseNumber,
                assignedPatientUserIds: doctor.assignedPatientUserIds,
                specializations: doctor.specialization,
            },
            {
                upsert: true,
                new: true,
            }
        );
    }

    async delete(userId: UUID): Promise<void> {
        await DoctorModel.findOneAndDelete({ userId });
    }
}