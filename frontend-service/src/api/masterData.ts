import { MASTER_DATA_API_URL, API_ENDPOINTS, handleApiResponse } from './config'

// Service Catalog Types
export interface ServiceType {
  _id: string
  code: string
  name: string
  description?: string
  category?: string[]
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

// Medicine Types
export interface Medicine {
  _id: string
  code: string
  name: string
  description: string
  category: string
  activeIngredient: string
  dosageForm: string
  strength: string
  manufacturer: string
  isActive: boolean
}

export interface MedicineCategory {
  value: string
  label: string
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

  /**
   * Get all medicines with optional filtering
   */
  async getMedicines(filter?: { category?: string; search?: string; active?: boolean }): Promise<Medicine[]> {
    const params = new URLSearchParams()
    
    if (filter?.category) {
      params.append('category', filter.category)
    }
    if (filter?.search) {
      params.append('search', filter.search)
    }
    if (filter?.active !== undefined) {
      params.append('active', String(filter.active))
    }
    
    const queryString = params.toString()
    const url = `${MASTER_DATA_API_URL}/api/medicines${queryString ? `?${queryString}` : ''}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await handleApiResponse<Medicine[]>(response)
      return data
    } catch (error) {
      console.error('[Master Data API] Error fetching medicines:', error)
      throw error
    }
  },

  /**
   * Get medicine by ID
   */
  async getMedicineById(id: string): Promise<Medicine | null> {
    const url = `${MASTER_DATA_API_URL}/api/medicines/${id}`
    
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
      
      const data = await handleApiResponse<Medicine>(response)
      return data
    } catch (error) {
      console.error('[Master Data API] Error fetching medicine:', error)
      return null
    }
  },

  /**
   * Get all medicine categories
   */
  async getMedicineCategories(): Promise<MedicineCategory[]> {
    const url = `${MASTER_DATA_API_URL}/api/medicines/categories`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await handleApiResponse<MedicineCategory[]>(response)
      return data
    } catch (error) {
      console.error('[Master Data API] Error fetching medicine categories:', error)
      throw error
    }
  },
}
