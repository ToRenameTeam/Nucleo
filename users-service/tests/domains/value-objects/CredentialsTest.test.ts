import { Credentials } from '../../../src/domains/value-objects/Credentials.js';
import { FiscalCode } from '../../../src/domains/value-objects/FiscalCode.js';

describe('Credentials', () => {
    function createTestFiscalCode(): FiscalCode {
        return FiscalCode.create('RSSMRA80A01H501U');
    }

    describe('create', () => {
        it('should create credentials with hashed password', () => {
            const fiscalCode = createTestFiscalCode();
            const credentials = Credentials.create(fiscalCode, 'SecurePassword123!');

            expect(credentials.passwordHash).toBe(
                'b926e929192ee30e047ab90fc9d1e0d811a4ccc5f0411da2047abfccc8cd8f60'
            );
            expect(credentials.passwordHash).not.toBe('SecurePassword123!');
        });

        it('should create different hashes for different passwords', () => {
            const fiscalCode = createTestFiscalCode();
            const credentials1 = Credentials.create(fiscalCode, 'Password1');
            const credentials2 = Credentials.create(fiscalCode, 'Password2');

            expect(credentials1.passwordHash).not.toBe(credentials2.passwordHash);
        });
    });

    describe('reconstitute', () => {
        it('should reconstitute credentials with password hash', () => {
            const fiscalCode = createTestFiscalCode();
            const credentials = Credentials.reconstitute(fiscalCode, 'hashedPassword123');

            expect(credentials.passwordHash).toBe('hashedPassword123');
        });
    });

    describe('verify', () => {
        it('should return true for correct password', async () => {
            const fiscalCode = createTestFiscalCode();
            const credentials = Credentials.create(fiscalCode, 'CorrectPassword123!');

            const result = await credentials.verify('CorrectPassword123!');
            expect(result).toBe(true);
        });

        it('should return false for wrong password', async () => {
            const fiscalCode = createTestFiscalCode();
            const credentials = Credentials.create(fiscalCode, 'CorrectPassword123!');

            const result = await credentials.verify('WrongPassword456!');
            expect(result).toBe(false);
        });

        it('should return false for empty password', async () => {
            const fiscalCode = createTestFiscalCode();
            const credentials = Credentials.create(fiscalCode, 'CorrectPassword123!');

            const result = await credentials.verify('');
            expect(result).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for same fiscal code and password', () => {
            const fiscalCode = createTestFiscalCode();
            const credentials1 = Credentials.create(fiscalCode, 'Password123!');
            const credentials2 = Credentials.create(fiscalCode, 'Password123!');

            expect(credentials1.equals(credentials2)).toBe(true);
        });

        it('should return false for different passwords', () => {
            const fiscalCode = createTestFiscalCode();
            const credentials1 = Credentials.create(fiscalCode, 'Password1');
            const credentials2 = Credentials.create(fiscalCode, 'Password2');

            expect(credentials1.equals(credentials2)).toBe(false);
        });

        it('should return false for different fiscal codes', () => {
            const fiscalCode1 = FiscalCode.create('RSSMRA80A01H501U');
            const fiscalCode2 = FiscalCode.create('VRDGPP85M01H501Y');
            const credentials1 = Credentials.create(fiscalCode1, 'Password123!');
            const credentials2 = Credentials.create(fiscalCode2, 'Password123!');

            expect(credentials1.equals(credentials2)).toBe(false);
        });
    });
});