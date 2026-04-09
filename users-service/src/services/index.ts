import { UserService } from './user.service.js';
import { AuthenticationService } from './authentication.service.js';
import { DelegationService } from './delegation.service.js';
import { NotificationService } from './notification.service.js';
import { UserEventsPublisher } from '../infrastructure/kafka/user-events.publisher.js';
import { NotificationEventsPublisher } from '../infrastructure/kafka/notification-events.publisher.js';
import { NotificationEventsConsumer } from '../infrastructure/kafka/notification-events.consumer.js';
import {
  UserRepositoryImpl,
  PatientRepositoryImpl,
  DoctorRepositoryImpl,
  DelegationRepositoryImpl,
  NotificationRepositoryImpl,
} from '../infrastructure/repositories/implementations/index.js';

function createRepositoryDependencies() {
  return {
    userRepository: new UserRepositoryImpl(),
    patientRepository: new PatientRepositoryImpl(),
    doctorRepository: new DoctorRepositoryImpl(),
    delegationRepository: new DelegationRepositoryImpl(),
    notificationRepository: new NotificationRepositoryImpl(),
  };
}

function createServiceDependencies() {
  const {
    userRepository,
    patientRepository,
    doctorRepository,
    delegationRepository,
    notificationRepository,
  } = createRepositoryDependencies();
  const userEventsPublisher = new UserEventsPublisher();
  const notificationEventsPublisher = new NotificationEventsPublisher();
  const notificationService = new NotificationService(notificationRepository);
  const notificationEventsConsumer = new NotificationEventsConsumer(notificationService);

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
    delegationService: new DelegationService(
      delegationRepository,
      patientRepository,
      notificationEventsPublisher
    ),
    notificationService,
    userEventsPublisher,
    notificationEventsPublisher,
    notificationEventsConsumer,
  };
}

const services = createServiceDependencies();

export const userService = services.userService;
export const authenticationService = services.authenticationService;
export const delegationService = services.delegationService;
export const notificationService = services.notificationService;
export const userEventsPublisher = services.userEventsPublisher;
export const notificationEventsPublisher = services.notificationEventsPublisher;
export const notificationEventsConsumer = services.notificationEventsConsumer;

export { UserService } from './user.service.js';
export { AuthenticationService } from './authentication.service.js';
export { DelegationService } from './delegation.service.js';
export { NotificationService, type NotificationEventPayload } from './notification.service.js';
export {
  AuthenticatedUserFactory,
  PatientOnlyUser,
  DoctorPatientUser,
  type ActiveProfile,
  type IAuthenticatedUser,
} from './authenticated-user.factory.js';
