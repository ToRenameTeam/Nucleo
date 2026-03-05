export type DelegationStatusType = 'Pending' | 'Active' | 'Declined' | 'Deleted';

export class DelegationStatus {
    private static readonly VALID_STATUSES: DelegationStatusType[] = [
        'Pending',
        'Active',
        'Declined',
        'Deleted'
    ];

    private readonly _value: DelegationStatusType;

    private constructor(value: DelegationStatusType) {
        this._value = value;
    }

    static reconstitute(value: string): DelegationStatus {
        if (!DelegationStatus.VALID_STATUSES.includes(value as DelegationStatusType)) {
            throw new Error(`Invalid delegation status: ${value}`);
        }
        return new DelegationStatus(value as DelegationStatusType);
    }

    static pending(): DelegationStatus {
        return new DelegationStatus('Pending');
    }

    static active(): DelegationStatus {
        return new DelegationStatus('Active');
    }

    static declined(): DelegationStatus {
        return new DelegationStatus('Declined');
    }

    static deleted(): DelegationStatus {
        return new DelegationStatus('Deleted');
    }

    isPending(): boolean {
        return this._value === 'Pending';
    }

    isActive(): boolean {
        return this._value === 'Active';
    }

    isDeclined(): boolean {
        return this._value === 'Declined';
    }

    isDeleted(): boolean {
        return this._value === 'Deleted';
    }

    canTransitionTo(newStatus: DelegationStatus): boolean {
        const transitions: Record<DelegationStatusType, DelegationStatusType[]> = {
            'Pending': ['Active', 'Declined'],
            'Active': ['Deleted'],
            'Declined': [],
            'Deleted': []
        };

        return transitions[this._value].includes(newStatus._value);
    }

    get value(): DelegationStatusType {
        return this._value;
    }

    equals(other: DelegationStatus): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}