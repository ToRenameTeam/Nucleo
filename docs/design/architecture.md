# Architecture Design

Once the bounded contexts were identified, we designed the Nucleo architecture around a microservices approach to keep components cohesive and independently evolvable.

The current architecture includes the following services:

- `frontend-service`: serves the web application.
- `users-service`: users, authentication, authorization, delegations, and notifications capability.
- `documents-service`: prescriptions, reports, uploads, and document metadata.
- `appointments-service`: availabilities and appointment lifecycle.
- `master-data-service`: facilities, medicines, and service types.
- `ai-service`: document analysis support and AI-assisted extraction.

In addition to business services, the platform relies on infrastructure components:

- API Gateway (Nginx) for north-south traffic routing.
- Kafka as event broker for asynchronous integration.
- Dedicated data stores owned by each service.

## Component & Connector View

This view describes the runtime components and their interaction styles.

### Database per Microservice

Each service owns its persistence boundary. Other services do not access that data directly: they must use API contracts or domain events.

### Interactions

Nucleo uses two main communication patterns:

- External communication: clients call the frontend, which reaches backend APIs through the gateway.
- Internal communication: services collaborate with synchronous HTTP calls when immediate consistency is required, and with Kafka events for process decoupling and eventual consistency.

### Proposed Architecture

```mermaid
%%{init: {'themeVariables': {'fontSize': '16px'}, 'flowchart': {'nodeSpacing': 45, 'rankSpacing': 60}, 'themeCSS': '.edgeLabel, .edgeLabel p { font-size: 18px !important; }'}}%%
flowchart LR
	U[User Browser] --> FE[frontend-service]
	FE --> GW[API Gateway / Nginx]

	GW --> US[users-service]
	GW --> DS[documents-service]
	GW --> APS[appointments-service]
	GW --> MDS[master-data-service]
	GW --> AIS[ai-service]

	US <--> K[(Kafka Broker)]
	DS <--> K
	APS <--> K
	MDS <--> K

	US --> UDB[(Users DB)]
	DS --> DDB[(Documents DB)]
	APS --> ADB[(Appointments DB)]
	MDS --> MDB[(Master Data DB)]
	AIS --> AIX[(AI Data / Vector Store)]
```

## Module View

The repository is organized as a multi-module monorepo. Shared assets and build conventions are centralized, while each service remains independently deployable.

Main modules and artifacts:

- `commons`: shared cross-service utilities.
- `build-logic`: Gradle conventions and reusable build configuration.
- `frontend-service`: web client.
- `users-service`: identity, delegation, notifications capability.
- `documents-service`: document lifecycle.
- `appointments-service`: booking and availability.
- `master-data-service`: reference catalogs.
- `ai-service`: AI-powered analysis.
- `infrastructure` and `kubernetes`: deployment-related assets.
- `docs`: architecture, design, and delivery documentation.

```mermaid
%%{init: {'themeVariables': {'fontSize': '20px'}, 'flowchart': {'nodeSpacing': 55, 'rankSpacing': 90}, 'themeCSS': '.edgeLabel, .edgeLabel p { font-size: 16px !important; }'}}%%
flowchart TB
	subgraph SharedBuild[Shared and Build Layer]
		direction LR
		BL[build-logic]
		C[commons]
	end

	subgraph Services[Service Modules]
		direction TB
		FE[frontend-service]
		US[users-service]
		DS[documents-service]
		APS[appointments-service]
		MDS[master-data-service]
		AIS[ai-service]
	end

	subgraph PlatformOps[Platform and Ops]
		direction LR
		INF[infrastructure]
		K8S[kubernetes]
	end

	DOCS[docs]

	BL --> FE
	BL --> US
	BL --> DS
	BL --> APS
	BL --> MDS
	BL --> AIS

	C --> US
	C --> DS
	C --> APS
	C --> MDS

	INF --> K8S

	DOCS -. describes .-> SharedBuild
	DOCS -. documents .-> Services
	DOCS -. supports .-> PlatformOps
```

## Deployment View

Nucleo is deployed as a set of containers. The intended topology supports both local composition (for development and tests) and Kubernetes-based deployment (for staging/production environments).

```mermaid
%%{init: {'themeVariables': {'fontSize': '20px'}, 'flowchart': {'nodeSpacing': 50, 'rankSpacing': 75}, 'themeCSS': '.edgeLabel, .edgeLabel p { font-size: 16px !important; }'}}%%
flowchart TB
	subgraph Client
		B[Browser]
	end

	subgraph Edge
		G[Gateway / Ingress]
	end

	subgraph AppCluster[Application Cluster]
		FE[frontend-service]
		US[users-service]
		DS[documents-service]
		APS[appointments-service]
		MDS[master-data-service]
		AIS[ai-service]
		K[(Kafka)]
	end

	subgraph Data
		UDB[(Users DB)]
		DDB[(Documents DB)]
		ADB[(Appointments DB)]
		MDB[(Master Data DB)]
	end

	B --> G --> FE
	FE --> G
	G --> US
	G --> DS
	G --> APS
	G --> MDS
	G --> AIS

	US --> UDB
	DS --> DDB
	APS --> ADB
	MDS --> MDB

	US <--> K
	DS <--> K
	APS <--> K
	MDS <--> K
```

## Architectural Rationale

- Bounded contexts map to service boundaries to preserve domain clarity.
- Database-per-service enforces ownership and reduces accidental coupling.
- Event-driven collaboration through Kafka improves autonomy and resilience.
- Gateway-based ingress keeps external APIs controlled and evolvable.
- Containerized deployment simplifies reproducibility across environments.
