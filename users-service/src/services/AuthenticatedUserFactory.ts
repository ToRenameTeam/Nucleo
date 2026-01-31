import type { User } from '../domains/User.js';
import type { Patient } from '../domains/Patient.js';
import type { Doctor } from '../domains/Doctor.js';

export type ActiveProfile = 'PATIENT' | 'DOCTOR';

/**
 * Common interface for all authenticated users
 */
export interface IAuthenticatedUser {
    readonly user: User;
    readonly activeProfile: ActiveProfile;
    readonly hasDoctorProfile: boolean;
}

/**
 * Factory to create the correct type of authenticated user
 */
export class AuthenticatedUserFactory {
    static create(
        user: User,
        patientProfile: Patient | null,
        doctorProfile: Doctor | null
    ): IAuthenticatedUser {
        if (!patientProfile && !doctorProfile) {
            throw new Error('User must have at least one profile');
        }

        // Case 1: Only Patient
        if (patientProfile && !doctorProfile) {
            return new PatientOnlyUser(user, patientProfile);
        }

        // Case 2: Only Doctor (not supported)
        if (!patientProfile && doctorProfile) {
            throw new Error('Doctor-only profile not supported. Doctors must also be patients.');
        }

        // Case 3: Both Patient and Doctor
        return new DoctorPatientUser(user, patientProfile!, doctorProfile!);
    }
}

/**
 * User with only Patient profile
 */
export class PatientOnlyUser implements IAuthenticatedUser {
    
    constructor(
        private readonly _user: User,
        private readonly _patientProfile: Patient
    ) {}

    get user(): User {
        return this._user;
    }

    get activeProfile(): ActiveProfile {
        return 'PATIENT';
    }

    get hasDoctorProfile(): boolean {
        return false;
    }

    get patientProfile(): Patient {
        return this._patientProfile;
    }
}

/**
 * User who has both Patient and Doctor profiles
 */
export class DoctorPatientUser implements IAuthenticatedUser {
    private readonly _activeProfile: ActiveProfile;

    constructor(
        private readonly _user: User,
        private readonly _patientProfile: Patient,
        private readonly _doctorProfile: Doctor,
        initialProfile: ActiveProfile = 'PATIENT'
    ) {
        this._activeProfile = initialProfile;
    }

    get user(): User {
        return this._user;
    }

    get activeProfile(): ActiveProfile {
        return this._activeProfile;
    }

    get hasDoctorProfile(): boolean {
        return true;
    }

    get patientProfile(): Patient {
        return this._patientProfile;
    }

    get doctorProfile(): Doctor {
        return this._doctorProfile;
    }
}