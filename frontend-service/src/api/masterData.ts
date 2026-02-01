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
    console.log('[Master Data API] getServiceTypes called')
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.SERVICE_CATALOG}`
    console.log('[Master Data API] Fetching from:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('[Master Data API] Response status:', response.status, response.statusText)
      const data = await handleApiResponse<ServiceType[]>(response)
      console.log('[Master Data API] Service types received:', data.length)
      return data
    } catch (error) {
      console.error('[Master Data API] Error fetching service types:', error)
      throw error
    }
  },

  /**
   * Get service type by ID
   */
  async getServiceTypeById(id: string): Promise<ServiceType | null> {
    console.log('[Master Data API] getServiceTypeById called for ID:', id)
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.SERVICE_CATALOG}/${id}`
    console.log('[Master Data API] Fetching from:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        console.warn('[Master Data API] Service type not found:', id)
        return null
      }
      
      console.log('[Master Data API] Response status:', response.status, response.statusText)
      const data = await handleApiResponse<ServiceType>(response)
      console.log('[Master Data API] Service type received:', data.name)
      return data
    } catch (error) {
      console.error('[Master Data API] Error fetching service type:', error)
      return null
    }
  },

  /**
   * Get all facilities
   */
  async getFacilities(): Promise<Facility[]> {
    console.log('[Master Data API] getFacilities called')
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.FACILITIES}`
    console.log('[Master Data API] Fetching from:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('[Master Data API] Response status:', response.status, response.statusText)
      const data = await handleApiResponse<Facility[]>(response)
      console.log('[Master Data API] Facilities received:', data.length)
      return data
    } catch (error) {
      console.error('[Master Data API] Error fetching facilities:', error)
      throw error
    }
  },

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    console.log('[Master Data API] getFacilityById called for ID:', id)
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.FACILITIES}/${id}`
    console.log('[Master Data API] Fetching from:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        console.warn('[Master Data API] Facility not found:', id)
        return null
      }
      
      console.log('[Master Data API] Response status:', response.status, response.statusText)
      const data = await handleApiResponse<Facility>(response)
      console.log('[Master Data API] Facility received:', data.name)
      return data
    } catch (error) {
      console.error('[Master Data API] Error fetching facility:', error)
      return null
    }
  },
}
