import { MASTER_DATA_API_URL, API_ENDPOINTS, handleApiResponse } from './config';
import { z } from 'zod';
import { idSchema, nonEmptyTrimmedStringSchema, parseWithSchema } from './validation';

// Service Catalog Types
export interface ServiceType {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string[];
}

// Facility Types
export interface Facility {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
}

// Medicine Types
export interface Medicine {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  isActive: boolean;
}

export interface MedicineCategory {
  value: string;
  label: string;
}

const serviceTypeSchema = z
  .object({
    id: idSchema,
    code: nonEmptyTrimmedStringSchema,
    name: nonEmptyTrimmedStringSchema,
    description: nonEmptyTrimmedStringSchema.optional(),
    category: z.array(nonEmptyTrimmedStringSchema).optional(),
  })
  .passthrough();

const facilitySchema = z
  .object({
    id: idSchema,
    name: nonEmptyTrimmedStringSchema,
    address: nonEmptyTrimmedStringSchema.optional(),
    city: nonEmptyTrimmedStringSchema.optional(),
    phone: nonEmptyTrimmedStringSchema.optional(),
    email: nonEmptyTrimmedStringSchema.optional(),
  })
  .passthrough();

const medicineSchema = z
  .object({
    id: idSchema,
    code: nonEmptyTrimmedStringSchema,
    name: nonEmptyTrimmedStringSchema,
    description: nonEmptyTrimmedStringSchema,
    category: nonEmptyTrimmedStringSchema,
    activeIngredient: nonEmptyTrimmedStringSchema,
    dosageForm: nonEmptyTrimmedStringSchema,
    strength: nonEmptyTrimmedStringSchema,
    manufacturer: nonEmptyTrimmedStringSchema,
    isActive: z.boolean(),
  })
  .passthrough();

const medicineCategorySchema = z
  .object({
    value: nonEmptyTrimmedStringSchema,
    label: nonEmptyTrimmedStringSchema,
  })
  .passthrough();

const medicineFilterSchema = z.object({
  category: nonEmptyTrimmedStringSchema.optional(),
  search: nonEmptyTrimmedStringSchema.optional(),
  active: z.boolean().optional(),
});

function parseMasterDataResponse<T>(schema: z.ZodType<T>, payload: unknown, context: string): T {
  return parseWithSchema(schema, payload, context);
}

/**
 * Master Data API Client
 */
export const masterDataApi = {
  /**
   * Get all service types
   */
  async getServiceTypes(): Promise<ServiceType[]> {
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.SERVICE_CATALOG}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse<unknown>(response);
    return parseMasterDataResponse(z.array(serviceTypeSchema), data, 'service types response');
  },

  /**
   * Get service type by ID
   */
  async getServiceTypeById(id: string): Promise<ServiceType | null> {
    const sanitizedId = parseWithSchema(idSchema, id, 'service type id');
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.SERVICE_CATALOG}/${sanitizedId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      const data = await handleApiResponse<unknown>(response);
      return parseMasterDataResponse(serviceTypeSchema, data, 'service type response');
    } catch {
      return null;
    }
  },

  /**
   * Get all facilities
   */
  async getFacilities(): Promise<Facility[]> {
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.FACILITIES}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleApiResponse<unknown>(response);
    return parseMasterDataResponse(z.array(facilitySchema), data, 'facilities response');
  },

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    const sanitizedId = parseWithSchema(idSchema, id, 'facility id');
    const url = `${MASTER_DATA_API_URL}${API_ENDPOINTS.FACILITIES}/${sanitizedId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      const data = await handleApiResponse<unknown>(response);
      return parseMasterDataResponse(facilitySchema, data, 'facility response');
    } catch {
      return null;
    }
  },

  /**
   * Get all medicines with optional filtering
   */
  async getMedicines(filter?: {
    category?: string;
    search?: string;
    active?: boolean;
  }): Promise<Medicine[]> {
    const sanitizedFilter = parseWithSchema(medicineFilterSchema, filter ?? {}, 'medicines filter');
    const params = new URLSearchParams();

    if (sanitizedFilter.category) {
      params.append('category', sanitizedFilter.category);
    }
    if (sanitizedFilter.search) {
      params.append('search', sanitizedFilter.search);
    }
    if (sanitizedFilter.active !== undefined) {
      params.append('active', String(sanitizedFilter.active));
    }

    const queryString = params.toString();
    const url = `${MASTER_DATA_API_URL}/api/medicines${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await handleApiResponse<unknown>(response);
      return parseMasterDataResponse(z.array(medicineSchema), data, 'medicines response');
    } catch (error) {
      console.error('[Master Data API] Error fetching medicines:', error);
      throw error;
    }
  },

  /**
   * Get medicine by ID
   */
  async getMedicineById(id: string): Promise<Medicine | null> {
    const sanitizedId = parseWithSchema(idSchema, id, 'medicine id');
    const url = `${MASTER_DATA_API_URL}/api/medicines/${sanitizedId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      const data = await handleApiResponse<unknown>(response);
      return parseMasterDataResponse(medicineSchema, data, 'medicine response');
    } catch (error) {
      console.error('[Master Data API] Error fetching medicine:', error);
      return null;
    }
  },

  /**
   * Get all medicine categories
   */
  async getMedicineCategories(): Promise<MedicineCategory[]> {
    const url = `${MASTER_DATA_API_URL}/api/medicines/categories`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await handleApiResponse<unknown>(response);
      return parseMasterDataResponse(
        z.array(medicineCategorySchema),
        data,
        'medicine categories response'
      );
    } catch (error) {
      console.error('[Master Data API] Error fetching medicine categories:', error);
      throw error;
    }
  },
};
