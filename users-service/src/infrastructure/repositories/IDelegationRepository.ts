import type { Delegation } from '../../domains/Delegation.js';

export interface DelegationData {
    delegationId: string;
    delegatingUserId: string;
    delegatorUserId: string;
    status: string;
}

export interface IDelegationRepository {
    findDelegationById(delegationId: string): Promise<DelegationData | null>;
    findByDelegatingUserId(userId: string, status?: string): Promise<DelegationData[]>;
    findByDelegatorUserId(userId: string, status?: string): Promise<DelegationData[]>;
    findDelegationByUsers(delegatingUserId: string, delegatorUserId: string): Promise<DelegationData | null>;
    create(delegation: Delegation): Promise<void>;
    save(delegation: Delegation): Promise<void>;
    delete(delegationId: string): Promise<void>;
}