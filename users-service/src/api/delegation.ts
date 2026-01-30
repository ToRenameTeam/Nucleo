import { Router, Request, Response } from 'express';
import { DelegationService } from '../services/DelegationService.js';
import { DelegationRepositoryImpl } from '../infrastructure/repositories/implementations/DelegationRepositoryImpl.js';
import { PatientRepositoryImpl } from '../infrastructure/repositories/implementations/PatientRepositoryImpl.js';
import { success, error } from './utils/response.js';

const router = Router();

const delegationService = new DelegationService(
    new DelegationRepositoryImpl(),
    new PatientRepositoryImpl()
);

// Create a new delegation
router.post('/', async (req: Request, res: Response) => {
    try {
        const { delegatingUserId, delegatorUserId } = req.body;

        if (!delegatingUserId || !delegatorUserId) {
            return error(res, 'delegatingUserId and delegatorUserId are required', 400);
        }
        if (delegatingUserId === delegatorUserId) {
            return error(res, 'cannot delegate to yourself', 400);
        }

        const delegation = await delegationService.createDelegation({
            delegatingUserId,
            delegatorUserId,
        });

        return success(res, delegation, 201);

    } catch (err) {
        console.error('Create delegation error:', err);

        if (err instanceof Error) {
            if (err.message.includes('not found')) {
                return error(res, err.message, 404);
            }
            if (err.message.includes('already exists')) {
                return error(res, err.message, 409);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

// Get delegations received by user (where user must accept/decline)
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
        console.error('List received delegations error:', err);
        return error(res, 'Internal server error', 500);
    }
});

// Get delegations sent by user (where user is the data owner)
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
        console.error('List sent delegations error:', err);
        return error(res, 'Internal server error', 500);
    }
});

// Get active delegations where user can operate for others
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
        return error(res, 'Internal server error', 500);
    }
});

// Get delegation by ID
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

        if (err instanceof Error) {
            if (err.message === 'Delegation not found') {
                return error(res, 'Delegation not found', 404);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

// Accept a delegation
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

        if (err instanceof Error) {
            if (err.message === 'Delegation not found') {
                return error(res, err.message, 404);
            }
            if (err.message.includes('not authorized')) {
                return error(res, err.message, 403);
            }
            if (err.message.includes('Cannot accept')) {
                return error(res, err.message, 400);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

// Decline a delegation
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

        if (err instanceof Error) {
            if (err.message === 'Delegation not found') {
                return error(res, err.message, 404);
            }
            if (err.message.includes('not authorized')) {
                return error(res, err.message, 403);
            }
            if (err.message.includes('Cannot decline')) {
                return error(res, err.message, 400);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

// Delete a delegation
router.delete('/:delegationId', async (req: Request, res: Response) => {
    try {
        const { delegationId } = req.params;
        const userId = req.query.userId as string;

        if (!delegationId || typeof delegationId !== 'string') {
            return error(res, 'Invalid delegation ID', 400);
        }

        if (!userId || typeof userId !== 'string') {
            return error(res, 'userId is required as query parameter', 400);
        }

        const result = await delegationService.deleteDelegation(delegationId, userId);
        return success(res, result);

    } catch (err) {
        console.error('Delete delegation error:', err);

        if (err instanceof Error) {
            if (err.message === 'Delegation not found') {
                return error(res, err.message, 404);
            }
            if (err.message.includes('not authorized')) {
                return error(res, err.message, 403);
            }
            if (err.message.includes('Cannot delete')) {
                return error(res, err.message, 400);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

export default router;