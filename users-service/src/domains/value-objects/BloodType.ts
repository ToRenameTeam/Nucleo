export type BloodTypeValue = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export class BloodType {
    private static readonly VALID_TYPES: BloodTypeValue[] = [
        'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    ];

    private readonly _value: BloodTypeValue;

    private constructor(value: BloodTypeValue) {
        this._value = value;
    }

    static reconstitute(value: string): BloodType {
        if (!BloodType.VALID_TYPES.includes(value as BloodTypeValue)) {
            throw new Error(`Invalid blood type: ${value}`);
        }
        return new BloodType(value as BloodTypeValue);
    }

    static create(value: string): BloodType {
        if (!BloodType.VALID_TYPES.includes(value as BloodTypeValue)) {
            throw new Error(`Invalid blood type: ${value}`);
        }
        return new BloodType(value as BloodTypeValue);
    }

    get value(): BloodTypeValue {
        return this._value;
    }

    equals(other: BloodType): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }

    static isValid(value: string): value is BloodTypeValue {
        return this.VALID_TYPES.includes(value as BloodTypeValue);
    }
}