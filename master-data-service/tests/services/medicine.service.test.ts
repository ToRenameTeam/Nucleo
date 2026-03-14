import {
  MedicineService,
  MedicineValidationError,
  MedicineConflictError,
  type CreateMedicineInput,
} from '../../src/services/medicine.service.js';
import { MedicineCategory } from '../../src/domain/medicine/index.js';
import type { MedicineRepository } from '../../src/domain/repositories/medicine-repository.js';

describe('MedicineService', () => {
  let service: MedicineService;
  let mockRepository: jest.Mocked<MedicineRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      softDelete: jest.fn(),
      permanentDelete: jest.fn(),
    };

    service = new MedicineService(mockRepository);
  });

  describe('create', () => {
    const input: CreateMedicineInput = {
      code: 'medicine-001',
      name: 'Aspirina',
      description: 'Acido acetilsalicilico per dolori e febbre',
      category: MedicineCategory.ANALGESICO,
      activeIngredient: 'Acido acetilsalicilico',
      dosageForm: 'Compresse',
      strength: '500mg',
      manufacturer: 'Bayer',
    };

    it('should create medicine with isActive defaulted to true', async () => {
      const created = {
        id: 'medicine-id',
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(result).toEqual(created);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('medicine-001');
      expect(mockRepository.create).toHaveBeenCalledWith({
        code: 'medicine-001',
        name: 'Aspirina',
        description: 'Acido acetilsalicilico per dolori e febbre',
        category: MedicineCategory.ANALGESICO,
        activeIngredient: 'Acido acetilsalicilico',
        dosageForm: 'Compresse',
        strength: '500mg',
        manufacturer: 'Bayer',
        isActive: true,
      });
    });

    it('should keep provided isActive value', async () => {
      const inactiveInput: CreateMedicineInput = {
        ...input,
        code: 'medicine-002',
        isActive: false,
      };

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 'medicine-id-2',
        ...inactiveInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(inactiveInput);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'medicine-002',
          isActive: false,
        })
      );
    });

    it('should throw MedicineValidationError for invalid code format', async () => {
      await expect(
        service.create({
          ...input,
          code: 'invalid-code',
        })
      ).rejects.toThrow(MedicineValidationError);

      expect(mockRepository.findByCode).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw MedicineConflictError when code already exists', async () => {
      mockRepository.findByCode.mockResolvedValue({
        id: 'existing-id',
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(input)).rejects.toThrow(MedicineConflictError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call repository with empty query when no filter is provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should build query with category, active and search filters', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await service.findAll({
        category: MedicineCategory.ANALGESICO,
        active: true,
        search: 'Aspirina',
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        category: MedicineCategory.ANALGESICO,
        isActive: true,
        $text: { $search: 'Aspirina' },
      });
    });
  });

  it('should find medicine by id', async () => {
    const medicine = {
      id: 'medicine-id',
      code: 'medicine-101',
      name: 'Paracetamolo',
      description: 'Analgesico e antipiretico',
      category: MedicineCategory.ANALGESICO,
      activeIngredient: 'Paracetamolo',
      dosageForm: 'Compresse',
      strength: '1000mg',
      manufacturer: 'Sanofi',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findById.mockResolvedValue(medicine);

    const result = await service.findById('medicine-id');

    expect(result).toEqual(medicine);
    expect(mockRepository.findById).toHaveBeenCalledWith('medicine-id');
  });

  it('should update medicine by id', async () => {
    const updated = {
      id: 'medicine-id',
      code: 'medicine-201',
      name: 'Nome Aggiornato',
      description: 'Descrizione aggiornata',
      category: MedicineCategory.ALTRO,
      activeIngredient: 'Principio Attivo',
      dosageForm: 'Compresse',
      strength: '750mg',
      manufacturer: 'Produttore',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.updateById.mockResolvedValue(updated);

    const result = await service.update('medicine-id', {
      name: 'Nome Aggiornato',
      strength: '750mg',
    });

    expect(result).toEqual(updated);
    expect(mockRepository.updateById).toHaveBeenCalledWith('medicine-id', {
      name: 'Nome Aggiornato',
      strength: '750mg',
    });
  });

  it('should soft delete medicine by id', async () => {
    mockRepository.softDelete.mockResolvedValue(null);

    await service.softDelete('medicine-id');

    expect(mockRepository.softDelete).toHaveBeenCalledWith('medicine-id');
  });

  it('should permanently delete medicine by id', async () => {
    mockRepository.permanentDelete.mockResolvedValue(null);

    await service.permanentDelete('medicine-id');

    expect(mockRepository.permanentDelete).toHaveBeenCalledWith('medicine-id');
  });

  describe('getCategories', () => {
    it('should expose categories with value and label', () => {
      const categories = service.getCategories();

      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('value');
      expect(categories[0]).toHaveProperty('label');
    });

    it('should format enum labels in a readable way', () => {
      const categories = service.getCategories();
      const analgesico = categories.find((c) => c.value === MedicineCategory.ANALGESICO);

      expect(analgesico?.label).toBe('Analgesico');
    });

    it('should include all MedicineCategory values', () => {
      const categories = service.getCategories();

      expect(categories).toHaveLength(Object.values(MedicineCategory).length);
    });
  });
});
