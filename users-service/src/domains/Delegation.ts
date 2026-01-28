import type {UUID} from 'crypto';
import { DelegationStatus } from './value-objects/DelegationStatus.js';

export class Delegation {
    private readonly _delegationId: UUID;
    private readonly _delegatingUserId: UUID;  //PatientId - receiver of authority
    private readonly _delegatorUserId: UUID;   //PatientId - owner of data
    private _status: DelegationStatus;

    private constructor(
        delegationId: UUID,
        delegatingUserId: UUID,
        delegatorUserId: UUID,
        status: DelegationStatus,
    ) {
        if (delegatingUserId === delegatorUserId) {
            throw new Error('A patient cannot delegate to themselves');
        }

        this._delegationId = delegationId;
        this._delegatingUserId = delegatingUserId;
        this._delegatorUserId = delegatorUserId;
        this._status = status;
    }

    static create(
        delegationId: UUID,
        delegatingUserId: UUID,
        delegatorUserId: UUID
    ): Delegation {
        return new Delegation(
            delegationId,
            delegatingUserId,
            delegatorUserId,
            DelegationStatus.pending(),
        );
    }

    static reconstitute(
        delegationId: UUID,
        delegatingUserId: UUID,
        delegatorUserId: UUID,
        status: DelegationStatus,
    ): Delegation {
        return new Delegation(
            delegationId,
            delegatingUserId,
            delegatorUserId,
            status
        );
    }

    accept(): void {
        const newStatus = DelegationStatus.active();

        if (!this._status.canTransitionTo(newStatus)) {
            throw new Error(
                `Cannot accept delegation: current status is ${this._status.value}`
            );
        }

        this._status = newStatus;
    }

    decline(): void {
        const newStatus = DelegationStatus.declined();

        if (!this._status.canTransitionTo(newStatus)) {
            throw new Error(
                `Cannot decline delegation: current status is ${this._status.value}`
            );
        }

        this._status = newStatus;
    }

    delete(): void {
        const newStatus = DelegationStatus.deleted();

        if (!this._status.canTransitionTo(newStatus)) {
            throw new Error(
                `Cannot delete delegation: current status is ${this._status.value}`
            );
        }

        this._status = newStatus;
    }

    canBeAcceptedBy(userId: UUID): boolean {
        return this._delegatorUserId === userId && this._status.isPending();
    }

    canBeDeletedBy(userId: UUID): boolean {
        return (
            (this._delegatingUserId === userId || this._delegatorUserId === userId) &&
            (this._status.isActive())
        );
    }

    get delegationId(): string {
        return this._delegationId;
    }

    get delegatingUserId(): string {
        return this._delegatingUserId;
    }

    get delegatorUserId(): string {
        return this._delegatorUserId;
    }

    get status(): DelegationStatus {
        return this._status;
    }
}