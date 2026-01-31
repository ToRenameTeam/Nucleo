import { MASTER_DATA_API_URL, APPOINTMENTS_API_URL, API_ENDPOINTS, handleApiResponse } from './config'

// Service Catalog Types
export interface ServiceType {
  _id: string
  code: string
  name: string
  description?: string
  duration: number
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

// Availability Type (from appointments service)
export interface Availability {
  id: string
  doctorId: string
  facilityId: string
  serviceTypeId: string
  timeSlot: {
    startDateTime: string
    durationMinutes: number
  }
  status: string
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

/**
 * Get availability by ID from appointments service
 */
export async function getAvailabilityById(id: string): Promise<Availability | null> {
  console.log('[Availability API] getAvailabilityById called for ID:', id)
  const url = `${APPOINTMENTS_API_URL}${API_ENDPOINTS.AVAILABILITIES}/${id}`
  console.log('[Availability API] Fetching from:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.status === 404) {
      console.warn('[Availability API] Availability not found:', id)
      return null
    }
    
    console.log('[Availability API] Response status:', response.status, response.statusText)
    const data = await handleApiResponse<Availability>(response)
    console.log('[Availability API] Availability received:', data)
    return data
  } catch (error) {
    console.error('[Availability API] Error fetching availability:', error)
    return null
  }
}
