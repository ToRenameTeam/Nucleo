### Features


- sanitize inputs using zod (6540fc3)
- trasform cantegory field into service categories list (1d51bcf)
- add .env example file (2bb5c75)
- API for medicines (0c52a11)
- database schema and seed for medicines (4c14877)
- API for facilities (f7f1b7b)
- database schema and seed for facility (acfa506)
- API for service catalog (10be54a)
- database schema and seed for serviceType (e492ec2)
- create master data microservice skeleton (df4d1d5)

### Fixes


- linting (e0b4c4a)
- shorter ts imports (e5599d1)
- required isActive boolean flag in medicine service test (149e38a)
- support custom string _id without TypeScript conflicts (e77d01a)
- mongo db internal port (23456bf)

### Other


- chore: script for running coverage tests with jest (0bff983)
- ci: remove useless docker start (7c82129)
- ci: add integration tests (8e039bd)
- test: add integration tests with testcontainers (5944d29)
- test: remove mongodb in-memory and use mocks instead (955f26c)
- refactor: users and master data services (f1b6d93)
- refactor: prettify js, ts, json, yaml, css and vue files (6c86380)
- refactor: prettify ts files (de1cff3)
- refactor: centralize node dependencies (df7590b)
- refactor: master data repositories (e728837)
- refactor: master data services and routes (f4d9201)
- refactor: resource code validation in master data (0bc792e)
- refactor: add repository layer to master data service (ae2edfc)
- refactor: barrels (35c2c1f)
- test: all services (bb5ac75)
- chore: merge branch dev into feat/documents (0b343c6)

### Features


- sanitize inputs using zod (ce11cbe)
- add seed data for users and delegations (66d5e87)
- add API to retrieve all delegations (bab7405)
- prevent self-delegation in delegation API (57ebc03)
- add search user by fiscal code (aae163a)
- add express server with middleware and routes (303f540)
- add Delegation APIs (68f6de0)
- add DelegationService with tests (75afc89)
- add Delegation model with repository implementation (3891f0e)
- add Delegation and DelegationStatus domain model and tests (b556f2e)
- add utility functions for UUID validation and conversion (9dc4fa9)
- add User models with repositories implementation (26a9813)
- add authentication and user APIs (1739a87)
- AuthenticationService and AuthenticatedUserFactory with tests (d31a2dc)
- implement UserService management (fcd0305)
- add users domain model (c3ee633)

### Fixes


- missing dotenv dependency (d8bcf3f)
- shorter ts imports (e5599d1)
- doctor id (b3486e4)
- patient data field name (a17a809)
- remove invalid delegation entry seed (35b60e8)
- mongo db internal port (23456bf)
- correct user validation logic for accepting delegation (d825888)

### Other


- chore: script for running coverage tests with jest (0bff983)
- ci: add integration tests (b4f3d3c)
- test: add integration tests with testcontainers (28e6959)
- chore: eslint on microservices ts files only (3677ed3)
- refactor: remove "I" prefix from repository interface names (9a0b8ed)
- refactor: users and master data services (f1b6d93)
- refactor: prettify js, ts, json, yaml, css and vue files (6c86380)
- refactor: prettify ts files (de1cff3)
- refactor: centralize node dependencies (df7590b)
- refactor: uniform backend services dockerfiles (99faa8b)
- refactor: user service (4afeab9)
- refactor: change schemas file names (cd705d4)
- refactor: barrels (35c2c1f)
- refactor: user service structure (89d5759)
- refactor: update seeds (bc5ca73)
- chore: merge branch dev into feat/documents (0b343c6)
- refactor: rename findById to findUserById in IUserRepository and update references (d692e92)
- test: add unit tests for UserService (a9e6e1e)
- test: add users domain model unit test (774ddaf)
- chore: add user services dependecies (76d26e3)
- chore: dockerize users (f418583)
- chore: add prettier dependency and configuration (033a3fe)
- chore: add src and tests folders in users service (eadfc73)
- chore: add typescript dependencies and configuration (cb90955)
- chore: init pnpm workspace (6336eff)
