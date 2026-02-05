import { User } from '../../src/domains/User.js';
import { FiscalCode } from '../../src/domains/value-objects/FiscalCode.js';
import { Credentials } from '../../src/domains/value-objects/Credentials.js';
import { ProfileInfo } from '../../src/domains/value-objects/ProfileInfo.js';
import { randomUUID } from 'crypto';

describe('User', () => {
    function createTestUser(password: string = 'TestPassword123!') {
        const fiscalCode = FiscalCode.create('RSSMRA80A01H501U');
        const credentials = Credentials.create(fiscalCode, password);
        const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));

        return User.create(randomUUID(), fiscalCode, credentials, profileInfo);
    }

    describe('create', () => {
        it('should create user with all properties', () => {
            const userId = randomUUID();
            const fiscalCode = FiscalCode.create('RSSMRA80A01H501U');
            const credentials = Credentials.create(fiscalCode, 'Pass123!');
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));

            const user = User.create(userId, fiscalCode, credentials, profileInfo);

            expect(user.userId).toBe(userId);
            expect(user.fiscalCode).toBe(fiscalCode);
            expect(user.credentials).toBe(credentials);
            expect(user.profileInfo).toBe(profileInfo);
        });
    });

    describe('reconstitute', () => {
        it('should reconstitute user with all properties', () => {
            const userId = randomUUID();
            const fiscalCode = FiscalCode.create('RSSMRA80A01H501U');
            const credentials = Credentials.create(fiscalCode, 'Pass123!');
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));

            const user = User.reconstitute(userId, fiscalCode, credentials, profileInfo);

            expect(user.userId).toBe(userId);
            expect(user.fiscalCode).toBe(fiscalCode);
            expect(user.credentials).toBe(credentials);
            expect(user.profileInfo).toBe(profileInfo);
        });
    });

    describe('authenticate', () => {
        it('should return true for correct password', async () => {
            const user = createTestUser('CorrectPass123!');
            const result = await user.authenticate('CorrectPass123!');
            expect(result).toBe(true);
        });

        it('should return false for wrong password', async () => {
            const user = createTestUser('CorrectPass123!');
            const result = await user.authenticate('WrongPass123!');
            expect(result).toBe(false);
        });
    });

    describe('getters', () => {
        it('should return the same object references', () => {
            const fiscalCode = FiscalCode.create('RSSMRA80A01H501U');
            const credentials = Credentials.create(fiscalCode, 'Pass123!');
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));
            const user = User.create(randomUUID(), fiscalCode, credentials, profileInfo);

            expect(user.credentials).toBe(credentials);
            expect(user.profileInfo).toBe(profileInfo);
            expect(user.fiscalCode).toBe(fiscalCode);
        });
    });
});