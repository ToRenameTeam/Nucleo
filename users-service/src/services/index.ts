import { UserService } from './user.service.js';
import { AuthenticationService } from './authentication.service.js';
import { DelegationService } from './delegation.service.js';
import { UserEventsPublisher } from '../infrastructure/kafka/user-events.publisher.js';
import {
  UserRepositoryImpl,
  PatientRepositoryImpl,
  DoctorRepositoryImpl,
  DelegationRepositoryImpl,
} from '../infrastructure/repositories/implementations/index.js';

function createRepositoryDependencies() {
  return {
    userRepository: new UserRepositoryImpl(),
    patientRepository: new PatientRepositoryImpl(),
    doctorRepository: new DoctorRepositoryImpl(),
    delegationRepository: new DelegationRepositoryImpl(),
  };
}

function createServiceDependencies() {
  const { userRepository, patientRepository, doctorRepository, delegationRepository } =
    createRepositoryDependencies();
  const userEventsPublisher = new UserEventsPublisher();

  return {
    userService: new UserService(
      userRepository,
      patientRepository,
      doctorRepository,
      userEventsPublisher
    ),
    authenticationService: new AuthenticationService(
      userRepository,
      patientRepository,
      doctorRepository
    ),
    delegationService: new DelegationService(delegationRepository, patientRepository),
    userEventsPublisher,
  };
}

const services = createServiceDependencies();

export const userService = services.userService;
export const authenticationService = services.authenticationService;
export const delegationService = services.delegationService;
export const userEventsPublisher = services.userEventsPublisher;

export { UserService } from './user.service.js';
export { AuthenticationService } from './authentication.service.js';
export { DelegationService } from './delegation.service.js';
export {
  AuthenticatedUserFactory,
  PatientOnlyUser,
  DoctorPatientUser,
  type ActiveProfile,
  type IAuthenticatedUser,
} from './authenticated-user.factory.js';
