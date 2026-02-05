import { Patient } from '../../src/domains/Patient.js';
import { randomUUID } from 'crypto';

describe('Patient', () => {

    describe('reconstitute', () => {
        it('should reconstitute patient with all properties', () => {
            const userId = randomUUID();

            const patient = Patient.reconstitute(userId);

            expect(patient.userId).toBe(userId);
        });
    });

    describe('getters', () => {
        it('should expose patient properties', () => {
            const userId = randomUUID();
            const patient = Patient.reconstitute(userId);

            expect(patient.userId).toBe(userId);
        });
    });
});