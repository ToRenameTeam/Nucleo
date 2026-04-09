import { APPOINTMENTS_API_URL, API_ENDPOINTS, handleApiResponse } from './config';
import { masterDataApi } from './masterData';
import { requestApi } from './httpClient';
import { z } from 'zod';
import { idSchema, nonEmptyTrimmedStringSchema, parseWithSchema } from './validation';
import type {
  Availability,
  AvailabilityDisplay,
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest,
} from '../types/availability';

const BASE_URL = `${APPOINTMENTS_API_URL}${API_ENDPOINTS.AVAILABILITIES}`;

const availabilityStatusSchema = z.enum(['AVAILABLE', 'BOOKED', 'CANCELLED']);

const timeSlotSchema = z.object({
  startDateTime: nonEmptyTrimmedStringSchema,
  durationMinutes: z.number().int().positive(),
});

const availabilitySchema = z
  .object({
    availabilityId: idSchema,
    doctorId: idSchema,
    facilityId: idSchema,
    serviceTypeId: idSchema,
    timeSlot: timeSlotSchema,
    status: availabilityStatusSchema,
  })
  .passthrough();

const createAvailabilityRequestSchema = z.object({
  doctorId: idSchema,
  facilityId: idSchema,
  serviceTypeId: idSchema,
  startDateTime: nonEmptyTrimmedStringSchema,
  durationMinutes: z.number().int().positive(),
});

const updateAvailabilityRequestSchema = z.object({
  facilityId: idSchema.optional(),
  serviceTypeId: idSchema.optional(),
  startDateTime: nonEmptyTrimmedStringSchema.optional(),
  durationMinutes: z.number().int().positive().optional(),
});

/**
 * Get raw availability by ID (used by appointments API)
 * Returns the raw Availability type without enrichment
 */
export async function getAvailabilityByIdRaw(id: string): Promise<Availability | null> {
  const sanitizedId = parseWithSchema(idSchema, id, 'availability id');
  console.log('[Availabilities API] getAvailabilityByIdRaw called for:', sanitizedId);
  const url = `${BASE_URL}/${sanitizedId}`;

  try {
    const response = await requestApi(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      console.warn('[Availabilities API] Availability not found:', id);
      return null;
    }

    console.log('[Availabilities API] Response status:', response.status);
    const data = await handleApiResponse<unknown>(response);
    return parseWithSchema(availabilitySchema, data, 'raw availability response');
  } catch (error) {
    console.error('[Availabilities API] Error fetching raw availability:', error);
    return null;
  }
}

/**
 * Maps raw API availability response to AvailabilityDisplay
 */
