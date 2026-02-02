import type {UUID} from "crypto";

export class Patient{
    private readonly _userId: UUID  // Serves as Patient ID
    private _activeDelegationIds: string[];

    private constructor(userId: UUID, activeDelegationIds: string[] = []) {
        this._userId = userId;
        this._activeDelegationIds = activeDelegationIds;
    }

    static reconstitute(userId: UUID, activeDelegationIds: string[] = []): Patient {
        return new Patient(userId, activeDelegationIds);
    }

    addDelegation(delegationId: string): void {
        if (!this._activeDelegationIds.includes(delegationId)) {
            this._activeDelegationIds.push(delegationId);
        }
    }

    removeDelegation(delegationId: string): void {
        this._activeDelegationIds = this._activeDelegationIds.filter(id => id !== delegationId);
    }

    hasDelegations(): boolean {
        return this._activeDelegationIds.length > 0;
    }

    get activeDelegationIds(): string[] {
        return [...this._activeDelegationIds];
    }

    get userId(): string {
        return this._userId;
    }
}