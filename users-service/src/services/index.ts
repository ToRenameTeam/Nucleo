import { UserService } from './UserService.js';
import { AuthenticationService } from '../services/AuthenticationService.js';
import { DelegationService } from './DelegationService.js';
import { UserRepositoryImpl } from '../infrastructure/repositories/implementations/UserRepositoryImpl.js';
import { PatientRepositoryImpl } from '../infrastructure/repositories/implementations/PatientRepositoryImpl.js';
import { DoctorRepositoryImpl } from '../infrastructure/repositories/implementations/DoctorRepositoryImpl.js';
import { DelegationRepositoryImpl } from '../infrastructure/repositories/implementations/DelegationRepositoryImpl.js';

class ServiceContainer {
    private static instance: ServiceContainer;

    private readonly userRepository = new UserRepositoryImpl();
    private readonly patientRepository = new PatientRepositoryImpl();
    private readonly doctorRepository = new DoctorRepositoryImpl();
    private readonly delegationRepository = new DelegationRepositoryImpl();

    private readonly _userService: UserService;
    private readonly _authService: AuthenticationService;
    private readonly _delegationService: DelegationService;

    private constructor() {
        this._userService = new UserService(
            this.userRepository,
            this.patientRepository,
            this.doctorRepository
        );

        this._authService = new AuthenticationService(
            this.userRepository,
            this.patientRepository,
            this.doctorRepository
        );

        this._delegationService = new DelegationService(
            this.delegationRepository,
            this.patientRepository,
        );
    }

    public static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    // Service getters
    get userService(): UserService {
        return this._userService;
    }

    get authService(): AuthenticationService {
        return this._authService;
    }

    get delegationService(): DelegationService {
        return this._delegationService;
    }
}

export const container = ServiceContainer.getInstance();
export const userService = container.userService;
export const delegationService = container.delegationService;
