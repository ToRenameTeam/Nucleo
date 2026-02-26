import { UserService } from './user.service.js';
import { AuthenticationService } from './authentication.service.js';
import { DelegationService } from './delegation.service.js';
import { UserRepositoryImpl } from '../infrastructure/repositories/implementations/UserRepositoryImpl.js';
import { PatientRepositoryImpl } from '../infrastructure/repositories/implementations/PatientRepositoryImpl.js';
import { DoctorRepositoryImpl } from '../infrastructure/repositories/implementations/DoctorRepositoryImpl.js';
import { DelegationRepositoryImpl } from '../infrastructure/repositories/implementations/DelegationRepositoryImpl.js';

const userRepository = new UserRepositoryImpl();
const patientRepository = new PatientRepositoryImpl();
const doctorRepository = new DoctorRepositoryImpl();
const delegationRepository = new DelegationRepositoryImpl();

export const userService = new UserService(
    userRepository,
    patientRepository,
    doctorRepository
);

export const authenticationService = new AuthenticationService(
    userRepository,
    patientRepository,
    doctorRepository
);

export const delegationService = new DelegationService(
    delegationRepository,
    patientRepository
);

export { UserService } from './user.service.js';
export { AuthenticationService } from './authentication.service.js';
export { DelegationService } from './delegation.service.js';
export {
    AuthenticatedUserFactory,
    PatientOnlyUser,
    DoctorPatientUser,
    type ActiveProfile,
    type IAuthenticatedUser
} from './authenticated-user.factory.js';
