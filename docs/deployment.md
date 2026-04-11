# Deployment

The system can be deployed in two ways: locally via Docker Compose for development and testing, or on a local Kubernetes cluster using Minikube for a production-like environment.

## Docker Compose

### Prerequisites

- [Docker](https://www.docker.com/) installed and running.

### Starting the system

First, clone the repository:

```bash
git clone https://github.com/ToRenameTeam/Nucleo.git
cd Nucleo
```

Then run the following script from the repository root:

```bash
./start-all-services.sh
```

The script performs the following steps:

1. **Configures `.env` files**: for each service that provides a `.env.example` template, the script creates a `.env` file from it if one does not already exist. If a `.env` file is already present, any keys missing from it are automatically added from the template without overwriting existing values.
2. **Starts all services**: each service is started in detached mode via `docker-compose up -d`, in the following order: Kafka, `appointments-service`, `users-service`, `master-data-service`, `documents-service`, NGINX, and `frontend-service`.

On first startup, databases are seeded automatically. Allow a few minutes for all containers to become healthy.

> **Note:** the `ai-service` requires a valid [Groq](https://groq.com/) API key to function. Before starting the system, set the `GROQ_API_KEY` variable in `documents-service/.env` (the file is created automatically by the script on first run, but the key must be filled in manually):
> ```
> GROQ_API_KEY=your_api_key_here
> ```

Once running, the system is accessible at `http://localhost:3000`.

### Stopping the system

```bash
./stop-all-services.sh
```

The script runs `docker-compose down` for each service in reverse order. Database volumes are **not** removed, so data is preserved across restarts.

## Kubernetes (Minikube)

### Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/)
- [Docker](https://www.docker.com/)

### Cluster Configuration

All Kubernetes manifests and Helm charts are located in the `kubernetes/` directory. The following Helm charts are defined for the different types of components:

- `node-chart`: for Node.js microservices
- `kotlin-chart`: for JVM microservices
- `python-chart`: for the Python service
- `mongo-chart`: for MongoDB instances
- `postgres-chart`: for the PostgreSQL instance
- `minio-chart`: for MinIO object storage

Kafka is managed by the [Strimzi Kafka Operator](https://strimzi.io/), which handles the full lifecycle of the Kafka cluster and topics as Kubernetes custom resources.

Routing between the external network and the cluster is handled by the [Gateway API](https://gateway-api.sigs.k8s.io/) with [Traefik](https://traefik.io/) as the controller, replacing the traditional Ingress resource.

### Starting the cluster

First, clone the repository if you have not already done so:

```bash
git clone https://github.com/ToRenameTeam/Nucleo.git
cd Nucleo
```

Before deploying, set the `GROQ_API_KEY` in `ai-service/helm-values/app.values.yaml`:

```yaml
secretEnv:
  GROQ_API_KEY: your_api_key_here
```

Then start Minikube with sufficient resources:

```bash
minikube start --memory=8192 --cpus=4
```

And run the deploy script from the repository root:

```bash
./scripts/deploy.sh
```

The script performs the following steps in order:

1. **Checks prerequisites**: verifies that `kubectl`, `helm`, `minikube`, and `docker` are available and that Minikube is running.
2. **Installs Gateway API CRDs and Traefik controller**: applies the standard Gateway API CRDs and deploys Traefik via Helm.
3. **Deploys Kafka**: installs the Strimzi operator, then creates the Kafka cluster and topics as custom resources. The script waits for the cluster and all topics to become ready.
4. **Deploys data stores**: installs MongoDB (for `users-service`, `master-data-service`, and `documents-service`), PostgreSQL (for `appointments-service`), and MinIO via their respective Helm charts.
5. **Builds and loads Docker images**: builds each service image locally and loads it into Minikube's image registry.
6. **Deploys application services**: installs each microservice via Helm and applies the Gateway API routes.

The deployment takes several minutes. The script waits for each component to become ready before proceeding to the next step.

Once the script completes, expose the gateway locally with:

```bash
kubectl -n default port-forward service/gateway-api-controller-traefik 3000:80
```

The application will be accessible at `http://localhost:3000`.

### Stopping the cluster

To remove all deployed resources while preserving database volumes:

```bash
./scripts/undeploy.sh
```

To perform a full cleanup including all persistent volume claims (required for a clean redeploy):

```bash
./scripts/undeploy.sh --purge-pv
```

> **Note:** without `--purge-pv`, all persistent volume claims are preserved across redeployments. This means each data store will reuse its existing data on the next deploy.