async function mapAvailabilityToDisplay(availability: Availability): Promise<AvailabilityDisplay> {
  const startDateTime = new Date(availability.timeSlot.startDateTime);
  const endDateTime = new Date(
    startDateTime.getTime() + availability.timeSlot.durationMinutes * 60000
  );

  // Fetch facility name
  let facilityName = 'Struttura non specificata';
  if (availability.facilityId) {
    const facility = await masterDataApi.getFacilityById(availability.facilityId);
    if (facility) {
      facilityName = facility.name;
    }
  }

  // Fetch service type name
  let serviceTypeName = 'Visita';
  if (availability.serviceTypeId) {
    const serviceType = await masterDataApi.getServiceTypeById(availability.serviceTypeId);
    if (serviceType) {
      serviceTypeName = serviceType.name;
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
    isBooked: availability.status === 'BOOKED',
  };
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
    const sanitizedDoctorId = parseWithSchema(idSchema, doctorId, 'availabilities doctorId');
    const sanitizedStartDate = startDate
      ? parseWithSchema(nonEmptyTrimmedStringSchema, startDate, 'availabilities startDate')
      : undefined;
    const sanitizedEndDate = endDate
      ? parseWithSchema(nonEmptyTrimmedStringSchema, endDate, 'availabilities endDate')
      : undefined;

    console.log('[Availabilities API] getAvailabilitiesByDoctor called for:', sanitizedDoctorId);

    let url = `${BASE_URL}?doctorId=${encodeURIComponent(sanitizedDoctorId)}`;
    if (sanitizedStartDate) url += `&startDate=${encodeURIComponent(sanitizedStartDate)}`;
    if (sanitizedEndDate) url += `&endDate=${encodeURIComponent(sanitizedEndDate)}`;

    console.log('[Availabilities API] Fetching from:', url);

    try {
      const response = await requestApi(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await handleApiResponse<unknown>(response);
      const validatedData = parseWithSchema(
        z.array(availabilitySchema),
        data,
        'availabilities by doctor response'
      );

      // Map all availabilities to display format
      const mapped = await Promise.all(validatedData.map(mapAvailabilityToDisplay));

      return mapped;
    } catch (error) {
      console.error('[Availabilities API] Error fetching availabilities:', error);
      throw error;
    }
  },

  /**
   * Get a single availability by ID
   */
  async getAvailabilityById(id: string): Promise<AvailabilityDisplay | null> {
    const sanitizedId = parseWithSchema(idSchema, id, 'availability id');
    console.log('[Availabilities API] getAvailabilityById called for:', sanitizedId);
    const url = `${BASE_URL}/${sanitizedId}`;

    try {
      const response = await requestApi(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.warn('[Availabilities API] Availability not found:', id);
        return null;
      }

      const data = await handleApiResponse<unknown>(response);
      const validatedData = parseWithSchema(availabilitySchema, data, 'availability response');
      return mapAvailabilityToDisplay(validatedData);
    } catch (error) {
      console.error('[Availabilities API] Error fetching availability:', error);
      return null;
    }
  },

  /**
   * Create a new availability
   */
  async createAvailability(request: CreateAvailabilityRequest): Promise<AvailabilityDisplay> {
    const sanitizedRequest = parseWithSchema(
      createAvailabilityRequestSchema,
      request,
      'create availability request'
    );

    console.log('[Availabilities API] createAvailability called:', sanitizedRequest);

    const body = {
      doctorId: sanitizedRequest.doctorId,
      facilityId: sanitizedRequest.facilityId,
      serviceTypeId: sanitizedRequest.serviceTypeId,
      timeSlot: {
        startDateTime: sanitizedRequest.startDateTime,
        durationMinutes: sanitizedRequest.durationMinutes,
      },
    };

    try {
      const response = await requestApi(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('[Availabilities API] Create response status:', response.status);
      const data = await handleApiResponse<unknown>(response);
      const validatedData = parseWithSchema(
        availabilitySchema,
        data,
        'create availability response'
      );
      return mapAvailabilityToDisplay(validatedData);
    } catch (error) {
      console.error('[Availabilities API] Error creating availability:', error);
      throw error;
    }
  },

  /**
   * Update an existing availability (only if not booked)
   */
  async updateAvailability(
    id: string,
    request: UpdateAvailabilityRequest
  ): Promise<AvailabilityDisplay> {
    const sanitizedId = parseWithSchema(idSchema, id, 'update availability id');
    const sanitizedRequest = parseWithSchema(
      updateAvailabilityRequestSchema,
      request,
      'update availability request'
    );

    const url = `${BASE_URL}/${sanitizedId}`;

    const body: Record<string, unknown> = {};
    if (sanitizedRequest.facilityId) body.facilityId = sanitizedRequest.facilityId;
    if (sanitizedRequest.serviceTypeId) body.serviceTypeId = sanitizedRequest.serviceTypeId;
    if (sanitizedRequest.startDateTime || sanitizedRequest.durationMinutes) {
      body.timeSlot = {};
      if (sanitizedRequest.startDateTime) {
        // startDateTime is already in LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
        (body.timeSlot as Record<string, unknown>).startDateTime = sanitizedRequest.startDateTime;
      }
      if (sanitizedRequest.durationMinutes)
        (body.timeSlot as Record<string, unknown>).durationMinutes =
          sanitizedRequest.durationMinutes;
    }

    try {
      const response = await requestApi(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await handleApiResponse<unknown>(response);
      const validatedData = parseWithSchema(
        availabilitySchema,
        data,
        'update availability response'
      );
      return mapAvailabilityToDisplay(validatedData);
    } catch (error) {
      console.error('[Availabilities API] Error updating availability:', error);
      throw error;
    }
  },

  /**
   * Delete an availability (only if not booked)
   */
  async deleteAvailability(id: string): Promise<void> {
    const sanitizedId = parseWithSchema(idSchema, id, 'delete availability id');
    console.log('[Availabilities API] deleteAvailability called for:', sanitizedId);
    const url = `${BASE_URL}/${sanitizedId}`;

    try {
      const response = await requestApi(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[Availabilities API] Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Errore durante l'eliminazione" }));
        throw new Error(errorData.message || "Errore durante l'eliminazione");
      }
    } catch (error) {
      console.error('[Availabilities API] Error deleting availability:', error);
      throw error;
    }
  },
};
