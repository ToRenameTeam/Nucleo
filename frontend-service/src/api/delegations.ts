import type {
  CreateDelegationRequest,
  CreateDelegationResponse,
  DelegationResponse,
  DelegationsListResponse,
  AcceptDeclineResponse,
} from '../types/delegation';
import { z } from 'zod';
import { DELEGATIONS_API_URL, API_ENDPOINTS } from './config';
import {
  idSchema,
  nonEmptyTrimmedStringSchema,
  parseApiResponse,
  parseWithSchema,
} from './validation';

const BASE_URL = `${DELEGATIONS_API_URL}${API_ENDPOINTS.DELEGATIONS}`;

const delegationStatusSchema = z.enum(['Pending', 'Active', 'Declined', 'Deleted']);

const createDelegationRequestSchema = z.object({
  delegatingUserId: idSchema,
  delegatorUserId: idSchema,
});

const createDelegationResponseSchema = z
  .object({
    delegationId: idSchema,
    delegatingUserId: idSchema,
    delegatorUserId: idSchema,
    status: nonEmptyTrimmedStringSchema,
  })
  .passthrough();

const delegationResponseSchema = z
  .object({
    delegationId: idSchema,
    delegatingUserId: idSchema,
    delegatorUserId: idSchema,
    status: delegationStatusSchema,
    createdAt: nonEmptyTrimmedStringSchema,
  })
  .passthrough();

const delegationsListResponseSchema = z
  .object({
    delegations: z.array(delegationResponseSchema),
  })
  .passthrough();

const acceptDeclineResponseSchema = z
  .object({
    delegationId: idSchema,
    status: nonEmptyTrimmedStringSchema,
  })
  .passthrough();

export const delegationApi = {
  async createDelegation(data: CreateDelegationRequest): Promise<CreateDelegationResponse> {
    console.log('[Delegations API] createDelegation called');
    const sanitizedData = parseWithSchema(
      createDelegationRequestSchema,
      data,
      'create delegation request'
    );

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData),
    });

    return parseApiResponse(response, createDelegationResponseSchema, 'create delegation response');
  },

  async getReceivedDelegations(userId: string, status?: string): Promise<DelegationsListResponse> {
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'received delegations userId');
    const sanitizedStatus = status
      ? parseWithSchema(nonEmptyTrimmedStringSchema, status, 'received delegations status')
      : undefined;

    console.log('[Delegations API] getReceivedDelegations called for userId:', sanitizedUserId);
    const params = new URLSearchParams({ userId: sanitizedUserId });
    if (sanitizedStatus) {
      params.append('status', sanitizedStatus);
    }

    const url = `${BASE_URL}/received?${params}`;
    console.log('[Delegations API] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseApiResponse(
      response,
      delegationsListResponseSchema,
      'get received delegations response'
    );
  },

  async getSentDelegations(userId: string, status?: string): Promise<DelegationsListResponse> {
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'sent delegations userId');
    const sanitizedStatus = status
      ? parseWithSchema(nonEmptyTrimmedStringSchema, status, 'sent delegations status')
      : undefined;

    console.log('[Delegations API] getSentDelegations called for userId:', sanitizedUserId);
    const params = new URLSearchParams({ userId: sanitizedUserId });
    if (sanitizedStatus) {
      params.append('status', sanitizedStatus);
    }

    const url = `${BASE_URL}/sent?${params}`;
    console.log('[Delegations API] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseApiResponse(
      response,
      delegationsListResponseSchema,
      'get sent delegations response'
    );
  },

  async getDelegationById(delegationId: string): Promise<DelegationResponse> {
    const sanitizedDelegationId = parseWithSchema(idSchema, delegationId, 'delegation id');
    console.log('[Delegations API] getDelegationById called for:', sanitizedDelegationId);
    const url = `${BASE_URL}/${sanitizedDelegationId}`;
    console.log('[Delegations API] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseApiResponse(response, delegationResponseSchema, 'get delegation by id response');
  },

  async acceptDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    const sanitizedDelegationId = parseWithSchema(idSchema, delegationId, 'accept delegation id');
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'accept delegation userId');

    console.log('[Delegations API] acceptDelegation called for:', sanitizedDelegationId);
    const response = await fetch(`${BASE_URL}/${sanitizedDelegationId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: sanitizedUserId }),
    });

    return parseApiResponse(response, acceptDeclineResponseSchema, 'accept delegation response');
  },

  async declineDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    const sanitizedDelegationId = parseWithSchema(idSchema, delegationId, 'decline delegation id');
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'decline delegation userId');

    console.log('[Delegations API] declineDelegation called for:', sanitizedDelegationId);
    const response = await fetch(`${BASE_URL}/${sanitizedDelegationId}/decline`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: sanitizedUserId }),
    });

    return parseApiResponse(response, acceptDeclineResponseSchema, 'decline delegation response');
  },

  async deleteDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    const sanitizedDelegationId = parseWithSchema(idSchema, delegationId, 'delete delegation id');
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'delete delegation userId');

    console.log('[Delegations API] deleteDelegation called for:', sanitizedDelegationId);
    const params = new URLSearchParams({ userId: sanitizedUserId });

    const response = await fetch(`${BASE_URL}/${sanitizedDelegationId}?${params}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseApiResponse(response, acceptDeclineResponseSchema, 'delete delegation response');
  },
};
