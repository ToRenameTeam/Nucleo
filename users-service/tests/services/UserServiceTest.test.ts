import { UserService } from '../../src/services/UserService.js';
import { IUserRepository, UserData } from '../../src/infrastructure/repositories/IUserRepository.js';
import { IPatientRepository, PatientData } from '../../src/infrastructure/repositories/IPatientRepository.js';
import { IDoctorRepository, DoctorData } from '../../src/infrastructure/repositories/IDoctorRepository.js';
import { randomUUID } from 'crypto';

describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockPatientRepository: jest.Mocked<IPatientRepository>;
    let mockDoctorRepository: jest.Mocked<IDoctorRepository>;

    const validUserData = {
        fiscalCode: 'RSSMRA80A01H501U',
        password: 'TestPassword123!',
        name: 'Mario',
        lastName: 'Rossi',
        dateOfBirth: '1980-01-01',
    };

    beforeEach(() => {
        mockUserRepository = {
            findByFiscalCode: jest.fn(),
            findUserById: jest.fn(),
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

        userService = new UserService(
            mockUserRepository,
            mockPatientRepository,
            mockDoctorRepository
        );

        mockUserRepository.findByFiscalCode.mockResolvedValue(null);
        mockUserRepository.create.mockResolvedValue(undefined);
        mockPatientRepository.save.mockResolvedValue(undefined);
        mockDoctorRepository.save.mockResolvedValue(undefined);
    });

    describe('createUser', () => {
        it('should create a user with patient profile', async () => {
            const result = await userService.createUser(validUserData);

            expect(result).toMatchObject({
                fiscalCode: validUserData.fiscalCode,
                name: validUserData.name,
                lastName: validUserData.lastName,
                dateOfBirth: validUserData.dateOfBirth,
                doctor: undefined,
            });
            expect(result.userId).toBeDefined();
        });

        it('should create user with doctor profile', async () => {
            const userDataWithDoctor = {
                ...validUserData,
                doctor: {
                    medicalLicenseNumber: 'ML123456',
                    specializations: ['Cardiologia'],
                },
            };

            const result = await userService.createUser(userDataWithDoctor);

            expect(result.doctor).toEqual({
                medicalLicenseNumber: 'ML123456',
                specializations: ['Cardiologia'],
            });
        });

        it('should throw error if user already exists', async () => {
            mockUserRepository.findByFiscalCode.mockResolvedValue({
                userId: randomUUID(),
                fiscalCode: validUserData.fiscalCode,
                passwordHash: 'hash',
                name: 'Existing',
                lastName: 'User',
                dateOfBirth: new Date('1980-01-01'),
            });

            await expect(userService.createUser(validUserData)).rejects.toThrow(
                'User with this fiscal code already exists'
            );
        });
    });

    describe('getUserById', () => {
        const userId = randomUUID();

        it('should return user with patient and doctor profiles', async () => {
            mockUserRepository.findUserById.mockResolvedValue({
                userId,
                fiscalCode: 'RSSMRA80A01H501U',
                passwordHash: 'hash',
                name: 'Mario',
                lastName: 'Rossi',
                dateOfBirth: new Date('1980-01-01'),
            });

            mockPatientRepository.findByUserId.mockResolvedValue({
                userId,
                activeDelegationIds: ['delegation1'],
            });

            mockDoctorRepository.findByUserId.mockResolvedValue({
                userId,
                medicalLicenseNumber: 'ML123456',
                specializations: ['Cardiologia'],
                assignedPatientUserIds: [],
            });

            const result = await userService.getUserById(userId);

            expect(result).toMatchObject({
                userId,
                fiscalCode: 'RSSMRA80A01H501U',
                name: 'Mario',
                lastName: 'Rossi',
                patientData: {
                    activeDelegationIds: ['delegation1'],
                },
                doctor: {
                    medicalLicenseNumber: 'ML123456',
                    specializations: ['Cardiologia'],
                },
            });
        });

        it('should throw error if user not found', async () => {
            mockUserRepository.findUserById.mockResolvedValue(null);

            await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
        });
    });

    describe('listUsers', () => {
        it('should return empty list when no users exist', async () => {
            mockUserRepository.findAll.mockResolvedValue({ users: [] });

            const result = await userService.listUsers();

            expect(result).toEqual({ users: [] });
        });

        it('should return list of users with profiles', async () => {
            const user1Id = randomUUID();
            const user2Id = randomUUID();

            mockUserRepository.findAll.mockResolvedValue({
                users: [
                    {
                        userId: user1Id,
                        fiscalCode: 'RSSMRA80A01H501U',
                        passwordHash: 'hash1',
                        name: 'Mario',
                        lastName: 'Rossi',
                        dateOfBirth: new Date('1980-01-01'),
                    },
                    {
                        userId: user2Id,
                        fiscalCode: 'VRDLGI85M15H501Z',
                        passwordHash: 'hash2',
                        name: 'Luigi',
                        lastName: 'Verdi',
                        dateOfBirth: new Date('1985-08-15'),
                    },
                ],
            });

            mockPatientRepository.findByUserId.mockResolvedValue({
                userId: user1Id,
                activeDelegationIds: [],
            });

            mockDoctorRepository.findByUserId
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({
                    userId: user2Id,
                    medicalLicenseNumber: 'ML123456',
                    specializations: ['Cardiologia'],
                    assignedPatientUserIds: [],
                });

            const result = await userService.listUsers();

            expect(result.users).toHaveLength(2);
            expect(result.users[0]?.fiscalCode).toBe('RSSMRA80A01H501U');
            expect(result.users[0]?.patientData).toEqual({
                activeDelegationIds: [],
            });
            expect(result.users[1]?.doctor).toEqual({
                medicalLicenseNumber: 'ML123456',
                specializations: ['Cardiologia'],
            });
        });
    });
});