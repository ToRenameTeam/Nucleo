/**
 * Centralized API Configuration
 */

// Base API URLs - configured via environment variables
export const APPOINTMENTS_API_URL = import.meta.env.VITE_APPOINTMENTS_API_URL || 'http://localhost:8080'
export const MASTER_DATA_API_URL = import.meta.env.VITE_MASTER_DATA_API_URL || 'http://localhost:3040'
export const USERS_API_URL = import.meta.env.VITE_USERS_API_URL || 'http://localhost:3030'
export const DELEGATIONS_API_URL = import.meta.env.VITE_DELEGATIONS_API_URL || 'http://localhost:3030'

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Appointments Service
  APPOINTMENTS: '/appointments',
  AVAILABILITIES: '/availabilities',
  
  // Master Data Service
  SERVICE_CATALOG: '/api/service-catalog',
  FACILITIES: '/api/facilities',
  
  // Users Service
  USERS: '/api/users',
  AUTH: '/api/auth',
  
  // Delegations Service
  DELEGATIONS: '/api/delegations',
} as const

/**
 * Helper function to handle API responses
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorData.message || 'Request failed')
  }
  
  const data = await response.json()
  return data.data || data
}

/**
 * API Error class for typed errors
 */
export class ApiError extends Error {
  statusCode: number
  
  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}
