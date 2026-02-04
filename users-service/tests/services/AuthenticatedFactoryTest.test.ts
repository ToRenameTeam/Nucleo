import { randomUUID } from 'crypto';
import { User } from '../../src/domains/User.js';
import { Patient } from '../../src/domains/Patient.js';
import { Doctor } from '../../src/domains/Doctor.js';
import {
    AuthenticatedUserFactory,
    PatientOnlyUser,
    DoctorPatientUser,
} from '../../src/services/AuthenticatedUserFactory.js';

describe('AuthenticatedUserFactory', () => {
    let mockUser: User;
    let mockPatient: Patient;
    let mockDoctor: Doctor;

    beforeEach(() => {
        mockUser = { userId: randomUUID() } as unknown as User;
        mockPatient = Patient.reconstitute(randomUUID());
        mockDoctor = Doctor.reconstitute(
            randomUUID(),
            'ML123456',
            ['Cardiologia'],
        );
    });

    describe('create', () => {
        it('should create PatientOnlyUser when only patient profile is provided', () => {
            const result = AuthenticatedUserFactory.create(mockUser, mockPatient, null);

            expect(result).toBeInstanceOf(PatientOnlyUser);
            expect(result.user).toBe(mockUser);
            expect(result.hasDoctorProfile).toBe(false);
            expect(result.activeProfile).toBe('PATIENT');
        });

        it('should throw error when only doctor profile is provided (doctor-only not supported)', () => {
            expect(() => 
                AuthenticatedUserFactory.create(mockUser, null, mockDoctor)
            ).toThrow('Doctor-only profile not supported. Doctors must also be patients.');
        });

        it('should throw error when no profiles are provided', () => {
            expect(() => 
                AuthenticatedUserFactory.create(mockUser, null, null)
            ).toThrow('User must have at least one profile');
        });

        it('should create DoctorPatientUser with PATIENT as default active profile', () => {
            const result = AuthenticatedUserFactory.create(mockUser, mockPatient, mockDoctor);

            expect(result).toBeInstanceOf(DoctorPatientUser);
            expect(result.user).toBe(mockUser);
            expect(result.hasDoctorProfile).toBe(true);
            expect(result.activeProfile).toBe('PATIENT');
            
            const doctorPatient = result as DoctorPatientUser;
            expect(doctorPatient.patientProfile).toBe(mockPatient);
            expect(doctorPatient.doctorProfile).toBe(mockDoctor);
            
            expect(doctorPatient.doctorProfile.medicalLicenseNumber).toBe('ML123456');
            expect(doctorPatient.doctorProfile.specialization).toEqual(['Cardiologia']);
        });

        it('should maintain reference to original user object', () => {
            const result = AuthenticatedUserFactory.create(mockUser, mockPatient, null);
            expect(result.user).toBe(mockUser);
        });
    });
});

describe('PatientOnlyUser', () => {
    let mockUser: User;
    let mockPatient: Patient;
    let instance: PatientOnlyUser;

    beforeEach(() => {
        mockUser = { userId: randomUUID() } as unknown as User;
        mockPatient = Patient.reconstitute(randomUUID());
        instance = new PatientOnlyUser(mockUser, mockPatient);
    });

    it('should return PATIENT as active profile', () => {
        expect(instance.activeProfile).toBe('PATIENT');
    });

    it('should indicate no doctor profile', () => {
        expect(instance.hasDoctorProfile).toBe(false);
    });

    it('should return user reference', () => {
        expect(instance.user).toBe(mockUser);
    });
});

describe('DoctorPatientUser', () => {
    let mockUser: User;
    let mockPatient: Patient;
    let mockDoctor: Doctor;

    beforeEach(() => {
        mockUser = { userId: randomUUID() } as unknown as User;
        mockPatient = Patient.reconstitute(randomUUID());
        mockDoctor = Doctor.reconstitute(
            randomUUID(),
            'ML123456',
            ['Cardiologia', 'Medicina Interna'],
        );
    });

    it('should default to PATIENT profile', () => {
        const instance = new DoctorPatientUser(mockUser, mockPatient, mockDoctor);
        expect(instance.activeProfile).toBe('PATIENT');
    });

    it('should allow DOCTOR as initial profile', () => {
        const instance = new DoctorPatientUser(mockUser, mockPatient, mockDoctor, 'DOCTOR');
        expect(instance.activeProfile).toBe('DOCTOR');
    });

    it('should indicate doctor profile is present', () => {
        const instance = new DoctorPatientUser(mockUser, mockPatient, mockDoctor);
        expect(instance.hasDoctorProfile).toBe(true);
    });

    it('should return both patient and doctor profiles', () => {
        const instance = new DoctorPatientUser(mockUser, mockPatient, mockDoctor);
        expect(instance.patientProfile).toBe(mockPatient);
        expect(instance.doctorProfile).toBe(mockDoctor);
    });

    it('should return correct doctor properties', () => {
        const instance = new DoctorPatientUser(mockUser, mockPatient, mockDoctor);
        

        expect(instance.doctorProfile.medicalLicenseNumber).toBe('ML123456');
        expect(instance.doctorProfile.specialization).toEqual(['Cardiologia', 'Medicina Interna']);
    });

    it('should return user reference', () => {
        const instance = new DoctorPatientUser(mockUser, mockPatient, mockDoctor);
        expect(instance.user).toBe(mockUser);
    });
});