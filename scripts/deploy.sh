#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAMESPACE="${NAMESPACE:-default}"
HELM_TIMEOUT="${HELM_TIMEOUT:-10m}"
STRIMZI_DEPLOYMENT_TIMEOUT="${STRIMZI_DEPLOYMENT_TIMEOUT:-300s}"
KAFKA_READY_TIMEOUT="${KAFKA_READY_TIMEOUT:-600s}"
TOPICS_READY_TIMEOUT="${TOPICS_READY_TIMEOUT:-300s}"
BUILD_IMAGES="${BUILD_IMAGES:-true}"

# Basic ANSI colors for readable output.
BLUE='\033[1;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m'

echo -e "\n${BLUE}==> Checking prerequisites${NC}"

if ! command -v kubectl >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Missing required command: kubectl${NC}" >&2
  exit 1
fi

if ! command -v helm >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Missing required command: helm${NC}" >&2
  exit 1
fi

if ! command -v minikube >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Missing required command: minikube${NC}" >&2
  exit 1
fi

if [[ "$BUILD_IMAGES" == "true" ]] && ! command -v docker >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Missing required command: docker (required when BUILD_IMAGES=true)${NC}" >&2
  exit 1
fi

kubectl version --client >/dev/null
helm version >/dev/null

MINIKUBE_HOST_STATUS="$(minikube status --format '{{.Host}}' 2>/dev/null || true)"
if [[ "$MINIKUBE_HOST_STATUS" != "Running" ]]; then
  echo -e "${RED}[ERROR] Minikube is not running. Start it with: minikube start${NC}" >&2
  exit 1
fi

CURRENT_CONTEXT="$(kubectl config current-context 2>/dev/null || true)"
if [[ "$CURRENT_CONTEXT" != "minikube" ]]; then
  echo -e "${YELLOW}[WARN] Current kubectl context is '$CURRENT_CONTEXT' (expected: minikube).${NC}"
fi

echo -e "${GREEN}[OK] Prerequisites satisfied${NC}"

echo -e "\n${BLUE}==> Checking optional dependencies${NC}"
if ! kubectl -n "$NAMESPACE" get service minio >/dev/null 2>&1; then
  echo -e "${YELLOW}[WARN] Service 'minio' not found in namespace '$NAMESPACE'.${NC}"
  echo -e "${YELLOW}[WARN] ai-service and documents-service may not work until MinIO is available.${NC}"
else
  echo -e "${GREEN}[OK] MinIO service detected${NC}"
fi

echo -e "\n${BLUE}==> Deploying Kafka (Strimzi operator, cluster, topics)${NC}"
helm upgrade --install strimzi-cluster-operator \
  --set replicas=1 \
  --set resources.limits.cpu=700 \
  --namespace "$NAMESPACE" \
  --create-namespace \
  --wait \
  --timeout "$HELM_TIMEOUT" \
  oci://quay.io/strimzi-helm/strimzi-kafka-operator

echo -e "${GRAY}  - Waiting for Strimzi operator deployment${NC}"
kubectl -n "$NAMESPACE" wait deployment/strimzi-cluster-operator \
  --for=condition=Available=True \
  --timeout="$STRIMZI_DEPLOYMENT_TIMEOUT"

kubectl -n "$NAMESPACE" apply -f "$ROOT_DIR/kubernetes/kafka.yaml"

echo -e "${GRAY}  - Waiting for Kafka cluster readiness${NC}"
kubectl -n "$NAMESPACE" wait kafka/cluster \
  --for=condition=Ready=True \
  --timeout="$KAFKA_READY_TIMEOUT"

kubectl -n "$NAMESPACE" apply -f "$ROOT_DIR/kubernetes/kafka-topics.yaml"
if ! kubectl -n "$NAMESPACE" wait kafkatopic --all \
  --for=condition=Ready=True \
  --timeout="$TOPICS_READY_TIMEOUT"; then
  echo -e "${YELLOW}[WARN] Timed out waiting for one or more Kafka topics${NC}"
