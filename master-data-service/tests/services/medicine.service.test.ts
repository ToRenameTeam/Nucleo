import '../setup.js';
import { 
    MedicineService, 
    MedicineValidationError, 
    MedicineConflictError,
    type CreateMedicineInput 
} from '../../src/services/medicine.service.js';
import { MedicineCategory } from '../../src/domains/medicine/index.js';

describe('MedicineService', () => {
    let service: MedicineService;

    beforeEach(() => {
        service = new MedicineService();
    });

    describe('create', () => {
        it('should create a new medicine successfully', async () => {
            const input: CreateMedicineInput = {
                code: 'medicine-001',
                name: 'Aspirina',
                description: 'Acido acetilsalicilico per dolori e febbre',
                category: MedicineCategory.ANALGESICO,
                activeIngredient: 'Acido acetilsalicilico',
                dosageForm: 'Compresse',
                strength: '500mg',
                manufacturer: 'Bayer',
                isActive: true
            };

            const result = await service.create(input);

            expect(result).toBeDefined();
            expect(result.code).toBe(input.code);
            expect(result.name).toBe(input.name);
            expect(result.description).toBe(input.description);
            expect(result.category).toBe(input.category);
            expect(result.activeIngredient).toBe(input.activeIngredient);
            expect(result.dosageForm).toBe(input.dosageForm);
            expect(result.strength).toBe(input.strength);
            expect(result.manufacturer).toBe(input.manufacturer);
            expect(result.isActive).toBe(true);
        });

        it('should set isActive to true by default', async () => {
            const input: CreateMedicineInput = {
                code: 'medicine-002',
                name: 'Amoxicillina',
                description: 'Antibiotico ad ampio spettro',
                category: MedicineCategory.ANTIBIOTICO,
                activeIngredient: 'Amoxicillina',
                dosageForm: 'Capsule',
                strength: '250mg',
                manufacturer: 'Pfizer'
            };

            const result = await service.create(input);

            expect(result.isActive).toBe(true);
        });

        it('should throw MedicineValidationError for invalid code', async () => {
            const input: CreateMedicineInput = {
                code: 'invalid-code',
                name: 'Test Medicine',
                description: 'Test Description',
                category: MedicineCategory.ALTRO,
                activeIngredient: 'Test',
                dosageForm: 'Test',
                strength: 'Test',
                manufacturer: 'Test'
            };

            await expect(service.create(input)).rejects.toThrow(MedicineValidationError);
            await expect(service.create(input)).rejects.toThrow('Invalid code format');
        });

        it('should throw MedicineValidationError for empty code', async () => {
            const input: CreateMedicineInput = {
                code: '',
                name: 'Test Medicine',
                description: 'Test Description',
                category: MedicineCategory.ALTRO,
                activeIngredient: 'Test',
                dosageForm: 'Test',
                strength: 'Test',
                manufacturer: 'Test'
            };

            await expect(service.create(input)).rejects.toThrow(MedicineValidationError);
        });

        it('should throw MedicineConflictError for duplicate code', async () => {
            const input: CreateMedicineInput = {
                code: 'medicine-003',
                name: 'Ibuprofene',
                description: 'Antinfiammatorio non steroideo',
                category: MedicineCategory.ANTINFIAMMATORIO,
                activeIngredient: 'Ibuprofene',
                dosageForm: 'Compresse',
                strength: '400mg',
                manufacturer: 'Abbott'
            };

            await service.create(input);
            await expect(service.create(input)).rejects.toThrow(MedicineConflictError);
            await expect(service.create(input)).rejects.toThrow('already exists');
        });
    });

    describe('findAll', () => {
        beforeEach(async () => {
            // Create some test medicines
            await service.create({
                code: 'medicine-101',
                name: 'Paracetamolo',
                description: 'Analgesico e antipiretico',
                category: MedicineCategory.ANALGESICO,
                activeIngredient: 'Paracetamolo',
                dosageForm: 'Compresse',
                strength: '1000mg',
                manufacturer: 'Sanofi',
                isActive: true
            });

            await service.create({
                code: 'medicine-102',
                name: 'Claritromicina',
                description: 'Antibiotico macrolide',
                category: MedicineCategory.ANTIBIOTICO,
                activeIngredient: 'Claritromicina',
                dosageForm: 'Compresse',
                strength: '500mg',
                manufacturer: 'Abbott',
                isActive: true
            });

            await service.create({
                code: 'medicine-103',
                name: 'Ketoprofene',
                description: 'Antinfiammatorio FANS',
                category: MedicineCategory.ANTINFIAMMATORIO,
                activeIngredient: 'Ketoprofene',
                dosageForm: 'Gel',
                strength: '2.5%',
                manufacturer: 'Menarini',
                isActive: false
            });
        });

        it('should return all medicines', async () => {
            const results = await service.findAll();
            expect(results).toHaveLength(3);
        });

        it('should filter by category', async () => {
            const results = await service.findAll({ 
                category: MedicineCategory.ANALGESICO 
            });
            
            expect(results).toHaveLength(1);
            expect(results[0]!.category).toBe(MedicineCategory.ANALGESICO);
        });

        it('should filter by isActive', async () => {
            const activeResults = await service.findAll({ active: true });
            expect(activeResults).toHaveLength(2);

            const inactiveResults = await service.findAll({ active: false });
            expect(inactiveResults).toHaveLength(1);
        });

        it('should filter by search text', async () => {
            const results = await service.findAll({ search: 'Paracetamolo' });
            expect(results.length).toBeGreaterThanOrEqual(1);
        });

        it('should return empty array if no results', async () => {
            const results = await service.findAll({ 
                category: MedicineCategory.ONCOLOGICO 
            });
            expect(results).toHaveLength(0);
        });
    });

    describe('findById', () => {
        it('should find a medicine by id', async () => {
            const created = await service.create({
                code: 'medicine-201',
                name: 'Metformina',
                description: 'Antidiabetico orale',
                category: MedicineCategory.ALTRO,
                activeIngredient: 'Metformina',
                dosageForm: 'Compresse',
                strength: '850mg',
                manufacturer: 'Merck'
            });

            const found = await service.findById(created._id);

            expect(found).toBeDefined();
            expect(found?._id).toBe(created._id);
            expect(found?.name).toBe(created.name);
        });

        it('should return null for non-existent id', async () => {
            const found = await service.findById('medicine-999');
            expect(found).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a medicine', async () => {
            const created = await service.create({
                code: 'medicine-301',
                name: 'Nome Originale',
                description: 'Descrizione Originale',
                category: MedicineCategory.ALTRO,
                activeIngredient: 'Principio Attivo',
                dosageForm: 'Forma',
                strength: 'Dosaggio',
                manufacturer: 'Produttore'
            });

            const updated = await service.update(created._id, {
                name: 'Nome Aggiornato',
                description: 'Descrizione Aggiornata',
                strength: 'Nuovo Dosaggio'
            });

            expect(updated).toBeDefined();
            expect(updated?.name).toBe('Nome Aggiornato');
            expect(updated?.description).toBe('Descrizione Aggiornata');
            expect(updated?.strength).toBe('Nuovo Dosaggio');
            expect(updated?.manufacturer).toBe('Produttore');
        });

        it('should update only provided fields', async () => {
            const created = await service.create({
                code: 'medicine-302',
                name: 'Test Medicine',
                description: 'Test Description',
                category: MedicineCategory.ALTRO,
                activeIngredient: 'Test',
                dosageForm: 'Test',
                strength: 'Test',
                manufacturer: 'Test'
            });

            const updated = await service.update(created._id, {
                name: 'Nome Aggiornato'
            });

            expect(updated?.name).toBe('Nome Aggiornato');
            expect(updated?.description).toBe('Test Description');
        });

        it('should return null for non-existent id', async () => {
            const updated = await service.update('medicine-999', {
                name: 'Test'
            });
            expect(updated).toBeNull();
        });
    });

    describe('softDelete', () => {
        it('should set isActive to false', async () => {
            const created = await service.create({
                code: 'medicine-401',
                name: 'To Delete',
                description: 'Medicine to be deleted',
                category: MedicineCategory.ALTRO,
                activeIngredient: 'Test',
                dosageForm: 'Test',
                strength: 'Test',
                manufacturer: 'Test'
            });

            const deleted = await service.softDelete(created._id);

            expect(deleted).toBeDefined();
            expect(deleted?.isActive).toBe(false);
        });

        it('should return null for non-existent id', async () => {
            const deleted = await service.softDelete('medicine-999');
            expect(deleted).toBeNull();
        });
    });

    describe('permanentDelete', () => {
        it('should permanently delete a medicine', async () => {
            const created = await service.create({
                code: 'medicine-501',
                name: 'To Delete Permanently',
                description: 'Medicine to be deleted permanently',
                category: MedicineCategory.ALTRO,
                activeIngredient: 'Test',
                dosageForm: 'Test',
                strength: 'Test',
                manufacturer: 'Test'
            });

            const deleted = await service.permanentDelete(created._id);
            expect(deleted).toBeDefined();

            const found = await service.findById(created._id);
            expect(found).toBeNull();
        });

        it('should return null for non-existent id', async () => {
            const deleted = await service.permanentDelete('medicine-999');
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
            const analgesico = categories.find(c => c.value === MedicineCategory.ANALGESICO);

            expect(analgesico).toBeDefined();
            expect(analgesico?.label).toBe('Analgesico');
        });

        it('should include all MedicineCategory categories', () => {
            const categories = service.getCategories();
            const categoryValues = Object.values(MedicineCategory);

            expect(categories).toHaveLength(categoryValues.length);
        });
    });
});
