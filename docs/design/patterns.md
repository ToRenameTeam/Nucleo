# Microservices Patterns

This page describes the key architectural patterns adopted in Nucleo and why they were selected.

## Communication Patterns

### API Gateway

Nucleo uses an API Gateway (Nginx) as the single entry point for frontend and client traffic.

Main benefits in this project:

- Centralized routing to backend services.
- External API surface controlled in one place.
- Better evolvability because internal service changes remain hidden from clients.

```mermaid
%%{init: {'themeVariables': {'fontSize': '16px'}}}%%
flowchart LR
	U[User Browser] --> FE[frontend-service]
	FE --> GW[API Gateway / Nginx]
	GW --> US[users-service]
	GW --> DS[documents-service]
	GW --> APS[appointments-service]
	GW --> MDS[master-data-service]
	GW --> AIS[ai-service]
```

### Event Publish/Subscribe

Nucleo uses asynchronous events over Kafka to decouple services and support eventual consistency.

Main benefits in this project:

- Producer and consumer autonomy.
- Reduced temporal coupling between services.
- Better resilience during temporary service unavailability.
- Easier addition of new subscribers without changing existing producers.

```mermaid
%%{init: {'themeVariables': {'fontSize': '16px'}}}%%
flowchart TB
	US[users-service]
	DS[documents-service]
	APS[appointments-service]
	MDS[master-data-service]
	K[(Kafka)]

	US <--> K
	DS <--> K
	APS <--> K
	MDS <--> K
```

## Deployment and Observability Patterns

### Service as Containers

All services are containerized and can run consistently across local and cluster environments.

### Database per Service

Each microservice owns its persistence boundary and does not allow direct data access from other services.

```mermaid
%%{init: {'themeVariables': {'fontSize': '16px'}}}%%
flowchart LR
	US[users-service] --> UDB[(Users DB)]
	DS[documents-service] --> DDB[(Documents DB)]
	APS[appointments-service] --> ADB[(Appointments DB)]
	MDS[master-data-service] --> MDB[(Master Data DB)]
	AIS[ai-service] --> AIX[(AI Data / Vector Store)]
```

## Security Pattern

Nucleo secures API access using token-based authentication and authorization.

```mermaid
%%{init: {'themeVariables': {'fontSize': '16px'}}}%%
sequenceDiagram
	participant U as User Browser
	participant FE as frontend-service
	participant US as users-service
	participant GW as API Gateway
	participant DS as domain-service

	U->>FE: Login request
	FE->>US: Authenticate credentials
	US-->>FE: Access token
	FE->>GW: API call + token
	GW->>DS: Forward request (validated token)
	DS-->>FE: Protected resource response
```
