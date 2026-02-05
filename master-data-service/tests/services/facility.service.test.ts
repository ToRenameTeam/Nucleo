import '../setup.js';
import { 
    FacilityService, 
    FacilityValidationError, 
    FacilityConflictError,
    type CreateFacilityInput 
} from '../../src/services/facility.service.js';

describe('FacilityService', () => {
    let service: FacilityService;

    beforeEach(() => {
        service = new FacilityService();
    });

    describe('create', () => {
        it('should create a new facility successfully', async () => {
            const input: CreateFacilityInput = {
                code: 'facility-001',
                name: 'Ospedale San Giovanni',
                address: 'Via Roma 123',
                city: 'Milano',
                isActive: true
            };

            const result = await service.create(input);

            expect(result).toBeDefined();
            expect(result.code).toBe(input.code);
            expect(result.name).toBe(input.name);
            expect(result.address).toBe(input.address);
            expect(result.city).toBe(input.city);
            expect(result.isActive).toBe(true);
        });

        it('should set isActive to true by default', async () => {
            const input: CreateFacilityInput = {
                code: 'facility-002',
                name: 'Clinica Privata',
                address: 'Corso Italia 45',
                city: 'Roma'
            };

            const result = await service.create(input);

            expect(result.isActive).toBe(true);
        });

        it('should throw FacilityValidationError for invalid code', async () => {
            const input: CreateFacilityInput = {
                code: 'invalid-code',
                name: 'Test Facility',
                address: 'Test Address',
                city: 'Test City'
            };

            await expect(service.create(input)).rejects.toThrow(FacilityValidationError);
            await expect(service.create(input)).rejects.toThrow('Invalid code format');
        });

        it('should throw FacilityValidationError for empty code', async () => {
            const input: CreateFacilityInput = {
                code: '',
                name: 'Test Facility',
                address: 'Test Address',
                city: 'Test City'
            };

            await expect(service.create(input)).rejects.toThrow(FacilityValidationError);
        });

        it('should throw FacilityConflictError for duplicate code', async () => {
            const input: CreateFacilityInput = {
                code: 'facility-003',
                name: 'Policlinico',
                address: 'Viale Europa 10',
                city: 'Napoli'
            };

            await service.create(input);
            await expect(service.create(input)).rejects.toThrow(FacilityConflictError);
            await expect(service.create(input)).rejects.toThrow('already exists');
        });
    });

    describe('findAll', () => {
        beforeEach(async () => {
            // Create some test facilities
            await service.create({
                code: 'facility-101',
                name: 'Ospedale Maggiore',
                address: 'Via Grande 1',
                city: 'Milano',
                isActive: true
            });

            await service.create({
                code: 'facility-102',
                name: 'Clinica Sant\'Anna',
                address: 'Via Piccola 2',
                city: 'Roma',
                isActive: true
            });

            await service.create({
                code: 'facility-103',
                name: 'Poliambulatorio Centro',
                address: 'Piazza Centrale 3',
                city: 'Milano',
                isActive: false
            });
        });

        it('should return all facilities', async () => {
            const results = await service.findAll();
            expect(results).toHaveLength(3);
        });

        it('should filter by city', async () => {
            const results = await service.findAll({ city: 'Milano' });
            expect(results).toHaveLength(2);
            results.forEach(facility => {
                expect(facility.city).toBe('Milano');
            });
        });

        it('should filter by city case-insensitive', async () => {
            const results = await service.findAll({ city: 'milano' });
            expect(results).toHaveLength(2);
        });

        it('should filter by isActive', async () => {
            const activeResults = await service.findAll({ active: true });
            expect(activeResults).toHaveLength(2);

            const inactiveResults = await service.findAll({ active: false });
            expect(inactiveResults).toHaveLength(1);
        });

        it('should filter by search text', async () => {
            const results = await service.findAll({ search: 'Ospedale' });
            expect(results.length).toBeGreaterThanOrEqual(1);
        });

        it('should return empty array if no results', async () => {
            const results = await service.findAll({ city: 'Torino' });
            expect(results).toHaveLength(0);
        });
    });

    describe('findById', () => {
        it('should find a facility by id', async () => {
            const created = await service.create({
                code: 'facility-201',
                name: 'Centro Medico',
                address: 'Via Test 123',
                city: 'Bologna'
            });

            const found = await service.findById(created._id);

            expect(found).toBeDefined();
            expect(found?._id).toBe(created._id);
            expect(found?.name).toBe(created.name);
        });

        it('should return null for non-existent id', async () => {
            const found = await service.findById('facility-999');
            expect(found).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a facility', async () => {
            const created = await service.create({
                code: 'facility-301',
                name: 'Nome Originale',
                address: 'Indirizzo Originale',
                city: 'Città Originale'
            });

            const updated = await service.update(created._id, {
                name: 'Nome Aggiornato',
                address: 'Indirizzo Aggiornato'
            });

            expect(updated).toBeDefined();
            expect(updated?.name).toBe('Nome Aggiornato');
            expect(updated?.address).toBe('Indirizzo Aggiornato');
            expect(updated?.city).toBe('Città Originale');
        });

        it('should update only provided fields', async () => {
            const created = await service.create({
                code: 'facility-302',
                name: 'Test Facility',
                address: 'Test Address',
                city: 'Test City'
            });

            const updated = await service.update(created._id, {
                name: 'Nome Aggiornato'
            });

            expect(updated?.name).toBe('Nome Aggiornato');
            expect(updated?.address).toBe('Test Address');
            expect(updated?.city).toBe('Test City');
        });

        it('should return null for non-existent id', async () => {
            const updated = await service.update('facility-999', {
                name: 'Test'
            });
            expect(updated).toBeNull();
        });
    });

    describe('softDelete', () => {
        it('should set isActive to false', async () => {
            const created = await service.create({
                code: 'facility-401',
                name: 'To Delete',
                address: 'Address',
                city: 'City'
            });

            const deleted = await service.softDelete(created._id);

            expect(deleted).toBeDefined();
            expect(deleted?.isActive).toBe(false);
        });

        it('should return null for non-existent id', async () => {
            const deleted = await service.softDelete('facility-999');
            expect(deleted).toBeNull();
        });
    });

    describe('permanentDelete', () => {
        it('should permanently delete a facility', async () => {
            const created = await service.create({
                code: 'facility-501',
                name: 'To Delete Permanently',
                address: 'Address',
                city: 'City'
            });

            const deleted = await service.permanentDelete(created._id);
            expect(deleted).toBeDefined();

            const found = await service.findById(created._id);
            expect(found).toBeNull();
        });

        it('should return null for non-existent id', async () => {
            const deleted = await service.permanentDelete('facility-999');
            expect(deleted).toBeNull();
        });
    });

    describe('getCities', () => {
        beforeEach(async () => {
            await service.create({
                code: 'facility-601',
                name: 'Facility Milano 1',
                address: 'Address 1',
                city: 'Milano',
                isActive: true
            });

            await service.create({
                code: 'facility-602',
                name: 'Facility Milano 2',
                address: 'Address 2',
                city: 'Milano',
                isActive: true
            });

            await service.create({
                code: 'facility-603',
                name: 'Facility Roma',
                address: 'Address 3',
                city: 'Roma',
                isActive: true
            });

            await service.create({
                code: 'facility-604',
                name: 'Facility Torino Inattiva',
                address: 'Address 4',
                city: 'Torino',
                isActive: false
            });
        });

        it('should return all unique cities of active facilities', async () => {
            const cities = await service.getCities();

            expect(cities).toBeDefined();
            expect(cities).toContain('Milano');
            expect(cities).toContain('Roma');
            expect(cities).not.toContain('Torino');
        });

        it('should return empty array if no active facilities', async () => {
            // Disable all facilities
            const all = await service.findAll({ active: true });
            for (const facility of all) {
                await service.softDelete(facility._id);
            }

            const cities = await service.getCities();
            expect(cities).toHaveLength(0);
        });
    });
});
