import { Router } from 'express';
import {
    medicineService,
    MedicineValidationError,
    MedicineConflictError
} from '../services/medicine.service.js';
import { parseBooleanQuery, sendError, sendServerError, sendSuccess } from './route.utils.js';

const router = Router();

/**
 * GET /api/medicines
 * Get all medicines with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const { category, active, search } = req.query;

        const medicines = await medicineService.findAll({
            category: category as string | undefined,
            active: parseBooleanQuery(active),
            search: search as string | undefined
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
        const medicine = await medicineService.findById(req.params.id);

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
        const medicine = await medicineService.create(req.body);

        sendSuccess(res, medicine, 201);
    } catch (error) {
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
        const medicine = await medicineService.update(req.params.id, req.body);

        if (!medicine) {
            sendError(res, 404, 'Medicine not found');
            return;
        }

        sendSuccess(res, medicine);
    } catch (error) {
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
        const medicine = await medicineService.softDelete(req.params.id);

        if (!medicine) {
            sendError(res, 404, 'Medicine not found');
            return;
        }

        sendSuccess(res, medicine, 200, { message: 'Medicine deactivated successfully' });
    } catch (error) {
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
        const medicine = await medicineService.permanentDelete(req.params.id);

        if (!medicine) {
            sendError(res, 404, 'Medicine not found');
            return;
        }

        sendSuccess(res, null, 200, { message: 'Medicine permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting medicine:', error);
        sendServerError(res, 'Failed to permanently delete medicine');
    }
});

export default router;
