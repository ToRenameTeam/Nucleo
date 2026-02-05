import crypto from 'crypto';
import type { UUID } from 'crypto';
import { DelegationStatus, Delegation } from '../domains/index.js';
import { IDelegationRepository } from '../infrastructure/repositories/IDelegationRepository.js';
import { IPatientRepository } from '../infrastructure/repositories/IPatientRepository.js';
import { toUUID } from '../utils/uuid.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import {DelegationResponse, DelegationStatusUpdateResponse} from '../api/dtos/DelegationDTOs.js'

export class DelegationService {
    constructor(
        private readonly delegationRepository: IDelegationRepository,
        private readonly patientRepository: IPatientRepository,
    ) {}

    async createDelegation(data: {
        delegatingUserId: string;
        delegatorUserId: string;
    }):Promise<DelegationResponse> {
        const delegatingPatient = await this.patientRepository.findByUserId(data.delegatingUserId);
        if (!delegatingPatient) {
            throw new NotFoundError('Delegating patient not found');
        }

        const delegatorPatient = await this.patientRepository.findByUserId(data.delegatorUserId);
        if (!delegatorPatient) {
            throw new NotFoundError('Delegator patient not found');
        }

        const existing = await this.delegationRepository.findDelegationByUsers(
            data.delegatingUserId,
            data.delegatorUserId
        );

        if (existing && (existing.status === 'Pending' || existing.status === 'Active')) {
            throw new ConflictError('A delegation already exists between these patients');
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

    async getAllDelegations(status?: string): Promise<{ delegations: DelegationResponse[] }> {
        const { delegations } = await this.delegationRepository.findAll(status);

        return {
            delegations: (delegations ?? []).map(d => ({
                delegationId: d.delegationId,
                delegatingUserId: d.delegatingUserId,
                delegatorUserId: d.delegatorUserId,
                status: d.status
            }))
        };
    }


    async getDelegationById(delegationId: string): Promise<DelegationResponse> {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new NotFoundError('Delegation not found');
        }

        return {
            delegationId: data.delegationId,
            delegatingUserId: data.delegatingUserId,
            delegatorUserId: data.delegatorUserId,
            status: data.status
        };
    }

    async getDelegationsForUser(
        userId: string,
        role: 'delegating' | 'delegator',
        status?: string
    ): Promise<{ delegations: DelegationResponse[] }> {

        const result = role === 'delegating'
            ? await this.delegationRepository.findByDelegatingUserId(userId, status)
            : await this.delegationRepository.findByDelegatorUserId(userId, status);

        return {
            delegations: (result.delegations ?? []).map(d => ({
                delegationId: d.delegationId,
                delegatingUserId: d.delegatingUserId,
                delegatorUserId: d.delegatorUserId,
                status: d.status
            }))
        };
    }

    async getActiveDelegationsForDelegatingUser(
        userId: string
    ): Promise<{ delegations: any[] }> {

        const { delegations } =
            await this.delegationRepository.findByDelegatingUserId(userId, 'Active');

        const delegationsWithOwnerInfo = await Promise.all(
            (delegations ?? []).map(async (d) => {
                const ownerPatient = await this.patientRepository.findByUserId(d.delegatorUserId);

                return {
                    delegationId: d.delegationId,
                    delegatorUserId: d.delegatorUserId,
                    ownerInfo: ownerPatient
                        ? { userId: ownerPatient.userId }
                        : null
                };
            })
        );

        return {
            delegations: delegationsWithOwnerInfo
        };
    }

    async acceptDelegation(delegationId: string, userId: string): Promise<DelegationStatusUpdateResponse> {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new NotFoundError('Delegation not found');
        }

        const delegation = Delegation.reconstitute(
            toUUID(data.delegationId),
            toUUID(data.delegatingUserId),
            toUUID(data.delegatorUserId),
            DelegationStatus.reconstitute(data.status)
        );

        if (!delegation.canBeAcceptedBy(toUUID(userId))) {
            throw new ForbiddenError('You are not authorized to accept this delegation');
        }

        delegation.accept();
        await this.delegationRepository.save(delegation);

        return {
            delegationId: delegation.delegationId,
            status: delegation.status.value
        }
    }

    async declineDelegation(delegationId: string, userId: string): Promise<DelegationStatusUpdateResponse> {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new NotFoundError('Delegation not found');
        }

        const delegation = Delegation.reconstitute(
            toUUID(data.delegationId),
            toUUID(data.delegatingUserId),
            toUUID(data.delegatorUserId),
            DelegationStatus.reconstitute(data.status)
        );

        if (!delegation.canBeAcceptedBy(toUUID(userId))) {
            throw new ForbiddenError('You are not authorized to decline this delegation');
        }

        delegation.decline();
        await this.delegationRepository.save(delegation);

        return {
            delegationId: delegation.delegationId,
            status: delegation.status.value
        };
    }

    async deleteDelegation(delegationId: string, userId: string): Promise<DelegationStatusUpdateResponse> {
        const data = await this.delegationRepository.findDelegationById(delegationId);

        if (!data) {
            throw new NotFoundError('Delegation not found');
        }

        const delegation = Delegation.reconstitute(
            toUUID(data.delegationId),
            toUUID(data.delegatingUserId),
            toUUID(data.delegatorUserId),
            DelegationStatus.reconstitute(data.status)
        );

        if (!delegation.canBeDeletedBy(toUUID(userId))) {
            throw new ForbiddenError('You are not authorized to delete this delegation');
        }

        delegation.delete();
        await this.delegationRepository.save(delegation);

        return {
            delegationId: delegation.delegationId,
            status: delegation.status.value
        };
    }
}