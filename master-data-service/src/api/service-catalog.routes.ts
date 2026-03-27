import { Router } from 'express';
import { z } from 'zod';
import {
  serviceCatalogService,
  masterDataEventsPublisher,
  ServiceCatalogValidationError,
  ServiceCatalogConflictError,
} from '../services/index.js';
import { ServiceCategory } from '../domain/index.js';
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

const serviceCatalogListQuerySchema = z.object({
  category: z.nativeEnum(ServiceCategory).optional(),
  active: booleanQueryValueSchema.optional(),
  search: optionalTrimmedStringSchema,
});

const createServiceTypeBodySchema = z.object({
  code: nonEmptyTrimmedStringSchema,
  name: nonEmptyTrimmedStringSchema,
  description: optionalTrimmedStringSchema,
  category: z.array(z.nativeEnum(ServiceCategory)).min(1),
  isActive: z.boolean().optional(),
});

const updateServiceTypeBodySchema = z.object({
  name: optionalTrimmedStringSchema,
  description: optionalTrimmedStringSchema,
  category: z.array(z.nativeEnum(ServiceCategory)).min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/service-catalog
 * Get all service types with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const query = validateWithSchema(
      serviceCatalogListQuerySchema,
      req.query,
      'service catalog query'
    );

    const serviceTypes = await serviceCatalogService.findAll({
      category: query.category,
      active: parseBooleanQuery(query.active),
      search: query.search,
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
    const params = validateWithSchema(idParamSchema, req.params, 'service type id parameter');
    const serviceType = await serviceCatalogService.findById(params.id);

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
    const body = validateWithSchema(
      createServiceTypeBodySchema,
      req.body,
      'create service type body'
    );

    const serviceType = await serviceCatalogService.create({
      code: body.code,
      name: body.name,
      description: body.description,
      category: body.category,
      isActive: body.isActive,
    });

    sendSuccess(res, serviceType, 201);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

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
    const params = validateWithSchema(idParamSchema, req.params, 'service type id parameter');
    const body = validateWithSchema(
      updateServiceTypeBodySchema,
      req.body,
      'update service type body'
    );

    const serviceType = await serviceCatalogService.update(params.id, {
      name: body.name,
      description: body.description,
      category: body.category,
      isActive: body.isActive,
    });

    if (!serviceType) {
      sendError(res, 404, 'Service type not found');
      return;
    }

    sendSuccess(res, serviceType);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

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
    const params = validateWithSchema(idParamSchema, req.params, 'service type id parameter');
    const serviceType = await serviceCatalogService.softDelete(params.id);

    if (!serviceType) {
      sendError(res, 404, 'Service type not found');
      return;
    }

    try {
      await masterDataEventsPublisher.publishServiceTypeDeleted({
        id: serviceType.id,
        deletedAt: new Date().toISOString(),
      });
    } catch (publishError) {
      console.error('Failed to publish service-type-deleted event:', publishError);
    }

    sendSuccess(res, serviceType, 200, { message: 'Service type deactivated successfully' });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

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
    const params = validateWithSchema(idParamSchema, req.params, 'service type id parameter');
    const serviceType = await serviceCatalogService.permanentDelete(params.id);

    if (!serviceType) {
      sendError(res, 404, 'Service type not found');
      return;
    }

    try {
      await masterDataEventsPublisher.publishServiceTypeDeleted({
        id: serviceType.id,
        deletedAt: new Date().toISOString(),
      });
    } catch (publishError) {
      console.error('Failed to publish service-type-deleted event:', publishError);
    }

    sendSuccess(res, null, 200, { message: 'Service type permanently deleted' });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    console.error('Error permanently deleting service type:', error);
    sendServerError(res, 'Failed to permanently delete service type');
  }
});

export default router;
