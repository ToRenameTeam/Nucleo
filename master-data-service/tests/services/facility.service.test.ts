import {
  FacilityService,
  FacilityValidationError,
  FacilityConflictError,
  type CreateFacilityInput,
} from '../../src/services/index.js';
import type { FacilityRepository } from '../../src/domain/index.js';

describe('FacilityService', () => {
  let service: FacilityService;
  let mockRepository: jest.Mocked<FacilityRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findActiveCities: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      softDelete: jest.fn(),
      permanentDelete: jest.fn(),
    };

    service = new FacilityService(mockRepository);
  });

  describe('create', () => {
    const input: CreateFacilityInput = {
      code: 'facility-001',
      name: 'Ospedale San Giovanni',
      address: 'Via Roma 123',
      city: 'Milano',
    };

    it('should create facility with isActive defaulted to true', async () => {
      const created = {
        id: 'facility-id',
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(result).toEqual(created);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('facility-001');
      expect(mockRepository.create).toHaveBeenCalledWith({
        code: 'facility-001',
        name: 'Ospedale San Giovanni',
        address: 'Via Roma 123',
        city: 'Milano',
        isActive: true,
      });
    });

    it('should preserve provided isActive value', async () => {
      const inactiveInput: CreateFacilityInput = {
        ...input,
        code: 'facility-002',
        isActive: false,
      };

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 'facility-id-2',
        code: inactiveInput.code,
        name: inactiveInput.name,
        address: inactiveInput.address,
        city: inactiveInput.city,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(inactiveInput);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'facility-002',
          isActive: false,
        })
      );
    });

    it('should throw FacilityValidationError for invalid code format', async () => {
      await expect(
        service.create({
          ...input,
          code: 'invalid-code',
        })
      ).rejects.toThrow(FacilityValidationError);

      expect(mockRepository.findByCode).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw FacilityConflictError when code already exists', async () => {
      mockRepository.findByCode.mockResolvedValue({
        id: 'existing-id',
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(input)).rejects.toThrow(FacilityConflictError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call repository with empty query when no filter is provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should build query from city, active and search filters', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await service.findAll({
        city: 'Milano',
        active: true,
        search: 'San Giovanni',
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        city: { $regex: 'Milano', $options: 'i' },
        isActive: true,
        $text: { $search: 'San Giovanni' },
      });
    });
  });

  it('should return active cities from repository', async () => {
    mockRepository.findActiveCities.mockResolvedValue(['Milano', 'Roma']);

    const cities = await service.getCities();

    expect(cities).toEqual(['Milano', 'Roma']);
    expect(mockRepository.findActiveCities).toHaveBeenCalledTimes(1);
  });

  it('should find a facility by id', async () => {
    const facility = {
      id: 'facility-id',
      code: 'facility-101',
      name: 'Centro Medico',
      address: 'Via Test 1',
      city: 'Bologna',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findById.mockResolvedValue(facility);

    const result = await service.findById('facility-id');

    expect(result).toEqual(facility);
    expect(mockRepository.findById).toHaveBeenCalledWith('facility-id');
  });

  it('should update a facility by id', async () => {
    const updated = {
      id: 'facility-id',
      code: 'facility-301',
      name: 'Nome Aggiornato',
      address: 'Via Aggiornata 2',
      city: 'Firenze',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.updateById.mockResolvedValue(updated);

    const result = await service.update('facility-id', {
      name: 'Nome Aggiornato',
      address: 'Via Aggiornata 2',
    });

    expect(result).toEqual(updated);
    expect(mockRepository.updateById).toHaveBeenCalledWith('facility-id', {
      name: 'Nome Aggiornato',
      address: 'Via Aggiornata 2',
    });
  });

  it('should soft delete a facility', async () => {
    mockRepository.softDelete.mockResolvedValue(null);

    await service.softDelete('facility-id');

    expect(mockRepository.softDelete).toHaveBeenCalledWith('facility-id');
  });

  it('should permanently delete a facility', async () => {
    mockRepository.permanentDelete.mockResolvedValue(null);

    await service.permanentDelete('facility-id');

    expect(mockRepository.permanentDelete).toHaveBeenCalledWith('facility-id');
  });
});
