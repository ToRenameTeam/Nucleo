import type {UUID} from "crypto";

export class Doctor {
    private readonly _userId: UUID;  // Serves as Doctor ID
    private readonly _medicalLicenseNumber: string;
    private readonly _specialization: string[];
    private _assignedPatientUserIds: string[];

    private constructor(
        userId: UUID,
        medicalLicenseNumber: string,
        specialization: string[] = [],
        assignedPatientUserIds: string[] = []
    ) {
        this._userId = userId;
        this._medicalLicenseNumber = medicalLicenseNumber;
        this._specialization = specialization;
        this._assignedPatientUserIds = assignedPatientUserIds;
    }

    static reconstitute(
        userId: UUID,
        medicalLicenseNumber: string,
        specialization: string[] = [],
        assignedPatientUserIds: string[] = []
    ): Doctor {
        return new Doctor(
            userId,
            medicalLicenseNumber,
            specialization,
            assignedPatientUserIds
        );
    }

    assignPatient(patientId: string): void {
        if (!this._assignedPatientUserIds.includes(patientId)) {
            this._assignedPatientUserIds.push(patientId);
        }
    }

    unassignPatient(patientId: string): void {
        this._assignedPatientUserIds = this._assignedPatientUserIds.filter(
            id => id !== patientId
        );
    }

    hasPatient(patientId: string): boolean {
        return this._assignedPatientUserIds.includes(patientId);
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

    get assignedPatientUserIds(): string[] {
        return [...this._assignedPatientUserIds];
    }
}