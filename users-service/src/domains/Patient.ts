import type {UUID} from "crypto";

export class Patient{
    private readonly _userId: UUID  // Serves as Patient ID

    private constructor(userId: UUID) {
        this._userId = userId;
    }

    static reconstitute(userId: UUID): Patient {
        return new Patient(userId);
    }

    get userId(): string {
        return this._userId;
    }
}