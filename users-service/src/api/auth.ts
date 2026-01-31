import { Router, Request, Response } from 'express';
import { AuthenticationService } from '../services/AuthenticationService.js';
import { UserRepositoryImpl } from '../infrastructure/repositories/implementations/UserRepositoryImpl.js';
import { PatientRepositoryImpl } from '../infrastructure/repositories/implementations/PatientRepositoryImpl.js';
import { DoctorRepositoryImpl } from '../infrastructure/repositories/implementations/DoctorRepositoryImpl.js';
import { success, error } from './utils/response.js';
import { PatientOnlyUser } from '../services/AuthenticatedUserFactory.js';

const router = Router();

const authService = new AuthenticationService(
    new UserRepositoryImpl(),
    new PatientRepositoryImpl(),
    new DoctorRepositoryImpl()
);

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { fiscalCode, password } = req.body;

        if (!fiscalCode || !password) {
            return error(res, 'Fiscal code and password are required', 400);
        }

        const authenticatedUser = await authService.login(fiscalCode, password);

        const baseData = {
            userId: authenticatedUser.user.userId,
            fiscalCode: authenticatedUser.user.fiscalCode.value,
            name: authenticatedUser.user.profileInfo.name,
            lastName: authenticatedUser.user.profileInfo.lastName,
            dateOfBirth: authenticatedUser.user.profileInfo.dateOfBirth,
        };

        // Case 1: PatientOnly - return complete data immediately
        if (!authenticatedUser.hasDoctorProfile) {

            const patientUser = authenticatedUser as PatientOnlyUser;

            return success(res, {
                ...baseData,
                activeProfile: 'PATIENT',
                patient: {
                    userId: authenticatedUser.user.userId,
                    activeDelegationIds: patientUser.patientProfile.activeDelegationIds,
                },
            });
        }

        // Case 2: DoctorPatient - require profile selection
        return success(res, {
            ...baseData,
            requiresProfileSelection: true,
        });

    } catch (err) {
        console.error('Login error:', err);

        if (err instanceof Error) {
            if (err.message.includes('Invalid credentials')) {
                return error(res, err.message, 401);
            }
        }
        
        return error(res, 'Internal server error', 500);
    }
});

router.post('/select-profile', async (req: Request, res: Response) => {
    try {
        const { userId, selectedProfile } = req.body;

        if (!userId) {
            return error(res, 'User ID is required', 400);
        }

        if (selectedProfile !== 'PATIENT' && selectedProfile !== 'DOCTOR') {
            return error(res, 'Invalid profile type. Must be PATIENT or DOCTOR', 400);
        }

        const profileData = await authService.getProfileData(userId, selectedProfile);
        return success(res, profileData);

    } catch (err) {
        console.error('Profile selection error:', err);
        
        if (err instanceof Error) {
            if (err.message.includes('not found')) {
                return error(res, err.message, 404);
            }
            if (err.message.includes('does not have')) {
                return error(res, err.message, 400);
            }
        }
        
        return error(res, 'Internal server error', 500);
    }
});

export default router;