import { Doctor } from '../../src/domains/Doctor.js';
import { randomUUID } from 'crypto';

describe('Doctor', () => {
    function createTestDoctor(
        specialization: string[] = ['Cardiologia'],
        assignedPatientUserIds: string[] = []
    ) {
        return Doctor.reconstitute(
            randomUUID(),
            'ML123456',
            specialization,
            assignedPatientUserIds
        );
    }

    describe('reconstitute', () => {
        it('should reconstitute doctor with all properties', () => {
            const userId = randomUUID();
            const specialization = ['Cardiologia', 'Medicina Interna'];
            const patientIds = ['patient1', 'patient2'];

            const doctor = Doctor.reconstitute(userId, 'ML123456', specialization, patientIds);

            expect(doctor.userId).toBe(userId);
            expect(doctor.medicalLicenseNumber).toBe('ML123456');
            expect(doctor.specialization).toEqual(specialization);
            expect(doctor.assignedPatientUserIds).toEqual(patientIds);
        });

        it('should reconstitute doctor with empty arrays as defaults', () => {
            const userId = randomUUID();
            const doctor = Doctor.reconstitute(userId, 'ML654321');

            expect(doctor.specialization).toEqual([]);
            expect(doctor.assignedPatientUserIds).toEqual([]);
        });

        it('should preserve specialization and patient order', () => {
            const specializations = ['Neurologia', 'Cardiologia', 'Dermatologia'];
            const patients = ['patient3', 'patient1', 'patient2'];
            const doctor = Doctor.reconstitute(randomUUID(), 'ML123', specializations, patients);

            expect(doctor.specialization).toEqual(['Neurologia', 'Cardiologia', 'Dermatologia']);
            expect(doctor.assignedPatientUserIds).toEqual(['patient3', 'patient1', 'patient2']);
        });
    });

    describe('assignPatient', () => {
        it('should assign a new patient', () => {
            const doctor = createTestDoctor();
            doctor.assignPatient('patient1');

            expect(doctor.assignedPatientUserIds).toContain('patient1');
            expect(doctor.assignedPatientUserIds).toHaveLength(1);
        });

        it('should not duplicate patient assignment', () => {
            const doctor = createTestDoctor();
            doctor.assignPatient('patient1');
            doctor.assignPatient('patient1');

            expect(doctor.assignedPatientUserIds).toEqual(['patient1']);
            expect(doctor.assignedPatientUserIds).toHaveLength(1);
        });

        it('should assign multiple different patients', () => {
            const doctor = createTestDoctor();
            doctor.assignPatient('patient1');
            doctor.assignPatient('patient2');
            doctor.assignPatient('patient3');

            expect(doctor.assignedPatientUserIds).toEqual(['patient1', 'patient2', 'patient3']);
            expect(doctor.assignedPatientUserIds).toHaveLength(3);
        });
    });

    describe('unassignPatient', () => {
        it('should remove an assigned patient', () => {
            const doctor = createTestDoctor([], ['patient1', 'patient2']);
            doctor.unassignPatient('patient1');

            expect(doctor.assignedPatientUserIds).toEqual(['patient2']);
            expect(doctor.assignedPatientUserIds).not.toContain('patient1');
        });

        it('should handle unassigning non-existent patient', () => {
            const doctor = createTestDoctor([], ['patient1']);
            doctor.unassignPatient('patient2');

            expect(doctor.assignedPatientUserIds).toEqual(['patient1']);
        });

        it('should handle unassigning from empty list', () => {
            const doctor = createTestDoctor([], []);
            doctor.unassignPatient('patient1');

            expect(doctor.assignedPatientUserIds).toEqual([]);
        });
    });

    describe('hasPatient', () => {
        it('should return true for assigned patient', () => {
            const doctor = createTestDoctor([], ['patient1', 'patient2']);

            expect(doctor.hasPatient('patient1')).toBe(true);
        });

        it('should return false for non-assigned patient', () => {
            const doctor = createTestDoctor([], ['patient1']);

            expect(doctor.hasPatient('patient2')).toBe(false);
        });

        it('should return false for empty patient list', () => {
            const doctor = createTestDoctor([], []);

            expect(doctor.hasPatient('patient1')).toBe(false);
        });
    });

    describe('getters', () => {
        it('should expose doctor properties', () => {
            const userId = randomUUID();
            const specialization = ['Cardiologia', 'Medicina Interna'];
            const patientIds = ['patient1', 'patient2'];
            const doctor = Doctor.reconstitute(userId, 'ML123456', specialization, patientIds);

            expect(doctor.userId).toBe(userId);
            expect(doctor.medicalLicenseNumber).toBe('ML123456');
            expect(doctor.specialization).toEqual(specialization);
            expect(doctor.assignedPatientUserIds).toEqual(patientIds);
        });

        it('should return a copy of specialization array', () => {
            const specialization = ['Cardiologia'];
            const doctor = createTestDoctor(specialization);
            const returnedSpecialization = doctor.specialization;

            returnedSpecialization.push('Neurologia');

            expect(doctor.specialization).toEqual(['Cardiologia']);
        });

        it('should return a copy of assigned patient ids array', () => {
            const doctor = createTestDoctor([], ['patient1']);
            const returnedPatientIds = doctor.assignedPatientUserIds;

            returnedPatientIds.push('patient2');

            expect(doctor.assignedPatientUserIds).toEqual(['patient1']);
        });
    });
});