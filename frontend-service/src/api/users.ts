import type { LoginRequest, LoginResponse, SelectPatientProfileRequest, SearchUserByFiscalCodeResponse } from '../types/auth'
import { USERS_API_URL, DELEGATIONS_API_URL, API_ENDPOINTS, handleApiResponse, ApiError } from './config'

// User data type for fetching user info
export interface UserInfo {
  userId: string
  fiscalCode: string
  name: string
  lastName: string
  dateOfBirth: string
  patient?: {
    userId: string
    activeDelegationIds: string[]
  }
  doctor?: {
    userId: string
    medicalLicenseNumber: string
    specializations: string[]
    assignedPatientUserIds: string[]
  }
}

const AUTH_BASE_URL = `${USERS_API_URL}${API_ENDPOINTS.AUTH}`
const USERS_BASE_URL = `${USERS_API_URL}${API_ENDPOINTS.USERS}`
const DELEGATIONS_BASE_URL = `${DELEGATIONS_API_URL}${API_ENDPOINTS.DELEGATIONS}`

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('[Auth API] login called')
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    
    return handleApiResponse<LoginResponse>(response)
  },

  async selectPatientProfile(request: SelectPatientProfileRequest): Promise<LoginResponse> {
    console.log('[Auth API] selectPatientProfile called')
    const response = await fetch(`${AUTH_BASE_URL}/select-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    
    return handleApiResponse<LoginResponse>(response)
  },

  async getActiveDelegations(userId: string) {
    console.log('[Auth API] getActiveDelegations called for userId:', userId)
    const response = await fetch(`${DELEGATIONS_BASE_URL}/active-for-user?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleApiResponse(response)
  },

  async getUserById(userId: string): Promise<LoginResponse> {
    console.log('[Auth API] getUserById called for userId:', userId)
    const response = await fetch(`${USERS_BASE_URL}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleApiResponse<LoginResponse>(response)
  },
}


export const userApi = {
  /**
   * Search user by fiscal code
   */
  async searchUserByFiscalCode(fiscalCode: string): Promise<SearchUserByFiscalCodeResponse> {
    console.log('[User API] searchUserByFiscalCode called for:', fiscalCode)
    const params = new URLSearchParams({ fiscalCode })
    
    const response = await fetch(`${USERS_BASE_URL}/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return handleApiResponse<SearchUserByFiscalCodeResponse>(response)
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserInfo | null> {
    console.log('[User API] getUserById called for userId:', userId)
    const url = `${USERS_BASE_URL}/${userId}`
    console.log('[User API] Fetching from:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        console.warn('[User API] User not found:', userId)
        return null
      }
      
      console.log('[User API] Response status:', response.status, response.statusText)
      const data = await handleApiResponse<UserInfo>(response)
      console.log('[User API] User received:', data.name, data.lastName)
      return data
    } catch (error) {
      console.error('[User API] Error fetching user:', error)
      return null
    }
  },

  /**
   * Get user full name by ID
   */
  async getUserFullName(userId: string): Promise<string> {
    const user = await this.getUserById(userId)
    if (user) {
      return `${user.name} ${user.lastName}`
    }
    return userId
  },

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserInfo[]> {
    console.log('[User API] getAllUsers called')
    const url = `${USERS_BASE_URL}`
    console.log('[User API] Fetching from:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('[User API] Response status:', response.status, response.statusText)
      const data = await handleApiResponse<{ users: UserInfo[] }>(response)
      console.log('[User API] Users received:', data.users.length)
      return data.users
    } catch (error) {
      console.error('[User API] Error fetching users:', error)
      return []
    }
  },
}

export { ApiError as AuthApiError }
