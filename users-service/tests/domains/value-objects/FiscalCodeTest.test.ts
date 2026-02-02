import { FiscalCode } from '../../../src/domains/value-objects/FiscalCode.js';

describe('FiscalCode', () => {
    describe('create', () => {
        it('should create a valid fiscal code', () => {
            const fc = FiscalCode.create('RSSMRA80A01H501U');
            expect(fc.value).toBe('RSSMRA80A01H501U');
        });

        it('should normalize to uppercase', () => {
            const fc = FiscalCode.create('rssmra80a01h501u');
            expect(fc.value).toBe('RSSMRA80A01H501U');
        });

        it('should reject invalid format', () => {
            expect(() => FiscalCode.create('INVALID')).toThrow();
        });

        it('should reject empty string', () => {
            expect(() => FiscalCode.create('')).toThrow();
        });

        it('should reject fiscal code with wrong length', () => {
            expect(() => FiscalCode.create('RSSMRA80A01')).toThrow();
        });
    });

    describe('reconstitute', () => {
        it('should reconstitute without validation', () => {
            const fc = FiscalCode.reconstitute('RSSMRA80A01H501U');
            expect(fc.value).toBe('RSSMRA80A01H501U');
        });
    });
});