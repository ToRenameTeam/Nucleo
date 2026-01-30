import { Router } from 'express';
import {
    serviceCatalogService,
    ValidationError,
    ConflictError
} from '../services/index.js';

const router = Router();

/**
 * GET /api/service-catalog
 * Get all service types with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const { category, active, search } = req.query;

        const serviceTypes = await serviceCatalogService.findAll({
            category: category as string | undefined,
            active: active !== undefined ? active === 'true' : undefined,
            search: search as string | undefined
        });

        res.json({
            success: true,
            count: serviceTypes.length,
            data: serviceTypes
        });
    } catch (error) {
        console.error('Error fetching service types:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch service types'
        });
    }
});

/**
 * GET /api/service-catalog/categories
 * Get all available categories
 */
router.get('/categories', (_req, res) => {
    const categories = serviceCatalogService.getCategories();

    res.json({
        success: true,
        data: categories
    });
});

/**
 * GET /api/service-catalog/:id
 * Get a single service type by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const serviceType = await serviceCatalogService.findById(req.params.id);

        if (!serviceType) {
            res.status(404).json({
                success: false,
                error: 'Service type not found'
            });
            return;
        }

        res.json({
            success: true,
            data: serviceType
        });
    } catch (error) {
        console.error('Error fetching service type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch service type'
        });
    }
});

/**
 * POST /api/service-catalog
 * Create a new service type
 */
router.post('/', async (req, res) => {
    try {
        const { code, name, description, category, isActive } = req.body;

        const serviceType = await serviceCatalogService.create({
            code,
            name,
            description,
            category,
            isActive
        });

        res.status(201).json({
            success: true,
            data: serviceType
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }

        if (error instanceof ConflictError) {
            res.status(409).json({
                success: false,
                error: error.message
            });
            return;
        }

        console.error('Error creating service type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create service type'
        });
    }
});

/**
 * PUT /api/service-catalog/:id
 * Update a service type
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, description, category, isActive } = req.body;

        const serviceType = await serviceCatalogService.update(req.params.id, {
            name,
            description,
            category,
            isActive
        });

        if (!serviceType) {
            res.status(404).json({
                success: false,
                error: 'Service type not found'
            });
            return;
        }

        res.json({
            success: true,
            data: serviceType
        });
    } catch (error) {
        console.error('Error updating service type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update service type'
        });
    }
});

/**
 * DELETE /api/service-catalog/:id
 * Delete a service type (soft delete - sets isActive to false)
 */
router.delete('/:id', async (req, res) => {
    try {
        const serviceType = await serviceCatalogService.softDelete(req.params.id);

        if (!serviceType) {
            res.status(404).json({
                success: false,
                error: 'Service type not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Service type deactivated successfully',
            data: serviceType
        });
    } catch (error) {
        console.error('Error deleting service type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete service type'
        });
    }
});

/**
 * DELETE /api/service-catalog/:id/permanent
 * Permanently delete a service type
 */
router.delete('/:id/permanent', async (req, res) => {
    try {
        const serviceType = await serviceCatalogService.permanentDelete(req.params.id);

        if (!serviceType) {
            res.status(404).json({
                success: false,
                error: 'Service type not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Service type permanently deleted'
        });
    } catch (error) {
        console.error('Error permanently deleting service type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to permanently delete service type'
        });
    }
});

export default router;
