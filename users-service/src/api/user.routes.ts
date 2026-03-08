import { Router, Request, Response } from 'express';
import { userService } from '../services/index.js';
import { success, error } from './utils/response.js';
import { handleRouteError, hasRequiredFields, isNonEmptyString } from './utils/http-helpers.js';

const router = Router();

const USER_ERROR_RULES = [
  { statusCode: 404, messageEquals: 'User not found' },
  { statusCode: 409, messageIncludes: 'already exists' },
  { statusCode: 400, messageIncludes: 'Invalid' },
];

// Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fiscalCode, password, name, lastName, dateOfBirth, doctor } = req.body;

    if (
      !hasRequiredFields(req.body as Record<string, unknown>, [
        'fiscalCode',
        'password',
        'name',
        'lastName',
        'dateOfBirth',
      ])
    ) {
      return error(
        res,
        'Missing required fields: fiscalCode, password, name, lastName, dateOfBirth',
        400
      );
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
    return handleRouteError(res, err, 'Create user error', USER_ERROR_RULES);
  }
});

// Search user by fiscal code - DEVE STARE PRIMA DI /:userId
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { fiscalCode } = req.query;

    if (!isNonEmptyString(fiscalCode)) {
      return error(res, 'Missing or invalid fiscal code', 400);
    }

    const user = await userService.getUserByFiscalCode(fiscalCode);
    return success(res, user);
  } catch (err) {
    return handleRouteError(res, err, 'Search user error', USER_ERROR_RULES);
  }
});

// List all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await userService.listUsers();
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'List users error', USER_ERROR_RULES);
  }
});

// Get user by ID - DEVE STARE DOPO /search
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!isNonEmptyString(userId)) {
      return error(res, 'Invalid user ID', 400);
    }

    const user = await userService.getUserById(userId);
    return success(res, user);
  } catch (err) {
    return handleRouteError(res, err, 'Get user error', USER_ERROR_RULES);
  }
});

export default router;
