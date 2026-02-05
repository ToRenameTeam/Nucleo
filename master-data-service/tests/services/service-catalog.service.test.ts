import '../setup.js';
import { 
    ServiceCatalogService, 
    ValidationError, 
    ConflictError,
    type CreateServiceTypeInput 
} from '../../src/services/service-catalog.service.js';
import { ServiceCategory } from '../../src/domains/service-catalog/index.js';

describe('ServiceCatalogService', () => {
    let service: ServiceCatalogService;

    beforeEach(() => {
        service = new ServiceCatalogService();
    });

    describe('create', () => {
        it('should create a new service type successfully', async () => {
            const input: CreateServiceTypeInput = {
                code: 'service-001',
                name: 'Visita Cardiologica',
                description: 'Visita specialistica cardiologica',
                category: [ServiceCategory.CARDIOLOGIA, ServiceCategory.VISITA_SPECIALISTICA],
                isActive: true
            };

            const result = await service.create(input);

            expect(result).toBeDefined();
            expect(result.code).toBe(input.code);
            expect(result.name).toBe(input.name);
            expect(result.description).toBe(input.description);
            expect(result.category).toEqual(input.category);
            expect(result.isActive).toBe(true);
        });

        it('should set isActive to true by default', async () => {
            const input: CreateServiceTypeInput = {
                code: 'service-002',
                name: 'Radiografia',
                description: 'Esame radiologico',
                category: [ServiceCategory.DIAGNOSTICA_IMMAGINI]
            };

            const result = await service.create(input);

            expect(result.isActive).toBe(true);
        });

        it('should throw ValidationError for invalid code', async () => {
            const input: CreateServiceTypeInput = {
                code: 'invalid-code',
                name: 'Test Service',
                description: 'Test Description',
                category: [ServiceCategory.ALTRO]
            };

            await expect(service.create(input)).rejects.toThrow(ValidationError);
            await expect(service.create(input)).rejects.toThrow('Invalid code format');
        });

        it('should throw ValidationError for empty code', async () => {
            const input: CreateServiceTypeInput = {
                code: '',
                name: 'Test Service',
                description: 'Test Description',
                category: [ServiceCategory.ALTRO]
            };

            await expect(service.create(input)).rejects.toThrow(ValidationError);
        });

        it('should throw ConflictError for duplicate code', async () => {
            const input: CreateServiceTypeInput = {
                code: 'service-003',
                name: 'Analisi del Sangue',
                description: 'Esami del sangue completi',
                category: [ServiceCategory.LABORATORIO]
            };

            await service.create(input);
            await expect(service.create(input)).rejects.toThrow(ConflictError);
            await expect(service.create(input)).rejects.toThrow('already exists');
        });
    });

    describe('findAll', () => {
        beforeEach(async () => {
            // Create some test service types
            await service.create({
                code: 'service-101',
                name: 'ECG',
                description: 'Elettrocardiogramma',
                category: [ServiceCategory.CARDIOLOGIA],
                isActive: true
            });

            await service.create({
                code: 'service-102',
                name: 'Ecografia',
                description: 'Esame ecografico',
                category: [ServiceCategory.DIAGNOSTICA_IMMAGINI],
                isActive: true
            });

            await service.create({
                code: 'service-103',
                name: 'Visita Ortopedica',
                description: 'Visita specialistica ortopedica',
                category: [ServiceCategory.ORTOPEDIA],
                isActive: false
            });
        });

        it('should return all service types', async () => {
            const results = await service.findAll();
            expect(results).toHaveLength(3);
        });

        it('should filter by category', async () => {
            const results = await service.findAll({ 
                category: ServiceCategory.CARDIOLOGIA 
            });
            
            expect(results).toHaveLength(1);
            expect(results[0]!.category).toContain(ServiceCategory.CARDIOLOGIA);
        });

        it('should filter by isActive', async () => {
            const activeResults = await service.findAll({ active: true });
            expect(activeResults).toHaveLength(2);

            const inactiveResults = await service.findAll({ active: false });
            expect(inactiveResults).toHaveLength(1);
        });

        it('should filter by search text', async () => {
            const results = await service.findAll({ search: 'ECG' });
            expect(results.length).toBeGreaterThanOrEqual(1);
        });

        it('should return empty array if no results', async () => {
            const results = await service.findAll({ 
                category: ServiceCategory.ODONTOIATRIA 
            });
            expect(results).toHaveLength(0);
        });
    });

    describe('findById', () => {
        it('should find a service type by id', async () => {
            const created = await service.create({
                code: 'service-201',
                name: 'TAC',
                description: 'Tomografia assiale computerizzata',
                category: [ServiceCategory.DIAGNOSTICA_IMMAGINI]
            });

            const found = await service.findById(created._id);

            expect(found).toBeDefined();
            expect(found?._id).toBe(created._id);
            expect(found?.name).toBe(created.name);
        });

        it('should return null for non-existent id', async () => {
            const found = await service.findById('service-999');
            expect(found).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a service type', async () => {
            const created = await service.create({
                code: 'service-301',
                name: 'Visita Iniziale',
                description: 'Prima visita',
                category: [ServiceCategory.ALTRO]
            });

            const updated = await service.update(created._id, {
                name: 'Visita Prima Visita Aggiornata',
                description: 'Descrizione aggiornata'
            });

            expect(updated).toBeDefined();
            expect(updated?.name).toBe('Visita Prima Visita Aggiornata');
            expect(updated?.description).toBe('Descrizione aggiornata');
        });

        it('should update only provided fields', async () => {
            const created = await service.create({
                code: 'service-302',
                name: 'Test Service',
                description: 'Test Description',
                category: [ServiceCategory.ALTRO]
            });

            const updated = await service.update(created._id, {
                name: 'Nome Aggiornato'
            });

            expect(updated?.name).toBe('Nome Aggiornato');
            expect(updated?.description).toBe('Test Description');
        });

        it('should return null for non-existent id', async () => {
            const updated = await service.update('service-999', {
                name: 'Test'
            });
            expect(updated).toBeNull();
        });
    });

    describe('softDelete', () => {
        it('should set isActive to false', async () => {
            const created = await service.create({
                code: 'service-401',
                name: 'To Delete',
                description: 'Service to be deleted',
                category: [ServiceCategory.ALTRO]
            });

            const deleted = await service.softDelete(created._id);

            expect(deleted).toBeDefined();
            expect(deleted?.isActive).toBe(false);
        });

        it('should return null for non-existent id', async () => {
            const deleted = await service.softDelete('service-999');
            expect(deleted).toBeNull();
        });
    });

    describe('permanentDelete', () => {
        it('should permanently delete a service type', async () => {
            const created = await service.create({
                code: 'service-501',
                name: 'To Delete Permanently',
                description: 'Service to be deleted permanently',
                category: [ServiceCategory.ALTRO]
            });

            const deleted = await service.permanentDelete(created._id);
            expect(deleted).toBeDefined();

            const found = await service.findById(created._id);
            expect(found).toBeNull();
        });

        it('should return null for non-existent id', async () => {
            const deleted = await service.permanentDelete('service-999');
            expect(deleted).toBeNull();
        });
    });

    describe('getCategories', () => {
        it('should return all available categories', () => {
            const categories = service.getCategories();

            expect(categories).toBeDefined();
            expect(categories.length).toBeGreaterThan(0);
            expect(categories[0]).toHaveProperty('value');
            expect(categories[0]).toHaveProperty('label');
        });

        it('should format labels correctly', () => {
            const categories = service.getCategories();
            const cardiologia = categories.find(c => c.value === ServiceCategory.CARDIOLOGIA);

            expect(cardiologia).toBeDefined();
            expect(cardiologia?.label).toBe('Cardiologia');
        });
    });
});
