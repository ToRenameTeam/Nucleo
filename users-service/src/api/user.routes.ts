import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { userService } from '../services/index.js';
import { success } from './utils/response.js';
import { handleRouteError } from './utils/http-helpers.js';
import { nonEmptyTrimmedStringSchema, validateWithSchema } from './validation.js';

const router = Router();

const USER_ERROR_RULES = [
  { statusCode: 404, messageEquals: 'User not found' },
  { statusCode: 409, messageIncludes: 'already exists' },
  { statusCode: 400, messageIncludes: 'Invalid' },
];

const createDoctorSchema = z.object({
  medicalLicenseNumber: nonEmptyTrimmedStringSchema,
  specializations: z.array(nonEmptyTrimmedStringSchema),
});

const createUserBodySchema = z.object({
  fiscalCode: nonEmptyTrimmedStringSchema,
  password: nonEmptyTrimmedStringSchema,
  name: nonEmptyTrimmedStringSchema,
  lastName: nonEmptyTrimmedStringSchema,
  dateOfBirth: nonEmptyTrimmedStringSchema,
  doctor: createDoctorSchema.optional(),
});

const searchUserQuerySchema = z.object({
  fiscalCode: nonEmptyTrimmedStringSchema,
});

const userIdParamsSchema = z.object({
  userId: nonEmptyTrimmedStringSchema,
});

// Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fiscalCode, password, name, lastName, dateOfBirth, doctor } = validateWithSchema(
      createUserBodySchema,
      req.body,
      'create user body'
    );

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
    const { fiscalCode } = validateWithSchema(searchUserQuerySchema, req.query, 'search query');

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
    const { userId } = validateWithSchema(userIdParamsSchema, req.params, 'user params');

    const user = await userService.getUserById(userId);
    return success(res, user);
  } catch (err) {
    return handleRouteError(res, err, 'Get user error', USER_ERROR_RULES);
  }
});

export default router;
