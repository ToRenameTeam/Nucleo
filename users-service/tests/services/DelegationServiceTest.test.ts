import { DelegationService } from '../../src/services/DelegationService.js';
import { IDelegationRepository } from '../../src/infrastructure/repositories/IDelegationRepository.js';
import { IPatientRepository } from '../../src/infrastructure/repositories/IPatientRepository.js';
import { randomUUID } from 'crypto';

describe('DelegationService', () => {
    let service: DelegationService;
    let mockDelegationRepo: jest.Mocked<IDelegationRepository>;
    let mockPatientRepo: jest.Mocked<IPatientRepository>;

    beforeEach(() => {
        mockDelegationRepo = {
            findDelegationById: jest.fn(),
            findDelegationByUsers: jest.fn(),
            findByDelegatingUserId: jest.fn(),
            findByDelegatorUserId: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
        };

        mockPatientRepo = {
            findByUserId: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
        };

        service = new DelegationService(mockDelegationRepo, mockPatientRepo);
    });

    describe('createDelegation', () => {
        it('should create delegation when patients exist', async () => {
            mockPatientRepo.findByUserId.mockResolvedValue({ userId: randomUUID(), activeDelegationIds: [] });
            mockDelegationRepo.findDelegationByUsers.mockResolvedValue(null);

            const result = await service.createDelegation({
                delegatingUserId: randomUUID(),
                delegatorUserId: randomUUID()
            });

            expect(result.status).toBe('Pending');
            expect(mockDelegationRepo.create).toHaveBeenCalled();
        });

        it('should throw error if patient not found', async () => {
            mockPatientRepo.findByUserId.mockResolvedValue(null);

            await expect(service.createDelegation({
                delegatingUserId: 'invalid',
                delegatorUserId: randomUUID()
            })).rejects.toThrow('Delegating patient not found');
        });

        it('should throw error if delegation already exists', async () => {
            mockPatientRepo.findByUserId.mockResolvedValue({ userId: randomUUID(), activeDelegationIds: [] });
            mockDelegationRepo.findDelegationByUsers.mockResolvedValue({
                delegationId: randomUUID(),
                delegatingUserId: randomUUID(),
                delegatorUserId: randomUUID(),
                status: 'Active'
            });

            await expect(service.createDelegation({
                delegatingUserId: randomUUID(),
                delegatorUserId: randomUUID()
            })).rejects.toThrow('A delegation already exists between these patients');
        });
    });

    describe('acceptDelegation', () => {
        it('should accept pending delegation by delegating user', async () => {
            const delegatingId = randomUUID();
            
            mockDelegationRepo.findDelegationById.mockResolvedValue({
                delegationId: randomUUID(),
                delegatingUserId: delegatingId,
                delegatorUserId: randomUUID(),
                status: 'Pending'
            });

            const result = await service.acceptDelegation(randomUUID(), delegatingId);
            expect(result.status).toBe('Active');
        });

        it('should throw error if delegator tries to accept', async () => {
            const delegatorId = randomUUID();
            
            mockDelegationRepo.findDelegationById.mockResolvedValue({
                delegationId: randomUUID(),
                delegatingUserId: randomUUID(),
                delegatorUserId: delegatorId,
                status: 'Pending'
            });

            await expect(service.acceptDelegation(randomUUID(), delegatorId))
                .rejects.toThrow('You are not authorized to accept this delegation');
        });
    });

    describe('declineDelegation', () => {
        it('should decline pending delegation by delegating user', async () => {
            const delegatingId = randomUUID();
            
            mockDelegationRepo.findDelegationById.mockResolvedValue({
                delegationId: randomUUID(),
                delegatingUserId: delegatingId,
                delegatorUserId: randomUUID(),
                status: 'Pending'
            });

            const result = await service.declineDelegation(randomUUID(), delegatingId);
            expect(result.status).toBe('Declined');
        });
    });

    describe('deleteDelegation', () => {
        it('should delete active delegation by delegator', async () => {
            const delegatorId = randomUUID();
            
            mockDelegationRepo.findDelegationById.mockResolvedValue({
                delegationId: randomUUID(),
                delegatingUserId: randomUUID(),
                delegatorUserId: delegatorId,
                status: 'Active'
            });

            const result = await service.deleteDelegation(randomUUID(), delegatorId);
            expect(result.status).toBe('Deleted');
        });

        it('should throw error if random user tries to delete', async () => {
            mockDelegationRepo.findDelegationById.mockResolvedValue({
                delegationId: randomUUID(),
                delegatingUserId: randomUUID(),
                delegatorUserId: randomUUID(),
                status: 'Active'
            });

            await expect(service.deleteDelegation(randomUUID(), randomUUID()))
                .rejects.toThrow('You are not authorized to delete this delegation');
        });
    });

    describe('getActiveDelegationsForDelegatingUser', () => {
        it('should return active delegations with owner info', async () => {
            mockDelegationRepo.findByDelegatingUserId.mockResolvedValue([{
                delegationId: randomUUID(),
                delegatingUserId: randomUUID(),
                delegatorUserId: 'owner-id',
                status: 'Active'
            }]);
            
            mockPatientRepo.findByUserId.mockResolvedValue({
                userId: 'owner-id',
                activeDelegationIds: []
            });

            const result = await service.getActiveDelegationsForDelegatingUser(randomUUID());

            expect(result.delegations).toHaveLength(1);
            expect(result.delegations[0]?.ownerInfo?.userId).toBe('owner-id');
        });
    });
});