fi

echo -e "${GREEN}[OK] Kafka cluster ready and topics applied${NC}"

echo -e "\n${BLUE}==> Deploying data stores${NC}"
helm upgrade --install users-db "$ROOT_DIR/kubernetes/helm-chart/mongo-chart" \
  -f "$ROOT_DIR/users-service/helm-values/mongo.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install master-data-db "$ROOT_DIR/kubernetes/helm-chart/mongo-chart" \
  -f "$ROOT_DIR/master-data-service/helm-values/mongo.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install appointments-db "$ROOT_DIR/kubernetes/helm-chart/postgres-chart" \
  -f "$ROOT_DIR/appointments-service/helm-values/postgres.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install documents-db "$ROOT_DIR/kubernetes/helm-chart/mongo-chart" \
  -f "$ROOT_DIR/documents-service/helm-values/mongo.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

echo -e "${GREEN}[OK] Data stores deployed${NC}"

if [[ "$BUILD_IMAGES" == "true" ]]; then
  echo -e "\n${BLUE}==> Building local Docker images${NC}"

  docker build -t users-service:latest -f "$ROOT_DIR/users-service/Dockerfile" "$ROOT_DIR"
  docker build -t master-data-service:latest -f "$ROOT_DIR/master-data-service/Dockerfile" "$ROOT_DIR"
  docker build -t appointments-service:latest -f "$ROOT_DIR/appointments-service/Dockerfile" "$ROOT_DIR"
  docker build -t documents-service:latest -f "$ROOT_DIR/documents-service/Dockerfile" "$ROOT_DIR"
  docker build -t frontend-service:latest -f "$ROOT_DIR/frontend-service/Dockerfile" "$ROOT_DIR"
  docker build -t ai-service:latest -f "$ROOT_DIR/ai-service/Dockerfile" "$ROOT_DIR/ai-service"

  echo -e "${BLUE}==> Loading images into Minikube${NC}"
  minikube image load users-service:latest
  minikube image load master-data-service:latest
  minikube image load appointments-service:latest
  minikube image load documents-service:latest
  minikube image load frontend-service:latest
  minikube image load ai-service:latest

  echo -e "${GREEN}[OK] Local images built and loaded${NC}"
else
  echo -e "\n${YELLOW}[WARN] BUILD_IMAGES=false: skipping local image build/load.${NC}"
  echo -e "${YELLOW}[WARN] Ensure images exist in a registry reachable by Minikube.${NC}"
fi

echo -e "\n${BLUE}==> Deploying application services${NC}"
helm upgrade --install users-service "$ROOT_DIR/kubernetes/helm-chart/node-chart" \
  -f "$ROOT_DIR/users-service/helm-values/app.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install master-data-service "$ROOT_DIR/kubernetes/helm-chart/node-chart" \
  -f "$ROOT_DIR/master-data-service/helm-values/app.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install appointments-service "$ROOT_DIR/kubernetes/helm-chart/kotlin-chart" \
  -f "$ROOT_DIR/appointments-service/helm-values/app.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install ai-service "$ROOT_DIR/kubernetes/helm-chart/python-chart" \
  -f "$ROOT_DIR/ai-service/helm-values/app.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install documents-service "$ROOT_DIR/kubernetes/helm-chart/kotlin-chart" \
  -f "$ROOT_DIR/documents-service/helm-values/app.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

helm upgrade --install frontend-service "$ROOT_DIR/kubernetes/helm-chart/node-chart" \
  -f "$ROOT_DIR/frontend-service/helm-values/app.values.yaml" \
  --namespace "$NAMESPACE" --create-namespace --wait --timeout "$HELM_TIMEOUT"

echo -e "${GREEN}[OK] Application services deployed${NC}"

echo -e "\n${BLUE}==> Deployment summary${NC}"
kubectl -n "$NAMESPACE" get pods
echo

echo -e "${GREEN}[OK] Nucleo deployment completed in namespace '$NAMESPACE'${NC}"
