import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticationService } from '../services/index.js';
import { success } from './utils/response.js';
import { handleRouteError } from './utils/http-helpers.js';
import { nonEmptyTrimmedStringSchema, validateWithSchema } from './validation.js';
import {
  createAccessToken,
  requireAuth,
  type AuthenticatedRequest,
} from '../modules/authorization/index.js';
import { error } from './utils/response.js';

const router = Router();

const AUTH_ERROR_RULES = [
  { statusCode: 401, messageIncludes: 'Invalid credentials' },
  { statusCode: 404, messageIncludes: 'not found' },
  { statusCode: 400, messageIncludes: 'does not have' },
  { statusCode: 400, messageIncludes: 'Invalid' },
];

const loginBodySchema = z.object({
  fiscalCode: nonEmptyTrimmedStringSchema,
  password: nonEmptyTrimmedStringSchema,
});

const selectProfileBodySchema = z.object({
  userId: nonEmptyTrimmedStringSchema,
  selectedProfile: z.enum(['PATIENT', 'DOCTOR']),
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { fiscalCode, password } = validateWithSchema(loginBodySchema, req.body, 'login body');

    const authenticatedUser = await authenticationService.login(fiscalCode, password);
    const accessToken = createAccessToken({
      userId: authenticatedUser.user.userId,
      fiscalCode: authenticatedUser.user.fiscalCode.value,
      activeProfile: authenticatedUser.activeProfile,
    });

    const baseData = {
      userId: authenticatedUser.user.userId,
      fiscalCode: authenticatedUser.user.fiscalCode.value,
      name: authenticatedUser.user.profileInfo.name,
      lastName: authenticatedUser.user.profileInfo.lastName,
      dateOfBirth: authenticatedUser.user.profileInfo.dateOfBirth,
    };

    // Case 1: PatientOnly - return complete data immediately
    if (!authenticatedUser.hasDoctorProfile) {
      return success(res, {
        ...baseData,
        activeProfile: 'PATIENT',
        accessToken,
        patient: {
          userId: authenticatedUser.user.userId,
        },
      });
    }

    // Case 2: DoctorPatient - require profile selection
    return success(res, {
      ...baseData,
      requiresProfileSelection: true,
      accessToken,
    });
  } catch (err) {
    return handleRouteError(res, err, 'Login error', AUTH_ERROR_RULES);
  }
});

router.post('/select-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, selectedProfile } = validateWithSchema(
      selectProfileBodySchema,
      req.body,
      'select profile body'
    );

    const authenticatedRequest = req as AuthenticatedRequest;
    if (authenticatedRequest.auth?.userId !== userId) {
      return error(res, 'Unauthorized', 401);
    }

    const profileData = await authenticationService.getProfileData(userId, selectedProfile);
    const accessToken = createAccessToken({
      userId: profileData.userId,
      fiscalCode: profileData.fiscalCode,
      activeProfile: selectedProfile,
    });

    return success(res, {
      ...profileData,
      accessToken,
    });
  } catch (err) {
    return handleRouteError(res, err, 'Profile selection error', AUTH_ERROR_RULES);
  }
});

export default router;
