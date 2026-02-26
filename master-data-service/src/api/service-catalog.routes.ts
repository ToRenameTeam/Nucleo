import { Router } from 'express';
import {
    serviceCatalogService,
    ServiceCatalogValidationError,
    ServiceCatalogConflictError
} from '../services/index.js';
import { parseBooleanQuery, sendError, sendServerError, sendSuccess } from './route.utils.js';

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
            active: parseBooleanQuery(active),
            search: search as string | undefined
        });

        sendSuccess(res, serviceTypes, 200, { count: serviceTypes.length });
    } catch (error) {
        console.error('Error fetching service types:', error);
        sendServerError(res, 'Failed to fetch service types');
    }
});

/**
 * GET /api/service-catalog/categories
 * Get all available categories
 */
router.get('/categories', (_req, res) => {
    const categories = serviceCatalogService.getCategories();

    sendSuccess(res, categories);
});

/**
 * GET /api/service-catalog/:id
 * Get a single service type by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const serviceType = await serviceCatalogService.findById(req.params.id);

        if (!serviceType) {
            sendError(res, 404, 'Service type not found');
            return;
        }

        sendSuccess(res, serviceType);
    } catch (error) {
        console.error('Error fetching service type:', error);
        sendServerError(res, 'Failed to fetch service type');
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

        sendSuccess(res, serviceType, 201);
    } catch (error) {
        if (error instanceof ServiceCatalogValidationError) {
            sendError(res, 400, error.message);
            return;
        }

        if (error instanceof ServiceCatalogConflictError) {
            sendError(res, 409, error.message);
            return;
        }

        console.error('Error creating service type:', error);
        sendServerError(res, 'Failed to create service type');
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
            sendError(res, 404, 'Service type not found');
            return;
        }

        sendSuccess(res, serviceType);
    } catch (error) {
        console.error('Error updating service type:', error);
        sendServerError(res, 'Failed to update service type');
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
            sendError(res, 404, 'Service type not found');
            return;
        }

        sendSuccess(res, serviceType, 200, { message: 'Service type deactivated successfully' });
    } catch (error) {
        console.error('Error deleting service type:', error);
        sendServerError(res, 'Failed to delete service type');
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
            sendError(res, 404, 'Service type not found');
            return;
        }

        sendSuccess(res, null, 200, { message: 'Service type permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting service type:', error);
        sendServerError(res, 'Failed to permanently delete service type');
    }
});

export default router;
