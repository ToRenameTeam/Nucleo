# Quality Assurance

The project QA targets the following areas: code style, static analysis, testing, and code coverage.

## Code Style & Static Analysis

Each runtime has dedicated tooling for formatting and static analysis, all enforced automatically in both the pre-commit hook and the CI pipeline.

- **Kotlin**: formatted with [ktfmt](https://github.com/facebook/ktfmt) and statically analyzed with [Detekt](https://detekt.dev/), applied to `appointments-service` and `documents-service`.
- **Node.js**: formatted with [Prettier](https://prettier.io/) and linted with [ESLint](https://eslint.org/), applied to `users-service`, `master-data-service`, and `frontend-service`.
- **Python**: formatted and linted with [Ruff](https://docs.astral.sh/ruff/) in `ai-service`.

## Testing

### Unit Testing

Kotlin services use [Kotest](https://kotest.io/) as the testing framework, including its built-in mocking utilities for isolating dependencies. Node.js services use [Jest](https://jestjs.io/) for unit tests and mocking.

### Integration Testing

All microservices use [Testcontainers](https://testcontainers.com/) for integration tests, which spins up real, throwaway instances of external dependencies (databases, message brokers, etc.) for the duration of the test run, ensuring that each service is tested against a realistic environment without requiring a permanently running infrastructure.

## Code Coverage

Coverage is collected for all services and uploaded to [Codecov](https://codecov.io/). Kotlin services use [Kover](https://github.com/Kotlin/kotlinx-kover), with infrastructure layer packages excluded from metrics as they are better validated by integration tests. Node.js services use the built-in Jest coverage reporter. The full report is available at [Codecov](https://app.codecov.io/gh/ToRenameTeam/Nucleo/tree/dev).

## Quality Control

Quality control is enforced at two levels: locally before each commit, and in the CI pipeline on every push and pull request.

[Husky](https://typicode.github.io/husky/) runs [lint-staged](https://github.com/lint-staged/lint-staged) on every commit attempt, processing only the staged files to keep the hook fast. JavaScript, TypeScript, JSON, and CSS files are automatically formatted with Prettier, while Kotlin files are processed by a custom script (`scripts/ktfmt-staged.sh`) that invokes ktfmt on staged `.kt` files.

The full quality control suite runs in the CI pipeline, described in detail in the next section.