import {
  ServiceCatalogService,
  ServiceCatalogValidationError,
  ServiceCatalogConflictError,
  type CreateServiceTypeInput,
} from '../../src/services/service-catalog.service.js';
import { ServiceCategory } from '../../src/domain/service-catalog/index.js';
import type { ServiceTypeRepository } from '../../src/domain/repositories/service-type-repository.js';

describe('ServiceCatalogService', () => {
  let service: ServiceCatalogService;
  let mockRepository: jest.Mocked<ServiceTypeRepository>;

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

    service = new ServiceCatalogService(mockRepository);
  });

  describe('create', () => {
    const input: CreateServiceTypeInput = {
      code: 'service-001',
      name: 'Visita Cardiologica',
      description: 'Visita specialistica cardiologica',
      category: [ServiceCategory.CARDIOLOGIA, ServiceCategory.VISITA_SPECIALISTICA],
    };

    it('should create service type with isActive defaulted to true', async () => {
      const created = {
        id: 'service-id',
        code: input.code,
        name: input.name,
        description: input.description ?? '',
        category: input.category,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(result).toEqual(created);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('service-001');
      expect(mockRepository.create).toHaveBeenCalledWith({
        code: 'service-001',
        name: 'Visita Cardiologica',
        description: 'Visita specialistica cardiologica',
        category: [ServiceCategory.CARDIOLOGIA, ServiceCategory.VISITA_SPECIALISTICA],
        isActive: true,
      });
    });

    it('should keep provided isActive value', async () => {
      const inactiveInput: CreateServiceTypeInput = {
        ...input,
        code: 'service-002',
        isActive: false,
      };

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 'service-id-2',
        code: inactiveInput.code,
        name: inactiveInput.name,
        description: inactiveInput.description ?? '',
        category: inactiveInput.category,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(inactiveInput);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'service-002',
          isActive: false,
        })
      );
    });

    it('should throw ServiceCatalogValidationError for invalid code', async () => {
      await expect(
        service.create({
          ...input,
          code: 'invalid-code',
        })
      ).rejects.toThrow(ServiceCatalogValidationError);

      expect(mockRepository.findByCode).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ServiceCatalogConflictError if code already exists', async () => {
      mockRepository.findByCode.mockResolvedValue({
        id: 'existing-id',
        code: input.code,
        name: input.name,
        description: input.description ?? '',
        category: input.category,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(input)).rejects.toThrow(ServiceCatalogConflictError);
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
        category: ServiceCategory.CARDIOLOGIA,
        active: true,
        search: 'Visita',
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        category: { $in: [ServiceCategory.CARDIOLOGIA] },
        isActive: true,
        $text: { $search: 'Visita' },
      });
    });
  });

  it('should find service type by id', async () => {
    const serviceType = {
      id: 'service-id',
      code: 'service-101',
      name: 'ECG',
      description: 'Elettrocardiogramma',
      category: [ServiceCategory.CARDIOLOGIA],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findById.mockResolvedValue(serviceType);

    const result = await service.findById('service-id');

    expect(result).toEqual(serviceType);
    expect(mockRepository.findById).toHaveBeenCalledWith('service-id');
  });

  it('should update service type by id', async () => {
    const updated = {
      id: 'service-id',
      code: 'service-201',
      name: 'Nome Aggiornato',
      description: 'Descrizione aggiornata',
      category: [ServiceCategory.ALTRO],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.updateById.mockResolvedValue(updated);

    const result = await service.update('service-id', {
      name: 'Nome Aggiornato',
    });

    expect(result).toEqual(updated);
    expect(mockRepository.updateById).toHaveBeenCalledWith('service-id', {
      name: 'Nome Aggiornato',
    });
  });

  it('should soft delete service type by id', async () => {
    mockRepository.softDelete.mockResolvedValue(null);

    await service.softDelete('service-id');

    expect(mockRepository.softDelete).toHaveBeenCalledWith('service-id');
  });

  it('should permanently delete service type by id', async () => {
    mockRepository.permanentDelete.mockResolvedValue(null);

    await service.permanentDelete('service-id');

    expect(mockRepository.permanentDelete).toHaveBeenCalledWith('service-id');
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
      const cardiologia = categories.find((c) => c.value === ServiceCategory.CARDIOLOGIA);

      expect(cardiologia?.label).toBe('Cardiologia');
    });
  });
});
