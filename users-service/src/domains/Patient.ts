import type { UUID } from 'crypto';
import { BloodType } from './value-objects/BloodType.js';

export class Patient {
    private readonly _userId: UUID;
    private readonly _bloodType: BloodType;

    private constructor(userId: UUID, bloodType: BloodType) {
        this._userId = userId;
        this._bloodType = bloodType;
    }

    static create(userId: UUID, bloodType: BloodType): Patient {
        return new Patient(userId, bloodType);
    }

    static reconstitute(userId: UUID, bloodType: BloodType): Patient {
        return new Patient(userId, bloodType);
    }

    get userId(): string {
        return this._userId;
    }

    get bloodType(): string {
        return this._bloodType.value;
    }
}