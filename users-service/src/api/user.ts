import { Router, Request, Response } from 'express';
import { userService } from '../services/index.js';
import { success, error } from './utils/response.js';
import { AppError } from '../utils/errors.js';
import { CreateUserInput } from "./dtos/UserDTOs.js";

const router = Router();


/**
 * POST /api/users
 * Create a new user
 */
router.post('/', async (req: Request, res: Response) => {
    try {

        const input: CreateUserInput = req.body;

        if (!input.fiscalCode || !input.password || !input.name || !input.lastName || !input.dateOfBirth) {
            return error(res, 'Missing required fields: fiscalCode, password, name, lastName, dateOfBirth', 400);
        }

        const user = await userService.createUser(input);

        return success(res, user, 201);
    } catch (err) {
        console.error('Create user error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/users/search
 * Search user by fiscal code
 */
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { fiscalCode } = req.query;

        if (!fiscalCode || typeof fiscalCode !== 'string') {
            return error(res, 'Invalid or missing fiscalCode query parameter', 400);
        }

        const user = await userService.getUserByFiscalCode(fiscalCode);
        return success(res, user);
    } catch (err) {
        console.error('Search user error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/users
 * List all users
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await userService.listUsers();
        return success(res, result);
    } catch (err) {
        console.error('List users error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

/**
 * GET /api/users/:userId
 * Get user by ID
 */
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId || typeof userId !== 'string') {
            return error(res, 'Invalid user ID', 400);
        }

        const user = await userService.getUserById(userId);
        return success(res, user);
    } catch (err) {
        console.error('Get user error:', err);
        if (err instanceof AppError) {
            return error(res, err.message, err.statusCode);
        }
        return error(res, 'Internal server error', 500);
    }
});

export default router;