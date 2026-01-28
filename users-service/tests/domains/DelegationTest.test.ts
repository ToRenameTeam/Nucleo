import { Delegation } from '../../src/domains/Delegation.js';
import { DelegationStatus } from '../../src/domains/value-objects/DelegationStatus.js';
import { randomUUID } from 'crypto';

describe('Delegation', () => {
    describe('creation', () => {
        it('should create pending delegation between two different users', () => {
            const id = randomUUID();
            const delegating = randomUUID();
            const delegator = randomUUID();
            
            const d = Delegation.create(id, delegating, delegator);
            
            expect(d.status.isPending()).toBe(true);
            expect(d.delegatingUserId).toBe(delegating);
            expect(d.delegatorUserId).toBe(delegator);
        });

        it('should throw error when delegating to self', () => {
            const id = randomUUID();
            const sameUser = randomUUID();
            expect(() => Delegation.create(id, sameUser, sameUser)).toThrow('cannot delegate to themselves');
        });
    });

    describe('state transitions', () => {
        it('should accept pending delegation', () => {
            const d = Delegation.create(randomUUID(), randomUUID(), randomUUID());
            d.accept();
            expect(d.status.isActive()).toBe(true);
        });

        it('should decline pending delegation', () => {
            const d = Delegation.create(randomUUID(), randomUUID(), randomUUID());
            d.decline();
            expect(d.status.isDeclined()).toBe(true);
        });

        it('should delete active delegation', () => {
            const d = Delegation.reconstitute(randomUUID(), randomUUID(), randomUUID(), DelegationStatus.active());
            d.delete();
            expect(d.status.isDeleted()).toBe(true);
        });

        it('should throw error on invalid transitions', () => {
            const pending = Delegation.create(randomUUID(), randomUUID(), randomUUID());
            const active = Delegation.reconstitute(randomUUID(), randomUUID(), randomUUID(), DelegationStatus.active());
            const declined = Delegation.reconstitute(randomUUID(), randomUUID(), randomUUID(), DelegationStatus.declined());

            expect(() => active.accept()).toThrow('Cannot accept');
            expect(() => declined.decline()).toThrow('Cannot decline');
            expect(() => pending.delete()).toThrow('Cannot delete');
        });
    });

    describe('permissions', () => {
        it('should allow only delegator to accept pending delegation', () => {
            const delegating = randomUUID();
            const delegator = randomUUID();
            const d = Delegation.create(randomUUID(), delegating, delegator);

            expect(d.canBeAcceptedBy(delegator)).toBe(true);
            expect(d.canBeAcceptedBy(delegating)).toBe(false);
            expect(d.canBeAcceptedBy(randomUUID())).toBe(false);
        });

        it('should allow both parties to delete active delegation', () => {
            const delegating = randomUUID();
            const delegator = randomUUID();
            const d = Delegation.reconstitute(randomUUID(), delegating, delegator, DelegationStatus.active());

            expect(d.canBeDeletedBy(delegating)).toBe(true);
            expect(d.canBeDeletedBy(delegator)).toBe(true);
            expect(d.canBeDeletedBy(randomUUID())).toBe(false);
        });

        it('should not allow deletion of pending or terminal states', () => {
            const delegatingPending = randomUUID();
            const delegatorPending = randomUUID();
            const pending = Delegation.create(randomUUID(), delegatingPending, delegatorPending);

            const declined = Delegation.reconstitute(randomUUID(), randomUUID(), randomUUID(), DelegationStatus.declined());
            const deleted = Delegation.reconstitute(randomUUID(), randomUUID(), randomUUID(), DelegationStatus.deleted());

            expect(pending.canBeDeletedBy(delegatingPending)).toBe(false);
            expect(pending.canBeDeletedBy(delegatorPending)).toBe(false);
            expect(declined.canBeDeletedBy(randomUUID())).toBe(false);
            expect(deleted.canBeDeletedBy(randomUUID())).toBe(false);
        });
    });

    describe('properties', () => {
        it('should expose immutable properties', () => {
            const id = randomUUID();
            const delegating = randomUUID();
            const delegator = randomUUID();
            const d = Delegation.create(id, delegating, delegator);

            expect(d.delegationId).toBe(id);
            expect(d.delegatingUserId).toBe(delegating);
            expect(d.delegatorUserId).toBe(delegator);
        });
    });
});