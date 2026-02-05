import { Doctor } from '../../src/domains/Doctor.js';
import { randomUUID } from 'crypto';

describe('Doctor', () => {
    function createTestDoctor(
        specialization: string[] = ['Cardiologia']
    ) {
        return Doctor.reconstitute(
            randomUUID(),
            'ML123456',
            specialization
        );
    }

    describe('reconstitute', () => {
        it('should reconstitute doctor with all properties', () => {
            const userId = randomUUID();
            const specialization = ['Cardiologia', 'Medicina Interna'];

            const doctor = Doctor.reconstitute(userId, 'ML123456', specialization);

            expect(doctor.userId).toBe(userId);
            expect(doctor.medicalLicenseNumber).toBe('ML123456');
            expect(doctor.specialization).toEqual(specialization);
        });

        it('should reconstitute doctor with empty arrays as defaults', () => {
            const userId = randomUUID();
            const doctor = Doctor.reconstitute(userId, 'ML654321');

            expect(doctor.specialization).toEqual([]);
        });

        it('should preserve specialization', () => {
            const specializations = ['Neurologia', 'Cardiologia', 'Dermatologia'];
            const doctor = Doctor.reconstitute(randomUUID(), 'ML123', specializations);

            expect(doctor.specialization).toEqual(['Neurologia', 'Cardiologia', 'Dermatologia']);
        });
    });

    describe('getters', () => {
        it('should expose doctor properties', () => {
            const userId = randomUUID();
            const specialization = ['Cardiologia', 'Medicina Interna'];
            const doctor = Doctor.reconstitute(userId, 'ML123456', specialization);

            expect(doctor.userId).toBe(userId);
            expect(doctor.medicalLicenseNumber).toBe('ML123456');
            expect(doctor.specialization).toEqual(specialization);
        });

        it('should return a copy of specialization array', () => {
            const specialization = ['Cardiologia'];
            const doctor = createTestDoctor(specialization);
            const returnedSpecialization = doctor.specialization;

            returnedSpecialization.push('Neurologia');

            expect(doctor.specialization).toEqual(['Cardiologia']);
        });

    });
});