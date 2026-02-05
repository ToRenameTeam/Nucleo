import { Router } from 'express';
import { authService, UnauthorizedError, UserNotFoundError, UserValidationError } from '../services/AuthenticationService.js';
import { success, error } from './utils/response.js'; // ← aggiungi import
import { LoginInput } from "./dtos/UserDTOs.js";

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user and return profile information
 */
router.post('/login', async (req, res) => {
    try {
        const credentials: LoginInput = req.body;
        const authResult = await authService.login(credentials);

        const userData = {
            userId: authResult.user.userId,
            fiscalCode: authResult.user.fiscalCode.value,
            name: authResult.user.profileInfo.name,
            lastName: authResult.user.profileInfo.lastName,
            dateOfBirth: authResult.user.profileInfo.dateOfBirth,
        };

        if (!authResult.hasDoctorProfile) {
            return success(res, {
                ...userData,
                activeProfile: 'PATIENT',
                patient: {
                    userId: authResult.patient.userId,
                    bloodType: authResult.patient.bloodType,
                },
            });
        }

        return success(res, {
            ...userData,
            requiresProfileSelection: true,
        });
    } catch (err) {
        if (err instanceof UserValidationError) {
            return error(res, err.message, 400);
        }
        if (err instanceof UnauthorizedError) {
            return error(res, err.message, 401); 
        }
        if (err instanceof UserNotFoundError) {
            return error(res, err.message, 404); 
        }
        console.error('Login error:', err);
        return error(res, 'Failed to login', 500); 
    }
});

/**
 * POST /api/auth/select-profile
 * Select active profile for users with multiple profiles
 */
router.post('/select-profile', async (req, res) => {
    try {
        const { userId, selectedProfile } = req.body;
        const profileData = await authService.selectProfile(userId, selectedProfile);

        return success(res, profileData); 
    } catch (err) {
        if (err instanceof UserValidationError) {
            return error(res, err.message, 400); 
        }
        if (err instanceof UserNotFoundError) {
            return error(res, err.message, 404); 
        }
        console.error('Select profile error:', err);
        return error(res, 'Failed to select profile', 500); 
    }
});

export default router;