import { Router } from 'express';
import { z } from 'zod';
import {
  facilityService,
  masterDataEventsPublisher,
  FacilityValidationError,
  FacilityConflictError,
} from '../services/index.js';
import { parseBooleanQuery, sendError, sendServerError, sendSuccess } from './route.utils.js';
import {
  ApiValidationError,
  booleanQueryValueSchema,
  idParamSchema,
  nonEmptyTrimmedStringSchema,
  optionalTrimmedStringSchema,
  validateWithSchema,
} from './validation.js';

const router = Router();

const facilityListQuerySchema = z.object({
  city: optionalTrimmedStringSchema,
  active: booleanQueryValueSchema.optional(),
  search: optionalTrimmedStringSchema,
});

const createFacilityBodySchema = z.object({
  code: nonEmptyTrimmedStringSchema,
  name: nonEmptyTrimmedStringSchema,
  address: nonEmptyTrimmedStringSchema,
  city: nonEmptyTrimmedStringSchema,
  isActive: z.boolean().optional(),
});

const updateFacilityBodySchema = z.object({
  name: optionalTrimmedStringSchema,
  address: optionalTrimmedStringSchema,
  city: optionalTrimmedStringSchema,
  isActive: z.boolean().optional(),
});

/**
 * GET /api/facilities
 * Get all facilities with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const query = validateWithSchema(facilityListQuerySchema, req.query, 'facility query');

    const facilities = await facilityService.findAll({
      city: query.city,
      active: parseBooleanQuery(query.active),
      search: query.search,
    });

    sendSuccess(res, facilities, 200, { count: facilities.length });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    sendServerError(res, 'Failed to fetch facilities');
  }
});

/**
 * GET /api/facilities/cities
 * Get all distinct cities
 */
router.get('/cities', async (_req, res) => {
  try {
    const cities = await facilityService.getCities();

    sendSuccess(res, cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    sendServerError(res, 'Failed to fetch cities');
  }
});

/**
 * GET /api/facilities/:id
 * Get a single facility by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'facility id parameter');
    const facility = await facilityService.findById(params.id);

    if (!facility) {
      sendError(res, 404, 'Facility not found');
      return;
    }

    sendSuccess(res, facility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    sendServerError(res, 'Failed to fetch facility');
  }
});

/**
 * POST /api/facilities
 * Create a new facility
 */
router.post('/', async (req, res) => {
  try {
    const body = validateWithSchema(createFacilityBodySchema, req.body, 'create facility body');
    const facility = await facilityService.create(body);

    sendSuccess(res, facility, 201);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    if (error instanceof FacilityValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    if (error instanceof FacilityConflictError) {
      sendError(res, 409, error.message);
      return;
    }

    console.error('Error creating facility:', error);
    sendServerError(res, 'Failed to create facility');
  }
});

/**
 * PUT /api/facilities/:id
 * Update a facility
 */
router.put('/:id', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'facility id parameter');
    const body = validateWithSchema(updateFacilityBodySchema, req.body, 'update facility body');
    const facility = await facilityService.update(params.id, body);

    if (!facility) {
      sendError(res, 404, 'Facility not found');
      return;
    }

    sendSuccess(res, facility);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    console.error('Error updating facility:', error);
    sendServerError(res, 'Failed to update facility');
  }
});

/**
 * DELETE /api/facilities/:id
 * Soft delete a facility
 */
router.delete('/:id', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'facility id parameter');
    const facility = await facilityService.softDelete(params.id);

    if (!facility) {
      sendError(res, 404, 'Facility not found');
      return;
    }

    try {
      await masterDataEventsPublisher.publishFacilityDeleted({
        id: facility.id,
        deletedAt: new Date().toISOString(),
      });
    } catch (publishError) {
      console.error('Failed to publish facility-deleted event:', publishError);
    }

    sendSuccess(res, facility, 200, { message: 'Facility deactivated successfully' });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    console.error('Error deleting facility:', error);
    sendServerError(res, 'Failed to delete facility');
  }
});

/**
 * DELETE /api/facilities/:id/permanent
 * Permanently delete a facility
 */
router.delete('/:id/permanent', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'facility id parameter');
    const facility = await facilityService.permanentDelete(params.id);

    if (!facility) {
      sendError(res, 404, 'Facility not found');
      return;
    }

    try {
      await masterDataEventsPublisher.publishFacilityDeleted({
        id: facility.id,
        deletedAt: new Date().toISOString(),
      });
    } catch (publishError) {
      console.error('Failed to publish facility-deleted event:', publishError);
    }

    sendSuccess(res, null, 200, { message: 'Facility permanently deleted' });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    console.error('Error permanently deleting facility:', error);
    sendServerError(res, 'Failed to permanently delete facility');
  }
});

export default router;
