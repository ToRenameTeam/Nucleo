### Features


- add authorization layer (f4cd921)
- publish notification event on user topic (5b1baf1)
- delete user, facility and service type event consumer (7773a56)
- service in master data deleted topics (e62ea1c)
- set up consumer groups and user deleted topic (d8c17e7)

### Fixes


- align doctor availabilities with correct service types and specializations (2d36028)
- exception handling (157d582)
- format (85bf21c)

### Other


- chore: add k8s and helm files to .prettierignore and remove helm-values readme (ce8e236)
- chore: helm charts for microservices and databases (61e32d0)
- chore: rename ktor custom plugin to nucleo-services and add kafka client dependency (6e6b820)

### Features


- add access token to backend api calls (26d2dea)
- filter service type for doctors specialization (baed27d)
- refresh document page on document creation (d41332b)
- add patient/doctor name into document card (e244161)
- notifications UI (5f592d5)
- message for empty document list (9c01b08)

### Fixes


- book visit button layout (bc6240f)
- specializations format (d1611c1)
- sent and received delegations visualization (5bfc4f7)
- fiscal code placeholder (25ef402)
- service prescription (9258649)
- add missing labels (42edd69)

### Other


- chore: merge branch 'feat/notifications' into dev (1dc7d9f)
- chore: add k8s and helm files to .prettierignore and remove helm-values readme (ce8e236)
- chore: helm charts for microservices and databases (61e32d0)

### Features


- add authorization layer (ce45e1a)
- publish delete data event (9fedb1c)
- service in master data deleted topics (e62ea1c)

### Other


- chore: merge branch 'main' into dev (37d8c4b)
- test: add exclusions to coverage for node services (9f37d0c)
- chore: merge branch 'feat/notifications' into dev (1dc7d9f)
- chore: add k8s and helm files to .prettierignore and remove helm-values readme (ce8e236)
- chore: helm charts for microservices and databases (61e32d0)
- chore: add kafka dependency to node services (1829e28)

### Features


- add authorization module (ca8066f)
- add nginx configuration for notifications api (78dda5e)
- notification routes and configurations (1726edb)
- notification events handling (0b8a8ef)
- add topic for notifications (6bb367d)
- delete user and publish delete event (770f4bb)
- set up consumer groups and user deleted topic (d8c17e7)

### Other


- chore: merge branch 'main' into dev (37d8c4b)
- test: add exclusions to coverage for node services (9f37d0c)
- chore: merge branch 'feat/notifications' into dev (1dc7d9f)
- test: notifications (629363c)
- chore: add k8s and helm files to .prettierignore and remove helm-values readme (ce8e236)
- chore: helm charts for microservices and databases (61e32d0)
- chore: add kafka dependency to node services (1829e28)

### Breaking Changes


- use type discriminator instead of _t at api level (ca81413)
- fetch doctor's documents (42e025d)

### Features


- remove SSE logic (4eadf19)
- setup SSE for document upload (ce7ec8c)
- document title (27d3d37)
- CORS configuration (4bb1232)
- do not store pdf if document is not medical-related (20bf066)
- update REST API to support uploaded document entity (ac0be3e)
- add dtos for uploaded document entity (3b83569)
- add upload document entity (fcdcc63)
- AI analysis on medical document creation (42725b3)
- add AI service (dc02685)
- remove file URI from document entity (8434c6a)
- generate and store pdf file on medical document creation (23652cb)
- reference stored pdf by document id (4748a67)
- download document endpoint (b05d26c)
- download document from minio (0b1c81d)
- document upload endpoint (e161a6f)
- add file upload api dtos (dd7f555)
- add minio file storage service (8de0d10)
- add and configure minio client (b0d8290)
- add logging (15bf6e3)
- add base rest endpoints with implementation (17cbe21)
- mongo medical record repository (c6d1125)
- database dtos and mappers (f41f298)
- add mongodb factory (79e0714)
- medical report repository interface (b6139e7)
- documents factory (a1a7ea6)
- super basic medical record (09b19fa)
- report entity (b818533)
- service prescription value objects (e2685b4)
- medicine prescription value objects (3212c5a)
- add document common interface (38941a2)

### Fixes


- rest api routes format (a36afde)
- bad request exception for malformed json strings (299df04)
- bson serialization with polymorphic types (39426c1)
- kotlinx-serialization dependency (518629d)

### Other


