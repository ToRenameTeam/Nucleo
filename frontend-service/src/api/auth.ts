import type { LoginRequest, LoginResponse, SelectPatientProfileRequest } from '../types/auth'
import { AuthApiError } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new AuthApiError(response.status, errorData.message || 'Request failed')
  }
  
  const data = await response.json()
  return data.data || data
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    
    return handleResponse<LoginResponse>(response)
  },

  async selectPatientProfile(request: SelectPatientProfileRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/select-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    
    return handleResponse<LoginResponse>(response)
  },
}

export { AuthApiError }
