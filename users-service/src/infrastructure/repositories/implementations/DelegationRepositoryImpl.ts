import { DelegationModel } from '../../models/DelegationModel.js';
import { IDelegationRepository, DelegationData } from '../IDelegationRepository.js';
import type { Delegation } from '../../../domains/Delegation.js';

export class DelegationRepositoryImpl implements IDelegationRepository {

    async findDelegationById(delegationId: string): Promise<DelegationData | null> {
        const delegation = await DelegationModel.findOne({ delegationId });

        if (!delegation) return null;

        return this.toDelegationData(delegation);
    }

    async findAll(status?: string): Promise<{ delegations: DelegationData[] | null }> {
        const filter: any = {};

        if (status) {
            filter.status = status;
        }

        const delegations = await DelegationModel.find(filter);

        if (delegations.length === 0) {
            return { delegations: null };
        }

        return {
            delegations: delegations.map(d => this.toDelegationData(d))
        };
    }

    async findByDelegatingUserId(userId: string, status?: string): Promise<{ delegations: DelegationData[] | null }> {

        const filter: any = { delegatingUserId: userId };

        if (status) {
            filter.status = status;
        }

        const delegations = await DelegationModel.find(filter);

        if (delegations.length === 0) {
            return { delegations: null };
        }

        return {
            delegations: delegations.map(d => this.toDelegationData(d))
        };
    }

    async findByDelegatorUserId(userId: string, status?: string): Promise<{ delegations: DelegationData[] | null }> {

        const filter: any = { delegatorUserId: userId };

        if (status) {
            filter.status = status;
        }

        const delegations = await DelegationModel.find(filter);

        if (delegations.length === 0) {
            return { delegations: null };
        }

        return {
            delegations: delegations.map(d => this.toDelegationData(d))
        };
    }

    async findDelegationByUsers(delegatingUserId: string, delegatorUserId: string): Promise<DelegationData | null> {
        const delegation = await DelegationModel.findOne({
            delegatingUserId,
            delegatorUserId
        });

        if (!delegation) return null;

        return this.toDelegationData(delegation);
    }

    async create(delegation: Delegation): Promise<void> {
        await DelegationModel.create({
            delegationId: delegation.delegationId,
            delegatingUserId: delegation.delegatingUserId,
            delegatorUserId: delegation.delegatorUserId,
            status: delegation.status.value,
        });
    }

    async save(delegation: Delegation): Promise<void> {
        const result = await DelegationModel.findOneAndUpdate(
            { delegationId: delegation.delegationId },
            {
                status: delegation.status.value,
            },
            { new: false }
        );

        if (!result) {
            throw new Error(`Delegation with id ${delegation.delegationId} does not exist`);
        }
    }

    async delete(delegationId: string): Promise<void> {
        await DelegationModel.findOneAndDelete({ delegationId });
    }

    private toDelegationData(doc: any): DelegationData {
        return {
            delegationId: doc.delegationId,
            delegatingUserId: doc.delegatingUserId,
            delegatorUserId: doc.delegatorUserId,
            status: doc.status,
        };
    }
}