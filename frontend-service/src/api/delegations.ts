import type {
  CreateDelegationRequest,
  CreateDelegationResponse,
  DelegationResponse,
  DelegationsListResponse,
  AcceptDeclineResponse,
  SearchUserByFiscalCodeResponse
} from '../types/delegation'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorData.message || 'Request failed')
  }
  
  const data = await response.json()
  return data.data || data
}

export const delegationApi = {
  async createDelegation(data: CreateDelegationRequest): Promise<CreateDelegationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/delegations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    return handleResponse<CreateDelegationResponse>(response)
  },

  async getReceivedDelegations(userId: string, status?: string): Promise<DelegationsListResponse> {
    const params = new URLSearchParams({ userId })
    if (status) {
      params.append('status', status)
    }
    
    const response = await fetch(`${API_BASE_URL}/api/delegations/received?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleResponse<DelegationsListResponse>(response)
  },

  async getSentDelegations(userId: string, status?: string): Promise<DelegationsListResponse> {
    const params = new URLSearchParams({ userId })
    if (status) {
      params.append('status', status)
    }
    
    const response = await fetch(`${API_BASE_URL}/api/delegations/sent?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleResponse<DelegationsListResponse>(response)
  },

  async getDelegationById(delegationId: string): Promise<DelegationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/delegations/${delegationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleResponse<DelegationResponse>(response)
  },

  async acceptDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    const response = await fetch(`${API_BASE_URL}/api/delegations/${delegationId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    return handleResponse<AcceptDeclineResponse>(response)
  },

  async declineDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    const response = await fetch(`${API_BASE_URL}/api/delegations/${delegationId}/decline`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    return handleResponse<AcceptDeclineResponse>(response)
  },

  async deleteDelegation(delegationId: string, userId: string): Promise<AcceptDeclineResponse> {
    const params = new URLSearchParams({ userId })
    
    const response = await fetch(`${API_BASE_URL}/api/delegations/${delegationId}?${params}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleResponse<AcceptDeclineResponse>(response)
  },

  async searchUserByFiscalCode(fiscalCode: string): Promise<SearchUserByFiscalCodeResponse> {
    const params = new URLSearchParams({ fiscalCode })
    
    const response = await fetch(`${API_BASE_URL}/api/users/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleResponse<SearchUserByFiscalCodeResponse>(response)
  }
}
