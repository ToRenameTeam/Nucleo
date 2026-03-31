# NGINX API Gateway

This folder contains the NGINX reverse proxy configuration for Nucleo.

## Local Docker Compose

- `docker-compose.yml` + `nginx.conf` route `/api/*` to backend services.
- Gateway is exposed on `http://localhost:8088`.

## Kubernetes (Helm)

The Kubernetes gateway is deployed with the reusable chart at:

- `kubernetes/helm-chart/nginx-chart`

Environment-specific values for this repository are in:

- `infrastructure/nginx/helm-values/app.values.yaml`

The gateway service deployed by Helm is:

- `api-gateway-nginx-chart` (port `8088`)

Frontend API calls should use relative paths (for example `/api/users`) so the browser targets the same origin served by the gateway.

## Route map

- `/api/auth`, `/api/users`, `/api/delegations` -> `users-service`
- `/api/service-catalog`, `/api/facilities`, `/api/medicines` -> `master-data-service`
- `/api/appointments`, `/api/availabilities` -> `appointments-service`
- `/api/documents` -> `documents-service`
- `/` -> `frontend-service`