- ci: use separate task for running integration tests in kt services (d1c014b)
- test: integration tests with testcontainers (9ab56f3)
- refactor: fix linting errors (92a85ed)
- chore: softer detekt settings (dc00e6d)
- chore: add detekt kotlin linter (09713d2)
- chore: setup kover (c569c71)
- refactor: value objects validation with smart constructor in kt ms (bc8fe7b)
- refactor: prettify js, ts, json, yaml, css and vue files (6c86380)
- chore: add commons to dockerfiles (b6e2d46)
- refactor: create commons module for shared code among kotlin microservices (d458fa6)
- test: new tests with mocks (3b9d8ec)
- refactor: uniform package structure (bef8db4)
- refactor: remove pass-through command objs (626ae6a)
- refactor: kotlin services entrypoint file (798c1ef)
- refactor: re-organize REST API routes in Kotlin services (821558a)
- refactor: handle errors as values in appointments and documents service (ec3146a)
- refactor: remove seed script (b3395e6)
- refactor: uniform backend services dockerfiles (99faa8b)
- refactor: update seeds (bc5ca73)
- chore: change service port to avoid conflicts (ac8e1c2)
- chore: merge branch dev into feat/documents (0b343c6)
- chore: uniform docker compose file extension (94d9b00)
- refactor: format code with ktfmt (60291bd)
- chore: update .gitignore and remove old main.py (ddce30e)
- chore: add .env sample files (22031be)
- chore: change mongodb exposed port (720939e)
- test: download document test (f924a1c)
- test: upload document test (95c16c8)
- test: add minio to testing (1a6e4cf)
- chore: add sample pdf file for testing (8a43305)
- refactor: move file storage endpoints logic into services (a57f5e0)
- chore: add minio dependency (95e6a3d)
- chore: init AI service python project (a4147a9)
- chore: add minio instance for file storage (9f96ae8)
- refactor: move endpoints logic into service (4ebc450)
- refactor: rename repository and move files (d74e6f1)
- refactor: remove medical record aggregate root (f504d7b)
- refactor: format code with ktfmt (540a061)
- refactor: split dtos from mappers (c0147c1)
- test: add rest endpoints tests (7d5c4bd)
- test: add document fixtures (0b9ff1d)
- test: setup tests (ce796d5)
- chore: add mongodb driver and json serialization dependencies (fa7e25b)
- chore: add mongodb instance (c9d9365)
- refactor: move medicine and service prescription to implementation package (609f3ed)
- chore: dockerize application (02c8445)
- chore: add ktor dependencies (4698510)
- chore: init documents service (ebb9f43)
- chore: add kotest dependency to kotlin-base plugin (e27cd7a)
- chore: add ktfmt to kotlin-base custom plugin (dc07828)
- chore: configure build-logic for shared custom gradle plugins (59fea61)
- chore: init (e60d783)

### Features


- remove unused (33ff523)
- appointment detail API (edde4b1)
- configure CORS to allow all hosts for development (dc6e374)
- delete appointment (2b892b6)
- update appointment (d543792)
- filtered appointments and appointments by id (543b270)
- create and findAll appointments (38e864d)
- create appointments value objects (74b5dbd)
- appointments database schema and seed (604e415)
- check availabilities overlaps (194ac7d)
- availability update and (soft) delete (2cd8891)
- filtered availability (b1ef679)
- add logging configurations (97001ef)
- create health, insert and findAll API (b242c1c)
- create value objects (ba75b94)
- create availability table in database (a998833)

### Fixes


- rest api routes format (a36afde)
- filter appointments by doctor (b6c9ded)
- kotlinx-serialization dependency (518629d)
- availability uuid (b8c832a)
- downgrade to kotlin 2.2.20 (13691d6)

### Other


