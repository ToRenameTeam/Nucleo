import { AuthenticationService } from '../../src/services/AuthenticationService.js';
import { IUserRepository, UserData } from '../../src/infrastructure/repositories/IUserRepository.js';
import { IPatientRepository, PatientData } from '../../src/infrastructure/repositories/IPatientRepository.js';
import { IDoctorRepository, DoctorData } from '../../src/infrastructure/repositories/IDoctorRepository.js';
import { PatientOnlyUser, DoctorPatientUser } from '../../src/services/AuthenticatedUserFactory.js';
import { randomUUID } from 'crypto';

describe('AuthenticationService', () => {
    let authService: AuthenticationService;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockPatientRepository: jest.Mocked<IPatientRepository>;
    let mockDoctorRepository: jest.Mocked<IDoctorRepository>;

    beforeEach(() => {
        mockUserRepository = {
            findByFiscalCode: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        };

        mockPatientRepository = {
            findByUserId: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        mockDoctorRepository = {
            findByUserId: jest.fn(),
            findByLicenseNumber: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        authService = new AuthenticationService(
            mockUserRepository,
            mockPatientRepository,
            mockDoctorRepository
        );
    });

    describe('login', () => {
        const fiscalCode = 'RSSMRA80A01H501U';
        const correctPassword = 'CorrectPassword123!';
        const wrongPassword = 'WrongPassword123!';
        const userId = randomUUID();

        // SHA256 hash of 'CorrectPassword123!'
        const correctPasswordHash = '2b21d85b3b5e829bb579d39c77a59618a30c4503c0dad4c84d4314f62617df51';

        const mockUserData: UserData = {
            userId,
            fiscalCode,
            passwordHash: correctPasswordHash,
            name: 'Mario',
            lastName: 'Rossi',
            dateOfBirth: new Date('1980-01-01'),
        };

        const mockPatientData: PatientData = {
            userId,
            activeDelegationIds: [],
        };

        it('should authenticate patient-only user with correct credentials', async () => {
            mockUserRepository.findByFiscalCode.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(mockPatientData);
            mockDoctorRepository.findByUserId.mockResolvedValue(null);

            const result = await authService.login(fiscalCode, correctPassword);

            expect(result).toBeInstanceOf(PatientOnlyUser);
            expect(result.user.userId).toBe(userId);
            expect(result.user.fiscalCode.value).toBe(fiscalCode);
            expect(result.activeProfile).toBe('PATIENT');
            expect(result.hasDoctorProfile).toBe(false);
        });

        it('should authenticate doctor-patient user with correct credentials', async () => {
            const mockDoctorData: DoctorData = {
                userId,
                medicalLicenseNumber: 'ML123456',
                specializations: ['Cardiologia'],
                assignedPatientUserIds: [],
            };

            mockUserRepository.findByFiscalCode.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(mockPatientData);
            mockDoctorRepository.findByUserId.mockResolvedValue(mockDoctorData);

            const result = await authService.login(fiscalCode, correctPassword);

            expect(result).toBeInstanceOf(DoctorPatientUser);
            expect(result.user.userId).toBe(userId);
            expect(result.hasDoctorProfile).toBe(true);
            expect(result.activeProfile).toBe('PATIENT'); // Default profile
        });

        it('should throw error for non-existent user', async () => {
            mockUserRepository.findByFiscalCode.mockResolvedValue(null);

            await expect(authService.login(fiscalCode, correctPassword)).rejects.toThrow(
                'Invalid credentials'
            );

            expect(mockPatientRepository.findByUserId).not.toHaveBeenCalled();
            expect(mockDoctorRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should throw error for wrong password', async () => {
            mockUserRepository.findByFiscalCode.mockResolvedValue(mockUserData);

            await expect(authService.login(fiscalCode, wrongPassword)).rejects.toThrow(
                'Invalid credentials'
            );

            expect(mockPatientRepository.findByUserId).not.toHaveBeenCalled();
            expect(mockDoctorRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should throw error if patient profile not found', async () => {
            mockUserRepository.findByFiscalCode.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(null);

            await expect(authService.login(fiscalCode, correctPassword)).rejects.toThrow(
                'Patient profile not found. Data integrity issue.'
            );
        });
    });

    describe('getProfileData', () => {
        const userId = randomUUID();
        const mockUserData: UserData = {
            userId,
            fiscalCode: 'RSSMRA80A01H501U',
            passwordHash: 'hashedPassword',
            name: 'Mario',
            lastName: 'Rossi',
            dateOfBirth: new Date('1980-01-01'),
        };

        const mockPatientData: PatientData = {
            userId,
            activeDelegationIds: ['delegation1', 'delegation2'],
        };

        it('should return patient profile data when PATIENT is selected', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(mockPatientData);
            mockDoctorRepository.findByUserId.mockResolvedValue(null);

            const result = await authService.getProfileData(userId, 'PATIENT');

            expect(result).toEqual({
                userId,
                fiscalCode: 'RSSMRA80A01H501U',
                name: 'Mario',
                lastName: 'Rossi',
                dateOfBirth: new Date('1980-01-01'),
                activeProfile: 'PATIENT',
                patient: {
                    userId,
                    activeDelegationIds: ['delegation1', 'delegation2'],
                },
            });
        });

        it('should return doctor profile data when DOCTOR is selected', async () => {
            const mockDoctorData: DoctorData = {
                userId,
                medicalLicenseNumber: 'ML123456',
                specializations: ['Cardiologia', 'Medicina Interna'],
                assignedPatientUserIds: ['patient1', 'patient2'],
            };

            mockUserRepository.findById.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(mockPatientData);
            mockDoctorRepository.findByUserId.mockResolvedValue(mockDoctorData);

            const result = await authService.getProfileData(userId, 'DOCTOR');

            expect(result).toEqual({
                userId,
                fiscalCode: 'RSSMRA80A01H501U',
                name: 'Mario',
                lastName: 'Rossi',
                dateOfBirth: new Date('1980-01-01'),
                activeProfile: 'DOCTOR',
                doctor: {
                    userId,
                    medicalLicenseNumber: 'ML123456',
                    specializations: ['Cardiologia', 'Medicina Interna'],
                    assignedPatientUserIds: ['patient1', 'patient2'],
                },
            });
        });

        it('should throw error if user not found', async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(authService.getProfileData(userId, 'PATIENT')).rejects.toThrow(
                'User not found'
            );

            expect(mockPatientRepository.findByUserId).not.toHaveBeenCalled();
            expect(mockDoctorRepository.findByUserId).not.toHaveBeenCalled();
        });

        it('should throw error if patient profile not found', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(null);

            await expect(authService.getProfileData(userId, 'PATIENT')).rejects.toThrow(
                'Patient profile not found. Data integrity issue.'
            );
        });

        it('should throw error when DOCTOR profile selected but user has no doctor profile', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(mockPatientData);
            mockDoctorRepository.findByUserId.mockResolvedValue(null);

            await expect(authService.getProfileData(userId, 'DOCTOR')).rejects.toThrow(
                'User does not have doctor profile'
            );
        });

        it('should call repositories with correct userId', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUserData);
            mockPatientRepository.findByUserId.mockResolvedValue(mockPatientData);
            mockDoctorRepository.findByUserId.mockResolvedValue(null);

            await authService.getProfileData(userId, 'PATIENT');

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockPatientRepository.findByUserId).toHaveBeenCalledWith(userId);
            expect(mockDoctorRepository.findByUserId).toHaveBeenCalledWith(userId);
        });
    });
});