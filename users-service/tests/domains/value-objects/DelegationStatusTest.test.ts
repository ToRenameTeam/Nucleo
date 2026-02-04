import { DelegationStatus } from '../../../src/domains/value-objects/DelegationStatus.js';

describe('DelegationStatus', () => {
    describe('creation', () => {
        it('should create all status types via factory methods', () => {
            expect(DelegationStatus.pending().value).toBe('Pending');
            expect(DelegationStatus.active().value).toBe('Active');
            expect(DelegationStatus.declined().value).toBe('Declined');
            expect(DelegationStatus.deleted().value).toBe('Deleted');
        });

        it('should reconstitute valid status strings', () => {
            expect(DelegationStatus.reconstitute('Active').isActive()).toBe(true);
            expect(DelegationStatus.reconstitute('Pending').isPending()).toBe(true);
        });

        it('should throw error for invalid status string', () => {
            expect(() => DelegationStatus.reconstitute('InvalidStatus')).toThrow();
        });
    });

    describe('state transitions', () => {
        it('should allow Pending to Active and Declined', () => {
            const pending = DelegationStatus.pending();
            expect(pending.canTransitionTo(DelegationStatus.active())).toBe(true);
            expect(pending.canTransitionTo(DelegationStatus.declined())).toBe(true);
            expect(pending.canTransitionTo(DelegationStatus.deleted())).toBe(false);
        });

        it('should allow Active to Deleted only', () => {
            const active = DelegationStatus.active();
            expect(active.canTransitionTo(DelegationStatus.deleted())).toBe(true);
            expect(active.canTransitionTo(DelegationStatus.pending())).toBe(false);
            expect(active.canTransitionTo(DelegationStatus.declined())).toBe(false);
        });

        it('should not allow transitions from terminal states', () => {
            const declined = DelegationStatus.declined();
            const deleted = DelegationStatus.deleted();
            
            expect(declined.canTransitionTo(DelegationStatus.active())).toBe(false);
            expect(deleted.canTransitionTo(DelegationStatus.active())).toBe(false);
        });
    });

    describe('value object behavior', () => {
        it('should identify state correctly', () => {
            const status = DelegationStatus.active();
            expect(status.isActive()).toBe(true);
            expect(status.isPending()).toBe(false);
        });

        it('should compare equality by value', () => {
            expect(DelegationStatus.active().equals(DelegationStatus.active())).toBe(true);
            expect(DelegationStatus.active().equals(DelegationStatus.pending())).toBe(false);
        });

        it('should return string representation', () => {
            expect(DelegationStatus.pending().toString()).toBe('Pending');
        });
    });
});