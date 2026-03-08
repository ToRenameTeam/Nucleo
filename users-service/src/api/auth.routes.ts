import { Router, Request, Response } from 'express';
import { authenticationService } from '../services/index.js';
import { success, error } from './utils/response.js';
import {
  handleRouteError,
  hasRequiredFields,
  isOneOf,
  isNonEmptyString,
} from './utils/http-helpers.js';

const router = Router();

const AUTH_ERROR_RULES = [
  { statusCode: 401, messageIncludes: 'Invalid credentials' },
  { statusCode: 404, messageIncludes: 'not found' },
  { statusCode: 400, messageIncludes: 'does not have' },
];

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { fiscalCode, password } = req.body;

    if (!hasRequiredFields(req.body as Record<string, unknown>, ['fiscalCode', 'password'])) {
      return error(res, 'Fiscal code and password are required', 400);
    }

    const authenticatedUser = await authenticationService.login(fiscalCode, password);

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
        patient: {
          userId: authenticatedUser.user.userId,
        },
      });
    }

    // Case 2: DoctorPatient - require profile selection
    return success(res, {
      ...baseData,
      requiresProfileSelection: true,
    });
  } catch (err) {
    return handleRouteError(res, err, 'Login error', AUTH_ERROR_RULES);
  }
});

router.post('/select-profile', async (req: Request, res: Response) => {
  try {
    const { userId, selectedProfile } = req.body;

    if (!isNonEmptyString(userId)) {
      return error(res, 'User ID is required', 400);
    }

    if (!isOneOf(selectedProfile, ['PATIENT', 'DOCTOR'])) {
      return error(res, 'Invalid profile type. Must be PATIENT or DOCTOR', 400);
    }

    const profileData = await authenticationService.getProfileData(userId, selectedProfile);
    return success(res, profileData);
  } catch (err) {
    return handleRouteError(res, err, 'Profile selection error', AUTH_ERROR_RULES);
  }
});

export default router;
