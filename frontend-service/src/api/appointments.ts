import type { Appointment } from '../types/appointment'
import type { Availability, AvailabilityStatus } from '../types/availability'
import { APPOINTMENTS_API_URL, API_ENDPOINTS } from './config'
import { masterDataApi } from './masterData'
import { getAvailabilityByIdRaw } from './availabilities'
import { userApi } from './users'

const BASE_URL = `${APPOINTMENTS_API_URL}${API_ENDPOINTS.APPOINTMENTS}`

interface GetAppointmentsFilters {
  patientId?: string
  doctorId?: string
  facilityId?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface AppointmentResponse {
  appointmentId: string
  patientId: string
  availabilityId: string
  status: string
  createdAt: string
  updatedAt: string
  // Additional fields from /details endpoint
  doctorId?: string
  facilityId?: string
  serviceTypeId?: string
  timeSlot?: {
    startDateTime: string
    durationMinutes: number
  }
  availabilityStatus?: string
}

async function mapAppointmentResponse(response: AppointmentResponse): Promise<Appointment> {
  // Get availability details from response or fetch from API
  let availability: Availability | undefined
  
  // If we have availability fields in the response (/details endpoint)
  if (response.doctorId && response.facilityId && response.serviceTypeId && response.timeSlot) {
    availability = {
      availabilityId: response.availabilityId,
      doctorId: response.doctorId,
      facilityId: response.facilityId,
      serviceTypeId: response.serviceTypeId,
      timeSlot: response.timeSlot,
      status: (response.availabilityStatus || 'AVAILABLE') as AvailabilityStatus
    }
  } else if (response.availabilityId) {
    // Otherwise fetch from availabilities API
    console.log('[Appointments API] Fetching availability:', response.availabilityId)
    const fetchedAvailability = await getAvailabilityByIdRaw(response.availabilityId)
    if (fetchedAvailability) {
      availability = fetchedAvailability
    }
  }

  // Get patient user info
  let patientName = response.patientId
  if (response.patientId) {
    console.log('[Appointments API] Fetching patient user info:', response.patientId)
    const patientUser = await userApi.getUserById(response.patientId)
    if (patientUser) {
      patientName = `${patientUser.name} ${patientUser.lastName}`
      console.log('[Appointments API] Patient name resolved:', patientName)
    }
  }
  
  if (!availability) {
    console.warn('[Appointments API] No availability found for appointment:', response.appointmentId)
    return {
      id: response.appointmentId,
      title: 'Appuntamento',
      description: `Paziente: ${patientName}`,
      date: new Date().toLocaleDateString('it-IT'),
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      user: patientName,
      location: 'Non specificata',
      tags: [response.status],
      patientId: response.patientId,
      doctorId: response.doctorId,
      status: response.status
    }
  }
  
  const startTime = new Date(availability.timeSlot.startDateTime)
  const endTime = new Date(startTime.getTime() + availability.timeSlot.durationMinutes * 60000)
  
  // Get service type name
  let serviceTypeName = 'Visita'
  if (availability.serviceTypeId) {
    console.log('[Appointments API] Fetching service type:', availability.serviceTypeId)
    const serviceType = await masterDataApi.getServiceTypeById(availability.serviceTypeId)
    if (serviceType) {
      serviceTypeName = serviceType.name
    }
  }
  
  // Get facility name
  let facilityName = 'Struttura non specificata'
  if (availability.facilityId) {
    console.log('[Appointments API] Fetching facility:', availability.facilityId)
    const facility = await masterDataApi.getFacilityById(availability.facilityId)
    if (facility) {
      facilityName = facility.name
    }
  }
  
  return {
    id: response.appointmentId,
    title: serviceTypeName,
    description: `Paziente: ${patientName}`,
    date: startTime.toLocaleDateString('it-IT'),
    time: `${startTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
    user: patientName,
    location: facilityName,
    tags: [response.status],
    patientId: response.patientId,
    doctorId: availability.doctorId,
    status: response.status
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorData.message || 'Request failed')
  }
  
  return response.json()
}

export const appointmentsApi = {
  async getAppointments(filters: GetAppointmentsFilters = {}): Promise<Appointment[]> {
    console.log('[Appointments API] Get appointments called with filters:', filters)
    const queryParams = new URLSearchParams()
    
    if (filters.patientId) queryParams.append('patientId', filters.patientId)
    if (filters.doctorId) queryParams.append('doctorId', filters.doctorId)
    if (filters.facilityId) queryParams.append('facilityId', filters.facilityId)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)
    
    const url = `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    console.log('[Appointments API] Fetch call to:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('[Appointments API] Response status:', response.status, response.statusText)
    
    try {
      const appointments = await handleResponse<AppointmentResponse[]>(response)
      console.log('[Appointments API] Data received:', appointments.length, 'raw appointments')
      
      // Map appointments with all related data
      const mappedAppointments = await Promise.all(
        appointments.map(apt => mapAppointmentResponse(apt))
      )
      
      console.log('[Appointments API] Mapped appointments:', mappedAppointments.length, 'items')
      return mappedAppointments
    } catch (error) {
      console.error('[Appointments API] Error during fetch:', error)
      throw error
    }
  },

  async getAppointmentsByDoctor(doctorId: string, filters: Omit<GetAppointmentsFilters, 'doctorId'> = {}): Promise<Appointment[]> {
    console.log('[Appointments API] getAppointmentsByDoctor called by doctor:', doctorId)
    return this.getAppointments({ ...filters, doctorId })
  },

  async getAppointmentsByPatient(patientId: string, filters: Omit<GetAppointmentsFilters, 'patientId'> = {}): Promise<Appointment[]> {
    return this.getAppointments({ ...filters, patientId })
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const response = await fetch(`${BASE_URL}/${id}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.status === 404) {
      return null
    }
    
    const appointment = await handleResponse<AppointmentResponse>(response)
    return mapAppointmentResponse(appointment)
  },

  async createAppointment(patientId: string, availabilityId: string): Promise<Appointment> {
    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId, availabilityId }),
    })
    
    const appointment = await handleResponse<AppointmentResponse>(response)
    return mapAppointmentResponse(appointment)
  },

  async updateAppointment(id: string, status?: string, availabilityId?: string): Promise<Appointment> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, availabilityId }),
    })
    
    const appointment = await handleResponse<AppointmentResponse>(response)
    return mapAppointmentResponse(appointment)
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    return response.status === 204
  }
}
