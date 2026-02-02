import { Router } from 'express';
import {
    facilityService,
    FacilityValidationError,
    FacilityConflictError
} from '../services/facility.service.js';

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
            active: active !== undefined ? active === 'true' : undefined,
            search: search as string | undefined
        });

        res.json({
            success: true,
            count: facilities.length,
            data: facilities
        });
    } catch (error) {
        console.error('Error fetching facilities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch facilities'
        });
    }
});

/**
 * GET /api/facilities/cities
 * Get all distinct cities
 */
router.get('/cities', async (_req, res) => {
    try {
        const cities = await facilityService.getCities();

        res.json({
            success: true,
            data: cities
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cities'
        });
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
            res.status(404).json({
                success: false,
                error: 'Facility not found'
            });
            return;
        }

        res.json({
            success: true,
            data: facility
        });
    } catch (error) {
        console.error('Error fetching facility:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch facility'
        });
    }
});

/**
 * POST /api/facilities
 * Create a new facility
 */
router.post('/', async (req, res) => {
    try {
        const facility = await facilityService.create(req.body);

        res.status(201).json({
            success: true,
            data: facility
        });
    } catch (error) {
        if (error instanceof FacilityValidationError) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }

        if (error instanceof FacilityConflictError) {
            res.status(409).json({
                success: false,
                error: error.message
            });
            return;
        }

        console.error('Error creating facility:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create facility'
        });
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
            res.status(404).json({
                success: false,
                error: 'Facility not found'
            });
            return;
        }

        res.json({
            success: true,
            data: facility
        });
    } catch (error) {
        console.error('Error updating facility:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update facility'
        });
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
            res.status(404).json({
                success: false,
                error: 'Facility not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Facility deactivated successfully',
            data: facility
        });
    } catch (error) {
        console.error('Error deleting facility:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete facility'
        });
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
            res.status(404).json({
                success: false,
                error: 'Facility not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Facility permanently deleted'
        });
    } catch (error) {
        console.error('Error permanently deleting facility:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to permanently delete facility'
        });
    }
});

export default router;
