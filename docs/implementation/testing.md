# Testing

Nucleo testing is organized by service runtime (Kotlin and Node.js) and by test level (unit and integration).

## Unit Testing

### Kotlin services

Kotlin microservices (`appointments-service`, `documents-service`) use Kotest with JUnit 5.

Unit tests target application and domain behavior, typically wiring services with in-memory or fake repositories from the `fixtures` package.

Example from `appointments-service`:

Source: `appointments-service/src/test/kotlin/it/nucleo/appointments/application/AppointmentServiceTest.kt` (`AppointmentServiceTest`).

```kotlin
class AppointmentServiceTest :
	DescribeSpec({
		fun createService(
			appointmentRepo: AppointmentRepository = FakeAppointmentRepository(),
			availabilityRepo: AvailabilityRepository = FakeAvailabilityRepository(),
		) = AppointmentService(appointmentRepo, availabilityRepo)

		describe("createAppointment") {
			it("should create an appointment when the availability is available") {
				val service = createService()
				val result =
					service.createAppointment(
						patientId = AppointmentFixtures.PATIENT_ID,
						availabilityId = AppointmentFixtures.AVAILABILITY_ID,
					)

				result.shouldBeInstanceOf<Either.Right<Appointment>>()
			}
		}
	})
```

`documents-service` follows the same approach, using fake repositories to validate business rules such as PDF validation and document lifecycle management.

### Node.js services

Node.js microservices (`users-service`, `master-data-service`) use Jest with `ts-jest`.

Unit tests target service behavior by mocking repository interfaces with `jest.fn()` and asserting success, validation, and conflict scenarios.

Example pattern:

Source: `master-data-service/tests/services/service-catalog.service.test.ts`.

```ts
let mockRepository: jest.Mocked<ServiceTypeRepository>;

beforeEach(() => {
  mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
    softDelete: jest.fn(),
    permanentDelete: jest.fn(),
  } as jest.Mocked<ServiceTypeRepository>;
});
```

## Integration Testing

Integration tests validate end-to-end API flows and interaction with real infrastructure dependencies.

### Kotlin integration tests

Kotlin services use Ktor with Testcontainers to run integration tests. Services define a dedicated `integrationTest` Gradle task in shared build logic.

The task filters tests with names like `*IntegrationTest` and executes them separately from unit tests.

External dependencies are provisioned with Testcontainers:

- `appointments-service`: PostgreSQL container.
- `documents-service`: MongoDB + MinIO containers.

Container support objects manage startup, state reset between tests, and cleanup.

Example (`PostgresContainerSupport`):

Source: `appointments-service/src/test/kotlin/it/nucleo/appointments/integration/support/PostgresContainerSupport.kt` (`PostgresContainerSupport`).

```kotlin
object PostgresContainerSupport {
	private val container =
		PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine"))

	fun start() {
		container.start()
		System.setProperty("DATABASE_URL", container.jdbcUrl)
		DatabaseFactory.init()
	}

	fun resetDatabase() {
		transaction {
			AppointmentsTable.deleteAll()
			AvailabilitiesTable.deleteAll()
		}
	}
}
```

Integration specs execute realistic scenarios (create, update, delete, filtering) through the HTTP API and real persistence.

### Node.js integration tests

Node services use Express with Testcontainers to run integration tests with Jest. The test setup spins up a real MongoDB container and starts each service on an ephemeral port.

Typical lifecycle:

1. Start MongoDB container
2. Boot service with test configuration
3. Reset database before each test (`dropDatabase`)
4. Stop service and container after all tests

Example container utility:

Source: `users-service/tests/integration/test-container.ts` (`startMongoTestContainer`).

```ts
export async function startMongoTestContainer(): Promise<MongoTestContainerContext> {
  const container = await new GenericContainer('mongo:7.0')
	.withExposedPorts(27017)
	.withWaitStrategy(Wait.forLogMessage('Waiting for connections'))
	.start();

  const mongoUri = `mongodb://${container.getHost()}:${container.getMappedPort(27017)}/users_integration_test`;
  return { container, mongoUri };
}
```

These tests verify end-to-end API behavior (health endpoints, CRUD flows, filtering, error handling, and auth-protected routes).

## Coverage and Quality Gates

Coverage is generated per runtime and uploaded to Codecov:

- Kotlin: Kover XML reports.
- Node.js: Jest coverage reports.

Kotlin coverage excludes infrastructure packages in shared build logic, since those paths are primarily validated through integration tests.

In CI (`.github/workflows/test.yaml`), each service includes:

- a unit test execution step;
- a dedicated integration test step;
- coverage generation in a final aggregation job.

## Current Scope and Next Steps

Automated testing currently focuses on backend services.

- Frontend end-to-end tests are not part of the standard pipeline.
- `ai-service` currently includes linting/format checks but no dedicated automated test suite.
- Architecture rules are enforced through project structure and static analysis rather than dedicated architecture-test classes.

Planned evolution includes architecture-specific assertions and end-to-end user journey tests.
