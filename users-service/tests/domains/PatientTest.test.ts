import { Patient } from '../../src/domains/Patient.js';
import { randomUUID } from 'crypto';

describe('Patient', () => {
    function createTestPatient(activeDelegationIds: string[] = []) {
        return Patient.reconstitute(randomUUID(), activeDelegationIds);
    }

    describe('reconstitute', () => {
        it('should reconstitute patient with all properties', () => {
            const userId = randomUUID();
            const delegationIds = ['delegation1', 'delegation2'];

            const patient = Patient.reconstitute(userId, delegationIds);

            expect(patient.userId).toBe(userId);
            expect(patient.activeDelegationIds).toEqual(delegationIds);
        });

        it('should reconstitute patient with empty delegations as default', () => {
            const userId = randomUUID();
            const patient = Patient.reconstitute(userId);

            expect(patient.activeDelegationIds).toEqual([]);
        });

        it('should preserve delegation order', () => {
            const delegations = ['delegation3', 'delegation1', 'delegation2'];
            const patient = Patient.reconstitute(randomUUID(), delegations);

            expect(patient.activeDelegationIds).toEqual(['delegation3', 'delegation1', 'delegation2']);
        });
    });

    describe('addDelegation', () => {
        it('should add a new delegation', () => {
            const patient = createTestPatient();
            patient.addDelegation('delegation1');

            expect(patient.activeDelegationIds).toContain('delegation1');
            expect(patient.activeDelegationIds).toHaveLength(1);
        });

        it('should not duplicate delegation', () => {
            const patient = createTestPatient();
            patient.addDelegation('delegation1');
            patient.addDelegation('delegation1');

            expect(patient.activeDelegationIds).toEqual(['delegation1']);
            expect(patient.activeDelegationIds).toHaveLength(1);
        });

        it('should add multiple different delegations', () => {
            const patient = createTestPatient();
            patient.addDelegation('delegation1');
            patient.addDelegation('delegation2');
            patient.addDelegation('delegation3');

            expect(patient.activeDelegationIds).toEqual(['delegation1', 'delegation2', 'delegation3']);
            expect(patient.activeDelegationIds).toHaveLength(3);
        });
    });

    describe('removeDelegation', () => {
        it('should remove an active delegation', () => {
            const patient = createTestPatient(['delegation1', 'delegation2']);
            patient.removeDelegation('delegation1');

            expect(patient.activeDelegationIds).toEqual(['delegation2']);
            expect(patient.activeDelegationIds).not.toContain('delegation1');
        });

        it('should handle removing non-existent delegation', () => {
            const patient = createTestPatient(['delegation1']);
            patient.removeDelegation('delegation2');

            expect(patient.activeDelegationIds).toEqual(['delegation1']);
        });

        it('should handle removing from empty list', () => {
            const patient = createTestPatient([]);
            patient.removeDelegation('delegation1');

            expect(patient.activeDelegationIds).toEqual([]);
        });
    });

    describe('hasDelegations', () => {
        it('should return true when patient has delegations', () => {
            const patient = createTestPatient(['delegation1']);

            expect(patient.hasDelegations()).toBe(true);
        });

        it('should return false when patient has no delegations', () => {
            const patient = createTestPatient([]);

            expect(patient.hasDelegations()).toBe(false);
        });

        it('should return false after removing all delegations', () => {
            const patient = createTestPatient(['delegation1']);
            patient.removeDelegation('delegation1');

            expect(patient.hasDelegations()).toBe(false);
        });

        it('should return true after adding a delegation', () => {
            const patient = createTestPatient([]);
            patient.addDelegation('delegation1');

            expect(patient.hasDelegations()).toBe(true);
        });
    });

    describe('getters', () => {
        it('should expose patient properties', () => {
            const userId = randomUUID();
            const delegationIds = ['delegation1', 'delegation2'];
            const patient = Patient.reconstitute(userId, delegationIds);

            expect(patient.userId).toBe(userId);
            expect(patient.activeDelegationIds).toEqual(delegationIds);
        });

        it('should return a copy of active delegation ids array', () => {
            const patient = createTestPatient(['delegation1']);
            const returnedDelegationIds = patient.activeDelegationIds;

            returnedDelegationIds.push('delegation2');

            expect(patient.activeDelegationIds).toEqual(['delegation1']);
        });
    });
});