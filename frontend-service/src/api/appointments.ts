import type { Appointment } from '../types/appointment';
import type { Availability, AvailabilityStatus } from '../types/availability';
import { APPOINTMENTS_API_URL, API_ENDPOINTS } from './config';
import { z } from 'zod';
import { masterDataApi } from './masterData';
import { getAvailabilityByIdRaw } from './availabilities';
import { userApi } from './users';
import { idSchema, nonEmptyTrimmedStringSchema, parseWithSchema } from './validation';

const BASE_URL = `${APPOINTMENTS_API_URL}${API_ENDPOINTS.APPOINTMENTS}`;

interface GetAppointmentsFilters {
  patientId?: string;
  doctorId?: string;
  facilityId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface AppointmentResponse {
  appointmentId: string;
  patientId: string;
  availabilityId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields from /details endpoint
  doctorId?: string;
  facilityId?: string;
  serviceTypeId?: string;
  timeSlot?: {
    startDateTime: string;
    durationMinutes: number;
  };
  availabilityStatus?: string;
}

const appointmentTimeSlotSchema = z.object({
  startDateTime: nonEmptyTrimmedStringSchema,
  durationMinutes: z.number().int().positive(),
});

const appointmentResponseSchema = z
  .object({
    appointmentId: idSchema,
    patientId: idSchema,
    availabilityId: idSchema,
    status: nonEmptyTrimmedStringSchema,
    createdAt: nonEmptyTrimmedStringSchema,
    updatedAt: nonEmptyTrimmedStringSchema,
    doctorId: idSchema.optional(),
    facilityId: idSchema.optional(),
    serviceTypeId: idSchema.optional(),
    timeSlot: appointmentTimeSlotSchema.optional(),
    availabilityStatus: nonEmptyTrimmedStringSchema.optional(),
  })
  .passthrough();

const getAppointmentsFiltersSchema = z.object({
  patientId: idSchema.optional(),
  doctorId: idSchema.optional(),
  facilityId: idSchema.optional(),
  status: nonEmptyTrimmedStringSchema.optional(),
  startDate: nonEmptyTrimmedStringSchema.optional(),
  endDate: nonEmptyTrimmedStringSchema.optional(),
});

async function mapAppointmentResponse(response: AppointmentResponse): Promise<Appointment> {
  // Get availability details from response or fetch from API
  let availability: Availability | undefined;

  // If we have availability fields in the response (/details endpoint)
  if (response.doctorId && response.facilityId && response.serviceTypeId && response.timeSlot) {
    availability = {
      availabilityId: response.availabilityId,
      doctorId: response.doctorId,
      facilityId: response.facilityId,
      serviceTypeId: response.serviceTypeId,
      timeSlot: response.timeSlot,
      status: (response.availabilityStatus || 'AVAILABLE') as AvailabilityStatus,
    };
  } else if (response.availabilityId) {
    // Otherwise fetch from availabilities API
    console.log('[Appointments API] Fetching availability:', response.availabilityId);
    const fetchedAvailability = await getAvailabilityByIdRaw(response.availabilityId);
    if (fetchedAvailability) {
      availability = fetchedAvailability;
    }
  }

  // Get patient user info
  let patientName = response.patientId;
  if (response.patientId) {
    console.log('[Appointments API] Fetching patient user info:', response.patientId);
    const patientUser = await userApi.getUserById(response.patientId);
    if (patientUser) {
      patientName = `${patientUser.name} ${patientUser.lastName}`;
      console.log('[Appointments API] Patient name resolved:', patientName);
    }
  }

  if (!availability) {
    console.warn(
      '[Appointments API] No availability found for appointment:',
      response.appointmentId
    );
    return {
      id: response.appointmentId,
      title: 'Appuntamento',
      description: `Dettagli non disponibili`,
      date: new Date().toLocaleDateString('it-IT'),
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      user: patientName,
      patientName: patientName,
      location: 'Non specificata',
      patientId: response.patientId,
      doctorId: response.doctorId,
      status: response.status,
      category: [],
    };
  }

  const startTime = new Date(availability.timeSlot.startDateTime);
  const endTime = new Date(startTime.getTime() + availability.timeSlot.durationMinutes * 60000);

  // Get service type name, category, and description
  let serviceTypeName = 'Visita';
  let serviceTypeCategories: string[] = [];
  let serviceTypeDescription: string | undefined;
  if (availability.serviceTypeId) {
    console.log('[Appointments API] Fetching service type:', availability.serviceTypeId);
    const serviceType = await masterDataApi.getServiceTypeById(availability.serviceTypeId);
    if (serviceType) {
      serviceTypeName = serviceType.name;
      serviceTypeCategories = serviceType.category || [];
      serviceTypeDescription = serviceType.description;
    }
  }

  // Get facility name
  let facilityName = 'Struttura non specificata';
  if (availability.facilityId) {
    console.log('[Appointments API] Fetching facility:', availability.facilityId);
    const facility = await masterDataApi.getFacilityById(availability.facilityId);
    if (facility) {
      facilityName = facility.name;
    }
  }

  // Get doctor name
  let doctorName = availability.doctorId;
  if (availability.doctorId) {
    console.log('[Appointments API] Fetching doctor user info:', availability.doctorId);
    const doctorUser = await userApi.getUserById(availability.doctorId);
    if (doctorUser) {
      doctorName = `Dott. ${doctorUser.name} ${doctorUser.lastName}`;
      console.log('[Appointments API] Doctor name resolved:', doctorName);
    }
  }

  return {
    id: response.appointmentId,
    title: serviceTypeName,
    description: serviceTypeDescription || `Appuntamento con ${doctorName} presso ${facilityName}`,
    date: startTime.toLocaleDateString('it-IT'),
    time: `${startTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
    user: doctorName,
    patientName: patientName,
    location: facilityName,
    patientId: response.patientId,
    doctorId: availability.doctorId,
    status: response.status,
    category: serviceTypeCategories,
    serviceTypeDescription: serviceTypeDescription,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
}

export const appointmentsApi = {
  async getAppointments(filters: GetAppointmentsFilters = {}): Promise<Appointment[]> {
    const sanitizedFilters = parseWithSchema(
      getAppointmentsFiltersSchema,
      filters,
      'get appointments filters'
    );

    console.log('[Appointments API] Get appointments called with filters:', sanitizedFilters);
    const queryParams = new URLSearchParams();

    if (sanitizedFilters.patientId) queryParams.append('patientId', sanitizedFilters.patientId);
    if (sanitizedFilters.doctorId) queryParams.append('doctorId', sanitizedFilters.doctorId);
    if (sanitizedFilters.facilityId) {
      queryParams.append('facilityId', sanitizedFilters.facilityId);
    }
    if (sanitizedFilters.status) queryParams.append('status', sanitizedFilters.status);
    if (sanitizedFilters.startDate) queryParams.append('startDate', sanitizedFilters.startDate);
    if (sanitizedFilters.endDate) queryParams.append('endDate', sanitizedFilters.endDate);

    const url = `${BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('[Appointments API] Fetch call to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[Appointments API] Response status:', response.status, response.statusText);

    try {
      const appointmentsRaw = await handleResponse<unknown>(response);
      const appointments = parseWithSchema(
        z.array(appointmentResponseSchema),
        appointmentsRaw,
        'get appointments response'
      );
      console.log('[Appointments API] Data received:', appointments.length, 'raw appointments');

      // Map appointments with all related data
      const mappedAppointments = await Promise.all(
        appointments.map((apt) => mapAppointmentResponse(apt))
      );

      console.log('[Appointments API] Mapped appointments:', mappedAppointments.length, 'items');
      return mappedAppointments;
    } catch (error) {
      console.error('[Appointments API] Error during fetch:', error);
      throw error;
    }
  },

  async getAppointmentsByDoctor(
    doctorId: string,
    filters: Omit<GetAppointmentsFilters, 'doctorId'> = {}
  ): Promise<Appointment[]> {
    const sanitizedDoctorId = parseWithSchema(idSchema, doctorId, 'appointments doctorId');
    console.log('[Appointments API] getAppointmentsByDoctor called by doctor:', sanitizedDoctorId);
    return this.getAppointments({ ...filters, doctorId: sanitizedDoctorId });
  },

  async getAppointmentsByPatient(
    patientId: string,
    filters: Omit<GetAppointmentsFilters, 'patientId'> = {}
  ): Promise<Appointment[]> {
    const sanitizedPatientId = parseWithSchema(idSchema, patientId, 'appointments patientId');
    return this.getAppointments({ ...filters, patientId: sanitizedPatientId });
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const sanitizedId = parseWithSchema(idSchema, id, 'appointment id');
    const response = await fetch(`${BASE_URL}/${sanitizedId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    const appointmentRaw = await handleResponse<unknown>(response);
    const appointment = parseWithSchema(
      appointmentResponseSchema,
      appointmentRaw,
      'get appointment by id response'
    );
    return mapAppointmentResponse(appointment);
  },

  async createAppointment(patientId: string, availabilityId: string): Promise<Appointment> {
    const sanitizedPatientId = parseWithSchema(idSchema, patientId, 'create appointment patientId');
    const sanitizedAvailabilityId = parseWithSchema(
      idSchema,
      availabilityId,
      'create appointment availabilityId'
    );

    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: sanitizedPatientId,
        availabilityId: sanitizedAvailabilityId,
      }),
    });

    const appointmentRaw = await handleResponse<unknown>(response);
    const appointment = parseWithSchema(
      appointmentResponseSchema,
      appointmentRaw,
      'create appointment response'
    );
    return mapAppointmentResponse(appointment);
  },

  async updateAppointment(
    id: string,
    status?: string,
    availabilityId?: string,
    updatedBy?: 'PATIENT' | 'DOCTOR'
  ): Promise<Appointment> {
    const sanitizedId = parseWithSchema(idSchema, id, 'update appointment id');
    const sanitizedStatus = status
      ? parseWithSchema(nonEmptyTrimmedStringSchema, status, 'update appointment status')
      : undefined;
    const sanitizedAvailabilityId = availabilityId
      ? parseWithSchema(idSchema, availabilityId, 'update appointment availabilityId')
      : undefined;
    const sanitizedUpdatedBy = updatedBy
      ? parseWithSchema(z.enum(['PATIENT', 'DOCTOR']), updatedBy, 'update appointment updatedBy')
      : undefined;

    const response = await fetch(`${BASE_URL}/${sanitizedId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: sanitizedStatus,
        availabilityId: sanitizedAvailabilityId,
        updatedBy: sanitizedUpdatedBy,
      }),
    });

    const appointmentRaw = await handleResponse<unknown>(response);
    const appointment = parseWithSchema(
      appointmentResponseSchema,
      appointmentRaw,
      'update appointment response'
    );
    return mapAppointmentResponse(appointment);
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const sanitizedId = parseWithSchema(idSchema, id, 'delete appointment id');
    const response = await fetch(`${BASE_URL}/${sanitizedId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.status === 204;
  },
};