- ci: use separate task for running integration tests in kt services (d1c014b)
- test: integration tests with testcontainers (73d3eb9)
- refactor: fix linting errors (92a85ed)
- chore: softer detekt settings (dc00e6d)
- chore: add detekt kotlin linter (09713d2)
- chore: setup kover (c569c71)
- refactor: value objects validation with smart constructor in kt ms (bc8fe7b)
- refactor: prettify js, ts, json, yaml, css and vue files (6c86380)
- chore: add commons to dockerfiles (b6e2d46)
- refactor: create commons module for shared code among kotlin microservices (d458fa6)
- chore: delete dummy test (29c400a)
- refactor: refactor tests to describe spec and centralize fixtures (ef62e71)
- refactor: remove pass-through command objs (626ae6a)
- refactor: kotlin services entrypoint file (798c1ef)
- refactor: re-organize REST API routes in Kotlin services (821558a)
- chore: update seed using current date (aec3c24)
- refactor: move value objs in aggregate files (5538617)
- refactor: move dto mappers to dto package (26d52a9)
- refactor: group api dtos (58cfff2)
- refactor: handle errors as values in appointments and documents service (ec3146a)
- refactor: uniform backend services dockerfiles (99faa8b)
- chore: change seed dates (e9624ff)
- refactor: update seeds (bc5ca73)
- chore: merge branch dev into feat/documents (0b343c6)
- refactor: remove appointment duplicated information from availability to prevent inconsistency (89466bf)
- chore: merge branch 'feat/appointments' into dev (32e61c4)
- refactor: move env variables to proper file (fb3d9db)
- refactor: format code with ktfmt (d50eae4)
- test: appointments (f06b748)
- test: availabilities (5d51aa7)
- test: add dependencies (49937fd)
- chore: move appointment logic into service (826a270)
- chore: move availability logic into service (cec719a)
- chore: rename repository classes (a38f4f1)
- chore: separate availability repository interface from its implementation (39f44ec)
- chore: format availabilities file (94bc225)
- chore: update .gitignore (82045d4)
- chore: add ktor dependency (48775c4)
- chore: add docker compose with database (fa06f98)
- chore: init documents service (ebb9f43)
- chore: add kotest dependency to kotlin-base plugin (e27cd7a)
- chore: add ktfmt to kotlin-base custom plugin (dc07828)
- chore: configure build-logic for shared custom gradle plugins (59fea61)
- chore: init appointments module (8961699)
- chore: init (e60d783)

### Breaking Changes


- use type discriminator instead of _t at api level (ca81413)

### Features


- nginx api gateway (a040f2a)
- sanitize inputs using zod (00a4ab9)
- remove SSE logic (4eadf19)
- upload report pdf document (doctor side) (da08897)
- format tag from AI (67cecd8)
- go to booking modal with preselected visit (c9d4aca)
- better booking modal (d7b981d)
- handle visit preselection (1890096)
- receive server-sent events when uploading document (2d36ff7)
- service prescription form (dfcb970)
- visit booking from homepage draft (5131993)
- add icon and colors for new enum entries badges (90af06b)
- create medicine prescription form (1a3e515)
- add loading spinner for appointments (803b6dd)
- next appointments (e9b8db8)
- patients page (eed557b)
- improve route navigation with profile-based access control (d580e62)
- add doctor settings page (5f2d21c)
- download documents (0bc21fb)
- improve ProfileViewModal and PatientChoice with additional profile data handling (10b8df1)
- upload medical documents (319c1a7)
- add ProfileViewModal component and integrate profile viewing functionality (ca2dd24)
- update patient appointment card content (0950b1f)
- reschedule appointment modal for patient (5b57dd3)
- remove from visualization tags with no content (7ca3712)
- add API integration for loading patient appointments (96b4490)
- add Medicine e Service prescript form (33188b7)
- add document button for completed appointments (fdb89b5)
- documents api config (fb4ea97)
- add DoctorDocumentsPage component (0abec05)
- implement doctor documents API (9d8825b)
- add getAllUsers API method to fetch all users (f335aa2)
- add documents API URL and update routing for DoctorDocumentsPage (45f2d76)
- add placeholder prop to SearchBar component (e9b7ce6)
- add action button for visit completed and patient no show (b284816)
- doctor appointment reschedule (4fb00a6)
- migrate action button into configurable CardActions (d001280)
- doctor availabilities page (222fca1)
- avaialbility modal component (39ac464)
- weekly calendar (91df3a2)
- availability API (50e90b1)
- retrieve user data for appointments (d6930b7)
- doctor appointments page (ec7172b)
- configure appointment api (5c7a46b)
- centralize appointment calendar (9bd7f6a)
- doctor bottombar (9311eb6)
- implement default dev user for development environment (0bc7822)
- refactor delegation handling (862f265)
- add delegation new request (0823759)
- add delegation management with modals (5cca065)
- add delegation get API inside patient choice view (fc644c5)
- add delegation get API inside patient choice view (bee905a)
- enhance routing with authentication checks (ff3677e)
- add doctor-patient choice and updated related components (74306ad)
- add authentication API (b58a78c)
- update routing and localization for patient choice flow (bd3015f)

### Fixes


