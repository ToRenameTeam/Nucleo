import { APPOINTMENTS_API_URL, API_ENDPOINTS, handleApiResponse } from './config'
import { masterDataApi } from './masterData'
import type { 
  Availability, 
  AvailabilityDisplay, 
  CreateAvailabilityRequest, 
  UpdateAvailabilityRequest 
} from '../types/availability'

const BASE_URL = `${APPOINTMENTS_API_URL}${API_ENDPOINTS.AVAILABILITIES}`

/**
 * Get raw availability by ID (used by appointments API)
 * Returns the raw Availability type without enrichment
 */
export async function getAvailabilityByIdRaw(id: string): Promise<Availability | null> {
  console.log('[Availabilities API] getAvailabilityByIdRaw called for:', id)
  const url = `${BASE_URL}/${id}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.status === 404) {
      console.warn('[Availabilities API] Availability not found:', id)
      return null
    }
    
    console.log('[Availabilities API] Response status:', response.status)
    const data = await handleApiResponse<Availability>(response)
    return data
  } catch (error) {
    console.error('[Availabilities API] Error fetching raw availability:', error)
    return null
  }
}

/**
 * Maps raw API availability response to AvailabilityDisplay
 */
async function mapAvailabilityToDisplay(availability: Availability): Promise<AvailabilityDisplay> {
  const startDateTime = new Date(availability.timeSlot.startDateTime)
  const endDateTime = new Date(startDateTime.getTime() + availability.timeSlot.durationMinutes * 60000)
  
  // Fetch facility name
  let facilityName = 'Struttura non specificata'
  if (availability.facilityId) {
    const facility = await masterDataApi.getFacilityById(availability.facilityId)
    if (facility) {
      facilityName = facility.name
    }
  }
  
  // Fetch service type name
  let serviceTypeName = 'Visita'
  if (availability.serviceTypeId) {
    const serviceType = await masterDataApi.getServiceTypeById(availability.serviceTypeId)
    if (serviceType) {
      serviceTypeName = serviceType.name
    }
  }
  
  return {
    id: availability.availabilityId,
    doctorId: availability.doctorId,
    facilityId: availability.facilityId,
    facilityName,
    serviceTypeId: availability.serviceTypeId,
    serviceTypeName,
    startDateTime,
    endDateTime,
    durationMinutes: availability.timeSlot.durationMinutes,
    status: availability.status,
    isBooked: availability.status === 'BOOKED'
  }
}

export const availabilitiesApi = {
  /**
   * Get availabilities for a doctor
   */
  async getAvailabilitiesByDoctor(
    doctorId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AvailabilityDisplay[]> {
    console.log('[Availabilities API] getAvailabilitiesByDoctor called for:', doctorId)
    
    let url = `${BASE_URL}?doctorId=${doctorId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    console.log('[Availabilities API] Fetching from:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await handleApiResponse<Availability[]>(response)
      
      // Map all availabilities to display format
      const mapped = await Promise.all(data.map(mapAvailabilityToDisplay))
      
      return mapped
    } catch (error) {
      console.error('[Availabilities API] Error fetching availabilities:', error)
      throw error
    }
  },

  /**
   * Get a single availability by ID
   */
  async getAvailabilityById(id: string): Promise<AvailabilityDisplay | null> {
    console.log('[Availabilities API] getAvailabilityById called for:', id)
    const url = `${BASE_URL}/${id}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        console.warn('[Availabilities API] Availability not found:', id)
        return null
      }
      
      const data = await handleApiResponse<Availability>(response)
      return mapAvailabilityToDisplay(data)
    } catch (error) {
      console.error('[Availabilities API] Error fetching availability:', error)
      return null
    }
  },

  /**
   * Create a new availability
   */
  async createAvailability(request: CreateAvailabilityRequest): Promise<AvailabilityDisplay> {
    console.log('[Availabilities API] createAvailability called:', request)
    
    const body = {
      doctorId: request.doctorId,
      facilityId: request.facilityId,
      serviceTypeId: request.serviceTypeId,
      timeSlot: {
        startDateTime: request.startDateTime,
        durationMinutes: request.durationMinutes
      }
    }
    
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      console.log('[Availabilities API] Create response status:', response.status)
      const data = await handleApiResponse<Availability>(response)
      return mapAvailabilityToDisplay(data)
    } catch (error) {
      console.error('[Availabilities API] Error creating availability:', error)
      throw error
    }
  },

  /**
   * Update an existing availability (only if not booked)
   */
  async updateAvailability(id: string, request: UpdateAvailabilityRequest): Promise<AvailabilityDisplay> {
    const url = `${BASE_URL}/${id}`
    
    const body: Record<string, unknown> = {}
    if (request.facilityId) body.facilityId = request.facilityId
    if (request.serviceTypeId) body.serviceTypeId = request.serviceTypeId
    if (request.startDateTime || request.durationMinutes) {
      body.timeSlot = {}
      if (request.startDateTime) {
        // startDateTime is already in LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
        ;(body.timeSlot as Record<string, unknown>).startDateTime = request.startDateTime
      }
      if (request.durationMinutes) (body.timeSlot as Record<string, unknown>).durationMinutes = request.durationMinutes
    }
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      const data = await handleApiResponse<Availability>(response)
      return mapAvailabilityToDisplay(data)
    } catch (error) {
      console.error('[Availabilities API] Error updating availability:', error)
      throw error
    }
  },

  /**
   * Delete an availability (only if not booked)
   */
  async deleteAvailability(id: string): Promise<void> {
    console.log('[Availabilities API] deleteAvailability called for:', id)
    const url = `${BASE_URL}/${id}`
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('[Availabilities API] Delete response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Errore durante l\'eliminazione' }))
        throw new Error(errorData.message || 'Errore durante l\'eliminazione')
      }
    } catch (error) {
      console.error('[Availabilities API] Error deleting availability:', error)
      throw error
    }
  }
}
