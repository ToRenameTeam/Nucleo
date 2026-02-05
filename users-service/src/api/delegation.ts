import { Router, Request, Response } from 'express';
import { delegationService } from '../services/index.js';
import { success, error } from './utils/response.js';
import { AppError } from '../utils/errors.js';

const router = Router();

/**
 * POST /api/delegations
 * Create a new delegation
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { delegatingUserId, delegatorUserId } = req.body;

        if (!delegatingUserId || !delegatorUserId) {
            return error(res, 'delegatingUserId and delegatorUserId are required', 400);
        }

        if (delegatingUserId === delegatorUserId) {
            return error(res, 'Cannot delegate to yourself', 400);
        }

        const delegation = await delegationService.createDelegation({
            delegatingUserId,
            delegatorUserId,
        });

        return success(res, delegation, 201);
    } catch (err) {
        console.error('Create delegation error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/delegations
 * Get all delegations, optionally filtered by status
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const status = req.query.status as string;
        const result = await delegationService.getAllDelegations(status);
        return success(res, result);
    } catch (err) {
        console.error('Get all delegations error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/delegations/received
 * Get delegations received by user
 */
router.get('/received', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;

        if (!userId) {
            return error(res, 'userId is required as query parameter', 400);
        }

        const status = req.query.status as string | undefined;
        const result = await delegationService.getDelegationsForUser(userId, 'delegating', status);
        return success(res, result);
    } catch (err) {
        console.error('Get received delegations error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/delegations/sent
 * Get delegations sent by user
 */
router.get('/sent', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;

        if (!userId) {
            return error(res, 'userId is required as query parameter', 400);
        }

        const status = req.query.status as string | undefined;
        const result = await delegationService.getDelegationsForUser(userId, 'delegator', status);
        return success(res, result);
    } catch (err) {
        console.error('Get sent delegations error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/delegations/active-for-user
 * Get active delegations for a delegating user
 */
router.get('/active-for-user', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;

        if (!userId) {
            return error(res, 'userId is required as query parameter', 400);
        }

        const result = await delegationService.getActiveDelegationsForDelegatingUser(userId);
        return success(res, result);
    } catch (err) {
        console.error('Get active delegations error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/delegations/:delegationId
 * Get delegation by ID
 */
router.get('/:delegationId', async (req: Request, res: Response) => {
    try {
        const { delegationId } = req.params;

        if (!delegationId || typeof delegationId !== 'string') {
            return error(res, 'Invalid delegation ID', 400);
        }

        const delegation = await delegationService.getDelegationById(delegationId);
        return success(res, delegation);
    } catch (err) {
        console.error('Get delegation error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * PUT /api/delegations/:delegationId/accept
 * Accept a delegation
 */
router.put('/:delegationId/accept', async (req: Request, res: Response) => {
    try {
        const { delegationId } = req.params;
        const { userId } = req.body;

        if (!delegationId || typeof delegationId !== 'string') {
            return error(res, 'Invalid delegation ID', 400);
        }

        if (!userId || typeof userId !== 'string') {
            return error(res, 'userId is required in request body', 400);
        }

        const result = await delegationService.acceptDelegation(delegationId, userId);
        return success(res, result);
    } catch (err) {
        console.error('Accept delegation error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * PUT /api/delegations/:delegationId/decline
 * Decline a delegation
 */
router.put('/:delegationId/decline', async (req: Request, res: Response) => {
    try {
        const { delegationId } = req.params;
        const { userId } = req.body;

        if (!delegationId || typeof delegationId !== 'string') {
            return error(res, 'Invalid delegation ID', 400);
        }

        if (!userId || typeof userId !== 'string') {
            return error(res, 'userId is required in request body', 400);
        }

        const result = await delegationService.declineDelegation(delegationId, userId);
        return success(res, result);
    } catch (err) {
        console.error('Decline delegation error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * DELETE /api/delegations/:delegationId
 * Delete a delegation
 */
router.delete('/:delegationId', async (req: Request, res: Response) => {
    try {
        const { delegationId } = req.params;
        const userId = req.query.userId as string;

        if (!delegationId || typeof delegationId !== 'string') {
            return error(res, 'Invalid delegation ID', 400);
        }

        if (!userId) {
            return error(res, 'userId is required as query parameter', 400);
        }

        const result = await delegationService.deleteDelegation(delegationId, userId);
        return success(res, result);
    } catch (err) {
        console.error('Delete delegation error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

export default router;