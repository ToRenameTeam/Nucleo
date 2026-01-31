import { ProfileInfo } from '../../../src/domains/value-objects/ProfileInfo.js';

describe('ProfileInfo', () => {
    describe('create', () => {
        it('should create profile info with valid data', () => {
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));

            expect(profileInfo.name).toBe('Mario');
            expect(profileInfo.lastName).toBe('Rossi');
            expect(profileInfo.dateOfBirth).toEqual(new Date('1980-01-01'));
        });

        it('should create profile info with different names', () => {
            const profileInfo = ProfileInfo.create('Giulia', 'Verdi', new Date('1990-05-15'));

            expect(profileInfo.name).toBe('Giulia');
            expect(profileInfo.lastName).toBe('Verdi');
        });
    });

    describe('reconstitute', () => {
        it('should reconstitute profile info', () => {
            const dateOfBirth = new Date('1985-12-25');
            const profileInfo = ProfileInfo.reconstitute('Anna', 'Bianchi', dateOfBirth);

            expect(profileInfo.name).toBe('Anna');
            expect(profileInfo.lastName).toBe('Bianchi');
            expect(profileInfo.dateOfBirth).toBe(dateOfBirth);
        });
    });

    describe('getters', () => {
        it('should return correct name', () => {
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));

            expect(profileInfo.name).toBe('Mario');
        });

        it('should return correct last name', () => {
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));

            expect(profileInfo.lastName).toBe('Rossi');
        });

        it('should return correct date of birth', () => {
            const dateOfBirth = new Date('1980-01-01');
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', dateOfBirth);

            expect(profileInfo.dateOfBirth).toEqual(dateOfBirth);
        });

        it('should return correct full name', () => {
            const profileInfo = ProfileInfo.create('Mario', 'Rossi', new Date('1980-01-01'));

            expect(profileInfo.fullName).toBe('Mario Rossi');
        });

        it('should build full name correctly with different names', () => {
            const profileInfo = ProfileInfo.create('Anna Maria', 'De Luca', new Date('1990-03-20'));

            expect(profileInfo.fullName).toBe('Anna Maria De Luca');
        });
    });
});