import { Router } from 'express';
import {
    medicineService,
    MedicineValidationError,
    MedicineConflictError
} from '../services/medicine.service.js';

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
            active: active !== undefined ? active === 'true' : undefined,
            search: search as string | undefined
        });

        res.json({
            success: true,
            count: medicines.length,
            data: medicines
        });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch medicines'
        });
    }
});

/**
 * GET /api/medicines/categories
 * Get all available categories
 */
router.get('/categories', (_req, res) => {
    const categories = medicineService.getCategories();

    res.json({
        success: true,
        data: categories
    });
});

/**
 * GET /api/medicines/:id
 * Get a single medicine by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const medicine = await medicineService.findById(req.params.id);

        if (!medicine) {
            res.status(404).json({
                success: false,
                error: 'Medicine not found'
            });
            return;
        }

        res.json({
            success: true,
            data: medicine
        });
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch medicine'
        });
    }
});

/**
 * POST /api/medicines
 * Create a new medicine
 */
router.post('/', async (req, res) => {
    try {
        const medicine = await medicineService.create(req.body);

        res.status(201).json({
            success: true,
            data: medicine
        });
    } catch (error) {
        if (error instanceof MedicineValidationError) {
            res.status(400).json({
                success: false,
                error: error.message
            });
            return;
        }

        if (error instanceof MedicineConflictError) {
            res.status(409).json({
                success: false,
                error: error.message
            });
            return;
        }

        console.error('Error creating medicine:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create medicine'
        });
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
            res.status(404).json({
                success: false,
                error: 'Medicine not found'
            });
            return;
        }

        res.json({
            success: true,
            data: medicine
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update medicine'
        });
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
            res.status(404).json({
                success: false,
                error: 'Medicine not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Medicine deactivated successfully',
            data: medicine
        });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete medicine'
        });
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
            res.status(404).json({
                success: false,
                error: 'Medicine not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Medicine permanently deleted'
        });
    } catch (error) {
        console.error('Error permanently deleting medicine:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to permanently delete medicine'
        });
    }
});

export default router;
