export class ProfileInfo {
    private readonly _name: string;
    private readonly _lastName: string;
    private readonly _dateOfBirth: Date;

    private constructor(name: string, lastName: string, dateOfBirth: Date) {
        this._name = name;
        this._lastName = lastName;
        this._dateOfBirth = dateOfBirth;
    }

    static create(name: string, lastName: string, dateOfBirth: Date): ProfileInfo {
        return new ProfileInfo(name, lastName, dateOfBirth);
    }

    static reconstitute(name: string, lastName: string, dateOfBirth: Date): ProfileInfo {
        return new ProfileInfo(name, lastName, dateOfBirth);
    }

    get name(): string {
        return this._name;
    }

    get lastName(): string {
        return this._lastName;
    }

    get dateOfBirth(): Date {
        return this._dateOfBirth;
    }

    get fullName(): string {
        return `${this._name} ${this._lastName}`;
    }
}