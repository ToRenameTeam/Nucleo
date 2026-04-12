# Nucleo

A family-oriented healthcare data platform.

Full documentation is available on [this page.](https://torenameteam.github.io/Nucleo/)

The project brings together in a single ecosystem:

- healthcare document management,
- appointment booking,
- delegation between family members/caregivers,
- AI-powered document analysis.

## Quick Overview

Nucleo is a multi-stack monorepo that combines backend services, frontend application, and shared infrastructure in a single codebase.

The following table summarizes the main services, their technology stack, and their location in the repository.

| Service | Stack | Directory |
| --- | --- | --- |
| Frontend | Vue 3 + Vite + TypeScript | `frontend-service/` | 
| Users | Node.js + Express + MongoDB | `users-service/` |
| Master Data | Node.js + Express + MongoDB | `master-data-service/` |
| Appointments | Kotlin + Ktor + PostgreSQL | `appointments-service/` |
| Documents | Kotlin + Ktor + MongoDB + MinIO | `documents-service/` |
| AI Service | Python + FastAPI | `ai-service/` |

### Infrastructure

| Component | Directory |
| --- | --- |
| NGINX | `infrastructure/nginx/` |
| Kafka | `infrastructure/kafka` |

## Prerequisites

- Docker
- Node.js
- pnpm 10.x
- JDK 22
- Python >= 3.13

Kubernetes commands also require:

- minikube
- kubectl
- helm

## Kubernetes Deployment (Minikube)

Full deploy:

```bash
bash ./scripts/deploy.sh
```

Undeploy while keeping volumes:

```bash
bash ./scripts/undeploy.sh
```

Undeploy with full volume cleanup:

```bash
bash ./scripts/undeploy.sh --purge-pv
```

After deployment, expose the gateway with:

```bash
kubectl -n default port-forward service/gateway-api-controller-traefik 3000:80
```

## Local Quick Start (Docker Compose)

From the repository root:

```bash
bash ./start-all-services.sh
```

The script:

1. automatically creates/updates service `.env` files,
2. starts all `docker-compose.yml` files in sequence.

When complete, the frontend is available at:

- `http://localhost:3000`

Important note:

- set `GROQ_API_KEY` in `documents-service/.env`.
- without a valid API key, the AI/document workflow will not work correctly.

### Full stop

```bash
bash ./stop-all-services.sh
```

## Local Development (without full Docker orchestration)

### 1) JS/TS workspace dependencies

```bash
pnpm install
```

### 2) Frontend

```bash
cd frontend-service
pnpm dev
```

### 3) Node services (from root)

```bash
pnpm dev:users
pnpm dev:master-data
```

### 4) Kotlin services (from root)

```bash
./gradlew :appointments-service:run
./gradlew :documents-service:run
```

### 5) AI service (from root)

Option with uv (recommended, using `ai-service/justfile`):

```bash
cd ai-service
uv sync
uv run main.py
```

Classic venv option:

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -e .
python src/main.py
```

## Code Quality, Tests, and Docs

From root:

```bash
pnpm lint
pnpm lint:fix
pnpm format:check
pnpm format
pnpm test:coverage
```

For Kotlin modules:

```bash
./gradlew test
```

VitePress docs:

```bash
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

## Main Structure

```text
Nucleo/
|- users-service/
|- master-data-service/
|- appointments-service/
|- documents-service/
|- ai-service/
|- frontend-service/
|- infrastructure/
|  |- kafka/
|  |- nginx/
|- kubernetes/
|- docs/
|- scripts/
```

## Useful Notes

- The repository includes bash scripts for full orchestration; on Windows, Git Bash or WSL is recommended.
- `.env` variables are maintained by the script without overwriting existing values.
- Multi-service release automation is available through scripts in `scripts/` and config in `release/`.