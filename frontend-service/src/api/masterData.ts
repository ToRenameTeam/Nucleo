import { MASTER_DATA_API_URL, API_ENDPOINTS, handleApiResponse } from './config'

// Service Catalog Types
export interface ServiceType {
  _id: string
  code: string
  name: string
  description?: string
  category?: string
}

// Facility Types
export interface Facility {
  _id: string
  name: string
  address?: string
  city?: string
  phone?: string
  email?: string
}

/**
 * Master Data API Client
 */
export const masterDataApi = {
  /**
   * Get all service types
   */
  async getServiceTypes(): Promise<ServiceType[]> {
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.SERVICE_CATALOG}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await handleApiResponse<ServiceType[]>(response)
      return data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get service type by ID
   */
  async getServiceTypeById(id: string): Promise<ServiceType | null> {
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.SERVICE_CATALOG}/${id}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        return null
      }
      
      const data = await handleApiResponse<ServiceType>(response)
      return data
    } catch (error) {
      return null
    }
  },

  /**
   * Get all facilities
   */
  async getFacilities(): Promise<Facility[]> {
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.FACILITIES}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await handleApiResponse<Facility[]>(response)
      return data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.FACILITIES}/${id}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        return null
      }
      
      const data = await handleApiResponse<Facility>(response)
      return data
    } catch (error) {
      return null
    }
  },
}
