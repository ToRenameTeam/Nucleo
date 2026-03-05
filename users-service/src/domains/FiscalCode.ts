export class FiscalCode {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value.toUpperCase();
    }

    static create(value: string): FiscalCode {
        const normalized = value.toUpperCase().trim();
        
        if (!FiscalCode.isValid(normalized)) {
            throw new Error('Invalid fiscal code format');
        }
        
        return new FiscalCode(normalized);
    }

    static reconstitute(value: string): FiscalCode {
        return new FiscalCode(value);
    }

    private static isValid(value: string): boolean {
        const fiscalCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
        
        if (!fiscalCodeRegex.test(value)) {
            return false;
        }
        
        return true;
    }

    equals(other: FiscalCode): boolean {
        return this._value === other._value;
    }

    get value(): string {
        return this._value;
    }

    toString(): string {
        return this._value;
    }
}