- documents fetching (9d4da4c)
- rest api routes format (a36afde)
- master data contract (9ffff25)
- user in doctor's appointment card, past availabilities (1f45fa9)
- update subtitles in DelegationsMenuModal with dynamic counts (eda7b55)
- missing import (3f94996)
- date range filter, tagbar filters (d283270)
- enhance patient profile handling in calendar and documents pages (f291834)
- date filters, visible tag number, tagbar filters (5633dfc)
- remove action button from past appointments (d8d4cad)
- missing translations (97036b1)
- documents and appointments ordering (5333d66)
- calendar pin (7b3e270)
- last check on document upload (77ad5d9)
- patient (c576fb5)
- missing new badge colors in main theme (586de03)
- card badges (8821940)
- delete renamed availability modal (2706743)
- calendar page renamed (e28698d)
- improve error handling and response mapping in document retrieval functions (7f96ff6)
- update routing for doctor choice selection (d2ddc0f)
- possible undefined errors (edd0ac6)
- use appointment page as home page (e61ed40)
- possible undefined errors (fb6d19f)
- appointment user (145ff94)
- patient calendar page (16e29f2)

### Other


- refactor: remove doctorDocuments.ts (10ca566)
- refactor: linter and formatter (4d87107)
- refactor: prettify js, ts, json, yaml, css and vue files (6c86380)
- refactor: prettify ts files (de1cff3)
- refactor: migrate package manager from npm to pnpm (6e5fbf7)
- refactor: centralize node dependencies (df7590b)
- refactor: remove useless component (e5dd40a)
- chore: remove unused (7a43103)
- chore: remove unused (a31ff3a)
- chore: merge branch 'feat/frontend' into dev (335820c)
- chore: merge branch 'feat/frontend-patient' into dev (1a7551d)
- refactor: homepage booking modal (197fa6d)
- refactor: move availability slots into separate component (af179e2)
- chore: rename mockData (b3ed4b8)
- chore: change badge color (9897926)
- chore: merge branch 'dev' into feat/frontend-patient (92ab0ee)
- chore: merge branch 'feat/frontend' into feat/frontend-patient (f1f19a2)
- refactor: continue removing color blind mode functionality (9bfa9bc)
- refactor: remove color blind mode functionality from AppearanceSettings (5c5faae)
- refactor: update user menu icons and styles in TopBar component (ffadb9d)
- refactor: remove SearchBar component and related functionality (5eddbc4)
- chore: rename AvailabilityModal into ScheduleModal (b1c345c)
- chore: rename patient calendar page (635420e)
- chore: invert appointment ordering (61bf164)
- chore: merge branch 'feat/frontend' into dev (937a0c6)
- chore: remove mocked user, appointments and documents (5828737)
- refactor: remove duplicated code (242dc83)
- chore: merge branch 'feat/frontend' into dev (c07346e)
- refactor: refactor date parsing logic by importing utility function (988d42f)
- refactor: update document types to use AnyDocument for better type handling (1358ccd)
- chore: merge branch dev into feat/documents (0b343c6)
- refactor: remove unused import (17cfa3f)
- chore: remove default env variables values from example (1bbf200)
- chore: remove calendar day click TODO for now (c18076c)
- refactor: doctor appointment tabs (2691dd9)
- refactor: appointment detail API (6e5e916)
- refactor: remove unused imports (5dc3659)
- refactor: remove logs (e0bb439)
- refactor: action button design (c0a46f2)
- refactor: delete unused (d3aa4cf)
- chrore: merge branch 'feat/frontend-doctor' into feat/frontend (786214b)
- refactor: cards (fe8d47f)
- chore: merge branch 'feat/fronted-patient' into feat/frontend (4070003)
- refactor: clean up unused settings items (800733b)
- refactor: filter appointments by fiscal code (e1d6d5e)
- refactor: remove new appointment functionality from CalendarPage (cb5674f)
- refactor: remove share functionality from DocumentModal (ba8c017)
- refactor: remove barcode functionality and related components (e310972)
- refactor: remove unused microphone functionality into search bar (f5ebd21)
- chore: merge branch 'feat/frontend' into feat/frontend-doctor (c5f33bb)
- refactor: remove health page and widget (4b8713d)
- refactor: user and delegation API (23e4cf5)
- refactor: remove document comparison and related components (003141d)
- refactor: update selectDoctor to set patient profile (7a45ffe)
- refactor: rename types according to conventions (5c840a8)
- refactor: restructure app with layout components and nested routes (8fcf688)
- refactor: rename footer (38e2b50)
- refactor: remove intelligent search suggestion (47076f1)
- chore: divide components into topics (8a8d0c3)
- refactor: remove tailwind and centralize card list to preserve consistency (dfc2f2e)
- chore: merge branch 'dev' into feat/frontend (adc124d)
- chore: merge branch 'feat/frontend' into feat/frontend (6d61cff)
- refactor: separate patient routes with explicit prefixes (1a95405)
- chore: dockerize service (879babd)
- chore: update .gitignore (2b166b1)
- chore: import frontend (73c425d)

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
