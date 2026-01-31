import type {
  CreateDelegationRequest,
  CreateDelegationResponse,
  DelegationResponse,
  DelegationsListResponse,
  AcceptDeclineResponse,
} from '../types/delegation'
import { DELEGATIONS_API_URL, API_ENDPOINTS, handleApiResponse } from './config'

const BASE_URL = `${DELEGATIONS_API_URL}${API_ENDPOINTS.DELEGATIONS}`

export const delegationApi = {
  async createDelegation(data: CreateDelegationRequest): Promise<CreateDelegationResponse> {
    console.log('[Delegations API] createDelegation called')
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    return handleApiResponse<CreateDelegationResponse>(response)
  },

  async getReceivedDelegations(userId: string, status?: string): Promise<DelegationsListResponse> {
    console.log('[Delegations API] getReceivedDelegations called for userId:', userId)
    const params = new URLSearchParams({ userId })
    if (status) {
      params.append('status', status)
    }
    
    const url = `${BASE_URL}/received?${params}`
    console.log('[Delegations API] Fetching from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleApiResponse<DelegationsListResponse>(response)
  },

  async getSentDelegations(userId: string, status?: string): Promise<DelegationsListResponse> {
    console.log('[Delegations API] getSentDelegations called for userId:', userId)
    const params = new URLSearchParams({ userId })
    if (status) {
      params.append('status', status)
    }
    
    const url = `${BASE_URL}/sent?${params}`
    console.log('[Delegations API] Fetching from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleApiResponse<DelegationsListResponse>(response)
  },

  async getDelegationById(delegationId: string): Promise<DelegationResponse> {
    console.log('[Delegations API] getDelegationById called for:', delegationId)
    const url = `${BASE_URL}/${delegationId}`
    console.log('[Delegations API] Fetching from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleApiResponse<DelegationResponse>(response)
  },

  async acceptDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    console.log('[Delegations API] acceptDelegation called for:', delegationId)
    const response = await fetch(`${BASE_URL}/${delegationId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    return handleApiResponse<AcceptDeclineResponse>(response)
  },

  async declineDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    console.log('[Delegations API] declineDelegation called for:', delegationId)
    const response = await fetch(`${BASE_URL}/${delegationId}/decline`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    return handleApiResponse<AcceptDeclineResponse>(response)
  },

  async deleteDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    console.log('[Delegations API] deleteDelegation called for:', delegationId)
    const params = new URLSearchParams({ userId })
    
    const response = await fetch(`${BASE_URL}/${delegationId}?${params}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleApiResponse<AcceptDeclineResponse>(response)
  },
}
