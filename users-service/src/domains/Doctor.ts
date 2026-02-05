import type {UUID} from "crypto";

export class Doctor {
    private readonly _userId: UUID;  // Serves as Doctor ID
    private readonly _medicalLicenseNumber: string;
    private readonly _specialization: string[];

    private constructor(
        userId: UUID,
        medicalLicenseNumber: string,
        specialization: string[] = [],
    ) {
        this._userId = userId;
        this._medicalLicenseNumber = medicalLicenseNumber;
        this._specialization = specialization;
    }

    static reconstitute(
        userId: UUID,
        medicalLicenseNumber: string,
        specialization: string[] = [],
    ): Doctor {
        return new Doctor(
            userId,
            medicalLicenseNumber,
            specialization,
        );
    }

    static create(
        userId: UUID,
        medicalLicenseNumber: string,
        specialization: string[] = []
    ): Doctor {
        return new Doctor(
            userId,
            medicalLicenseNumber,
            specialization,
        );
    }

    get userId(): string {
        return this._userId;
    }

    get medicalLicenseNumber(): string {
        return this._medicalLicenseNumber;
    }

    get specialization(): string[] {
        return [...this._specialization];
    }
}