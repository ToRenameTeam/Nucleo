import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService.js';
import { UserRepositoryImpl } from '../infrastructure/repositories/implementations/UserRepositoryImpl.js';
import { PatientRepositoryImpl } from '../infrastructure/repositories/implementations/PatientRepositoryImpl.js';
import { DoctorRepositoryImpl } from '../infrastructure/repositories/implementations/DoctorRepositoryImpl.js';
import { success, error } from './utils/response.js';

const router = Router();

const userService = new UserService(
    new UserRepositoryImpl(),
    new PatientRepositoryImpl(),
    new DoctorRepositoryImpl()
);

// Create a new user
router.post('/', async (req: Request, res: Response) => {
    try {

        const { fiscalCode, password, name, lastName, dateOfBirth, doctor } = req.body;

        if (!fiscalCode || !password || !name || !lastName || !dateOfBirth) {
            return error(res, 'Missing required fields: fiscalCode, password, name, lastName, dateOfBirth', 400);
        }

        const user = await userService.createUser({
            fiscalCode,
            password,
            name,
            lastName,
            dateOfBirth,
            doctor,
        });

        return success(res, user, 201);

    } catch (err) {
        console.error('Create user error:', err);

        if (err instanceof Error) {
            if (err.message.includes('already exists')) {
                return error(res, err.message, 409);
            }
            if (err.message.includes('Invalid')) {
                return error(res, err.message, 400);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

// Search user by fiscal code - DEVE STARE PRIMA DI /:userId
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { fiscalCode } = req.query;

        if (!fiscalCode || typeof fiscalCode !== 'string') {
            return error(res, 'Missing or invalid fiscal code', 400);
        }

        const user = await userService.getUserByFiscalCode(fiscalCode);
        return success(res, user);

    } catch (err) {
        console.error('Search user error:', err);

        if (err instanceof Error) {
            if (err.message === 'User not found') {
                return error(res, err.message, 404);
            }
            if (err.message.includes('Invalid')) {
                return error(res, err.message, 400);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

// List all users
router.get('/', async (req: Request, res: Response) => {
    try {

        const result = await userService.listUsers();
        return success(res, result);

    } catch (err) {
        console.error('List users error:', err);
        return error(res, 'Internal server error', 500);
    }
});

// Get user by ID - DEVE STARE DOPO /search
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

        if (err instanceof Error) {
            if (err.message === 'User not found') {
                return error(res, err.message, 404);
            }
        }

        return error(res, 'Internal server error', 500);
    }
});

export default router;