import crypto from 'crypto';
import type { UUID } from 'crypto';
import { Delegation, DelegationStatus } from '../domains/index.js';
import { IDelegationRepository } from '../infrastructure/repositories/IDelegationRepository.js';
import { IPatientRepository } from '../infrastructure/repositories/IPatientRepository.js';
import { toUUID } from '../utils/uuid.js';

export class DelegationService {
  constructor(
    private readonly delegationRepository: IDelegationRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  async createDelegation(data: { delegatingUserId: string; delegatorUserId: string }) {
    const delegatingExists = await this.patientExists(data.delegatingUserId);
    if (!delegatingExists) {
      throw new Error('Delegating patient not found');
    }

    const delegatorExists = await this.patientExists(data.delegatorUserId);
    if (!delegatorExists) {
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

    return this.toDelegationResponse({
      delegationId: delegation.delegationId,
      delegatingUserId: delegation.delegatingUserId,
      delegatorUserId: delegation.delegatorUserId,
      status: delegation.status.value,
    });
  }

  async getAllDelegations(status?: string) {
    const delegations = await this.delegationRepository.findAll(status);

    return {
      delegations: delegations.map((delegation) => this.toDelegationResponse(delegation)),
    };
  }

  async getDelegationById(delegationId: string) {
    const data = await this.delegationRepository.findDelegationById(delegationId);

    if (!data) {
      throw new Error('Delegation not found');
    }

    return this.toDelegationResponse(data);
  }

  async getDelegationsForUser(userId: string, role: 'delegating' | 'delegator', status?: string) {
    const delegations =
      role === 'delegating'
        ? await this.delegationRepository.findByDelegatingUserId(userId, status)
        : await this.delegationRepository.findByDelegatorUserId(userId, status);

    return {
      delegations: delegations.map((delegation) => this.toDelegationResponse(delegation)),
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
          ownerInfo: ownerPatient
            ? {
                userId: ownerPatient.userId,
              }
            : null,
        };
      })
    );

    return {
      delegations: delegationsWithOwnerInfo,
    };
  }

  async acceptDelegation(delegationId: string, userId: string) {
    const delegation = await this.getDelegationOrThrow(delegationId);

    if (!delegation.canBeAcceptedBy(toUUID(userId))) {
      throw new Error('You are not authorized to accept this delegation');
    }

    delegation.accept();
    await this.delegationRepository.save(delegation);

    return {
      delegationId: delegation.delegationId,
      status: delegation.status.value,
    };
  }

  async declineDelegation(delegationId: string, userId: string) {
    const delegation = await this.getDelegationOrThrow(delegationId);

    if (!delegation.canBeAcceptedBy(toUUID(userId))) {
      throw new Error('You are not authorized to decline this delegation');
    }

    delegation.decline();
    await this.delegationRepository.save(delegation);

    return {
      delegationId: delegation.delegationId,
      status: delegation.status.value,
    };
  }

  async deleteDelegation(delegationId: string, userId: string) {
    const delegation = await this.getDelegationOrThrow(delegationId);

    if (!delegation.canBeDeletedBy(toUUID(userId))) {
      throw new Error('You are not authorized to delete this delegation');
    }

    delegation.delete();
    await this.delegationRepository.save(delegation);

    return {
      delegationId: delegation.delegationId,
      status: delegation.status.value,
    };
  }

  private async patientExists(userId: string) {
    const patient = await this.patientRepository.findByUserId(userId);
    return Boolean(patient);
  }

  private toDelegationResponse(data: {
    delegationId: string;
    delegatingUserId: string;
    delegatorUserId: string;
    status: string;
  }) {
    return {
      delegationId: data.delegationId,
      delegatingUserId: data.delegatingUserId,
      delegatorUserId: data.delegatorUserId,
      status: data.status,
    };
  }

  private async getDelegationOrThrow(delegationId: string) {
    const data = await this.delegationRepository.findDelegationById(delegationId);

    if (!data) {
      throw new Error('Delegation not found');
    }

    return Delegation.reconstitute(
      toUUID(data.delegationId),
      toUUID(data.delegatingUserId),
      toUUID(data.delegatorUserId),
      DelegationStatus.reconstitute(data.status)
    );
  }
}
