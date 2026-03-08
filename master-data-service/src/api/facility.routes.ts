import { Router } from 'express';
import {
  facilityService,
  FacilityValidationError,
  FacilityConflictError,
} from '../services/facility.service.js';
import { parseBooleanQuery, sendError, sendServerError, sendSuccess } from './route.utils.js';

const router = Router();

/**
 * GET /api/facilities
 * Get all facilities with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { city, active, search } = req.query;

    const facilities = await facilityService.findAll({
      city: city as string | undefined,
      active: parseBooleanQuery(active),
      search: search as string | undefined,
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
    const facility = await facilityService.findById(req.params.id);

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
    const facility = await facilityService.create(req.body);

    sendSuccess(res, facility, 201);
  } catch (error) {
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
    const facility = await facilityService.update(req.params.id, req.body);

    if (!facility) {
      sendError(res, 404, 'Facility not found');
      return;
    }

    sendSuccess(res, facility);
  } catch (error) {
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
    const facility = await facilityService.softDelete(req.params.id);

    if (!facility) {
      sendError(res, 404, 'Facility not found');
      return;
    }

    sendSuccess(res, facility, 200, { message: 'Facility deactivated successfully' });
  } catch (error) {
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
    const facility = await facilityService.permanentDelete(req.params.id);

    if (!facility) {
      sendError(res, 404, 'Facility not found');
      return;
    }

    sendSuccess(res, null, 200, { message: 'Facility permanently deleted' });
  } catch (error) {
    console.error('Error permanently deleting facility:', error);
    sendServerError(res, 'Failed to permanently delete facility');
  }
});

export default router;
