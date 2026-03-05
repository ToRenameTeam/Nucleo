import { DelegationModel } from '../../database/models/index.js';
import type { IDelegationDocument } from '../../database/models/Delegation.schema.js';
import { IDelegationRepository, DelegationData } from '../IDelegationRepository.js';
import type { Delegation } from '../../../domains/index.js';

export class DelegationRepositoryImpl implements IDelegationRepository {

    async findDelegationById(delegationId: string): Promise<DelegationData | null> {
        const delegation = await DelegationModel.findOne({ delegationId });

        if (!delegation) return null;

        return this.toDelegationData(delegation);
    }

    async findAll(status?: string): Promise<DelegationData[]> {
        const filter = this.buildFilter({}, status);

        const delegations = await DelegationModel.find(filter);
        return delegations.map((delegation) => this.toDelegationData(delegation));
    }

    async findByDelegatingUserId(userId: string, status?: string): Promise<DelegationData[]> {
        const filter = this.buildFilter({ delegatingUserId: userId }, status);

        const delegations = await DelegationModel.find(filter);
        return delegations.map((delegation) => this.toDelegationData(delegation));
    }

    async findByDelegatorUserId(userId: string, status?: string): Promise<DelegationData[]> {
        const filter = this.buildFilter({ delegatorUserId: userId }, status);

        const delegations = await DelegationModel.find(filter);
        return delegations.map((delegation) => this.toDelegationData(delegation));
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

    private buildFilter(
        baseFilter: Partial<Pick<IDelegationDocument, 'delegatingUserId' | 'delegatorUserId'>>,
        status?: string
    ): Partial<Pick<IDelegationDocument, 'delegatingUserId' | 'delegatorUserId' | 'status'>> {
        if (!status) {
            return baseFilter;
        }

        return {
            ...baseFilter,
            status: status as IDelegationDocument['status'],
        };
    }

    private toDelegationData(doc: IDelegationDocument): DelegationData {
        return {
            delegationId: doc.delegationId,
            delegatingUserId: doc.delegatingUserId,
            delegatorUserId: doc.delegatorUserId,
            status: doc.status,
        };
    }
}