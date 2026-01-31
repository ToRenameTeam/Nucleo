import crypto from 'crypto';
import type { UUID } from 'crypto';
import { Delegation } from '../domains/Delegation.js';
import { DelegationStatus } from '../domains/value-objects/DelegationStatus.js';
import { IDelegationRepository } from '../infrastructure/repositories/IDelegationRepository.js';
import { IPatientRepository } from '../infrastructure/repositories/IPatientRepository.js';
import { toUUID } from '../utils/uuid.js';

export class DelegationService {
    constructor(
        private readonly delegationRepository: IDelegationRepository,
        private readonly patientRepository: IPatientRepository
    ) {}

    async createDelegation(data: {
        delegatingUserId: string;
        delegatorUserId: string;
    }) {
        // Validate patients exist
        const delegatingPatient = await this.patientRepository.findByUserId(data.delegatingUserId);
        if (!delegatingPatient) {
            throw new Error('Delegating patient not found');
        }

        const delegatorPatient = await this.patientRepository.findByUserId(data.delegatorUserId);
        if (!delegatorPatient) {
            throw new Error('Delegator patient not found');
        }

        const existing = await this.delegationRepository.findDelegationByUsers(
            data.delegatingUserId,
            data.delegatorUserId
        );

        if (existing && (existing.status === 'Pending' || existing.status === 'Active')) {
            throw new Error('A delegation already exists between these patients');
        }

        const delegationId: UUID = crypto.randomUUID();
        const delegation = Delegation.create(
            delegationId,
            toUUID(data.delegatingUserId),
            toUUID(data.delegatorUserId)
        );

        await this.delegationRepository.create(delegation);

        return {
            delegationId: delegation.delegationId,
            delegatingUserId: delegation.delegatingUserId,
            delegatorUserId: delegation.delegatorUserId,
            status: delegation.status.value
        };
    }

    async getAllDelegations(status?: string) {
        const delegations = await this.delegationRepository.findAll(status);

        return {
            delegations: delegations.map(d => ({
                delegationId: d.delegationId,
                delegatingUserId: d.delegatingUserId,
                delegatorUserId: d.delegatorUserId,
                status: d.status
            }))
        };
    }


    async getDelegationById(delegationId: string) {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new Error('Delegation not found');
        }

        return {
            delegationId: data.delegationId,
            delegatingUserId: data.delegatingUserId,
            delegatorUserId: data.delegatorUserId,
            status: data.status
        };
    }

    async getDelegationsForUser(userId: string, role: 'delegating' | 'delegator', status?: string) {
        const delegations = role === 'delegating'
            ? await this.delegationRepository.findByDelegatingUserId(userId, status)
            : await this.delegationRepository.findByDelegatorUserId(userId, status);

        return {
            delegations: delegations.map(d => ({
                delegationId: d.delegationId,
                delegatingUserId: d.delegatingUserId,
                delegatorUserId: d.delegatorUserId,
                status: d.status
            }))
        };
    }

    async getActiveDelegationsForDelegatingUser(userId: string) {
        const delegations = await this.delegationRepository.findByDelegatingUserId(userId, 'Active');
        
        const delegationsWithOwnerInfo = await Promise.all(
            delegations.map(async (d) => {
                const ownerPatient = await this.patientRepository.findByUserId(d.delegatorUserId);
                return {
                    delegationId: d.delegationId,
                    delegatorUserId: d.delegatorUserId,
                    ownerInfo: ownerPatient ? {
                        userId: ownerPatient.userId
                    } : null
                };
            })
        );

        return {
            delegations: delegationsWithOwnerInfo
        };
    }

    async acceptDelegation(delegationId: string, userId: string) {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new Error('Delegation not found');
        }

        const delegation = Delegation.reconstitute(
            toUUID(data.delegationId),
            toUUID(data.delegatingUserId),
            toUUID(data.delegatorUserId),
            DelegationStatus.reconstitute(data.status)
        );

        if (!delegation.canBeAcceptedBy(toUUID(userId))) {
            throw new Error('You are not authorized to accept this delegation');
        }

        delegation.accept();
        await this.delegationRepository.save(delegation);

        return {
            delegationId: delegation.delegationId,
            status: delegation.status.value
        };
    }

    async declineDelegation(delegationId: string, userId: string) {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new Error('Delegation not found');
        }

        const delegation = Delegation.reconstitute(
            toUUID(data.delegationId),
            toUUID(data.delegatingUserId),
            toUUID(data.delegatorUserId),
            DelegationStatus.reconstitute(data.status)
        );

        if (!delegation.canBeAcceptedBy(toUUID(userId))) {
            throw new Error('You are not authorized to decline this delegation');
        }

        delegation.decline();
        await this.delegationRepository.save(delegation);

        return {
            delegationId: delegation.delegationId,
            status: delegation.status.value
        };
    }

    async deleteDelegation(delegationId: string, userId: string) {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new Error('Delegation not found');
        }

        const delegation = Delegation.reconstitute(
            toUUID(data.delegationId),
            toUUID(data.delegatingUserId),
            toUUID(data.delegatorUserId),
            DelegationStatus.reconstitute(data.status)
        );

        if (!delegation.canBeDeletedBy(toUUID(userId))) {
            throw new Error('You are not authorized to delete this delegation');
        }

        delegation.delete();
        await this.delegationRepository.save(delegation);

        return {
            delegationId: delegation.delegationId,
            status: delegation.status.value
        };
    }
}