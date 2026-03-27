import { Router } from 'express';
import { z } from 'zod';
import {
  medicineService,
  masterDataEventsPublisher,
  MedicineValidationError,
  MedicineConflictError,
} from '../services/index.js';
import { MedicineCategory } from '../domain/index.js';
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

const medicineListQuerySchema = z.object({
  category: z.nativeEnum(MedicineCategory).optional(),
  active: booleanQueryValueSchema.optional(),
  search: optionalTrimmedStringSchema,
});

const createMedicineBodySchema = z.object({
  code: nonEmptyTrimmedStringSchema,
  name: nonEmptyTrimmedStringSchema,
  description: nonEmptyTrimmedStringSchema,
  category: z.nativeEnum(MedicineCategory),
  activeIngredient: nonEmptyTrimmedStringSchema,
  dosageForm: nonEmptyTrimmedStringSchema,
  strength: nonEmptyTrimmedStringSchema,
  manufacturer: nonEmptyTrimmedStringSchema,
  isActive: z.boolean().optional(),
});

const updateMedicineBodySchema = z.object({
  name: optionalTrimmedStringSchema,
  description: optionalTrimmedStringSchema,
  category: z.nativeEnum(MedicineCategory).optional(),
  activeIngredient: optionalTrimmedStringSchema,
  dosageForm: optionalTrimmedStringSchema,
  strength: optionalTrimmedStringSchema,
  manufacturer: optionalTrimmedStringSchema,
  isActive: z.boolean().optional(),
});

/**
 * GET /api/medicines
 * Get all medicines with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const query = validateWithSchema(medicineListQuerySchema, req.query, 'medicine query');

    const medicines = await medicineService.findAll({
      category: query.category,
      active: parseBooleanQuery(query.active),
      search: query.search,
    });

    sendSuccess(res, medicines, 200, { count: medicines.length });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    sendServerError(res, 'Failed to fetch medicines');
  }
});

/**
 * GET /api/medicines/categories
 * Get all available categories
 */
router.get('/categories', (_req, res) => {
  const categories = medicineService.getCategories();

  sendSuccess(res, categories);
});

/**
 * GET /api/medicines/:id
 * Get a single medicine by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'medicine id parameter');
    const medicine = await medicineService.findById(params.id);

    if (!medicine) {
      sendError(res, 404, 'Medicine not found');
      return;
    }

    sendSuccess(res, medicine);
  } catch (error) {
    console.error('Error fetching medicine:', error);
    sendServerError(res, 'Failed to fetch medicine');
  }
});

/**
 * POST /api/medicines
 * Create a new medicine
 */
router.post('/', async (req, res) => {
  try {
    const body = validateWithSchema(createMedicineBodySchema, req.body, 'create medicine body');
    const medicine = await medicineService.create(body);

    sendSuccess(res, medicine, 201);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    if (error instanceof MedicineValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    if (error instanceof MedicineConflictError) {
      sendError(res, 409, error.message);
      return;
    }

    console.error('Error creating medicine:', error);
    sendServerError(res, 'Failed to create medicine');
  }
});

/**
 * PUT /api/medicines/:id
 * Update a medicine
 */
router.put('/:id', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'medicine id parameter');
    const body = validateWithSchema(updateMedicineBodySchema, req.body, 'update medicine body');
    const medicine = await medicineService.update(params.id, body);

    if (!medicine) {
      sendError(res, 404, 'Medicine not found');
      return;
    }

    sendSuccess(res, medicine);
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    console.error('Error updating medicine:', error);
    sendServerError(res, 'Failed to update medicine');
  }
});

/**
 * DELETE /api/medicines/:id
 * Soft delete a medicine
 */
router.delete('/:id', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'medicine id parameter');
    const medicine = await medicineService.softDelete(params.id);

    if (!medicine) {
      sendError(res, 404, 'Medicine not found');
      return;
    }

    try {
      await masterDataEventsPublisher.publishMedicineDeleted({
        id: medicine.id,
        deletedAt: new Date().toISOString(),
      });
    } catch (publishError) {
      console.error('Failed to publish medicine-deleted event:', publishError);
    }

    sendSuccess(res, medicine, 200, { message: 'Medicine deactivated successfully' });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    console.error('Error deleting medicine:', error);
    sendServerError(res, 'Failed to delete medicine');
  }
});

/**
 * DELETE /api/medicines/:id/permanent
 * Permanently delete a medicine
 */
router.delete('/:id/permanent', async (req, res) => {
  try {
    const params = validateWithSchema(idParamSchema, req.params, 'medicine id parameter');
    const medicine = await medicineService.permanentDelete(params.id);

    if (!medicine) {
      sendError(res, 404, 'Medicine not found');
      return;
    }

    try {
      await masterDataEventsPublisher.publishMedicineDeleted({
        id: medicine.id,
        deletedAt: new Date().toISOString(),
      });
    } catch (publishError) {
      console.error('Failed to publish medicine-deleted event:', publishError);
    }

    sendSuccess(res, null, 200, { message: 'Medicine permanently deleted' });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      sendError(res, 400, error.message);
      return;
    }

    console.error('Error permanently deleting medicine:', error);
    sendServerError(res, 'Failed to permanently delete medicine');
  }
});

export default router;
