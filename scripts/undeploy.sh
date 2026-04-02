#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAMESPACE="${NAMESPACE:-default}"
PURGE_PV=false
KAFKA_DELETE_TIMEOUT="${KAFKA_DELETE_TIMEOUT:-600s}"

BLUE='\033[1;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --purge-pv)
      PURGE_PV=true
      ;;
    -h|--help)
      cat <<'EOF'
Usage: ./scripts/undeploy.sh [--purge-pv]

Options:
  --purge-pv   Delete all workloads and also remove PVCs (Kafka + service databases).
               Required for a clean redeploy: without this flag MongoDB reuses
               existing data and skips user initialization on next deploy.
  -h, --help   Show this help message.
EOF
      exit 0
      ;;
    *)
      echo -e "${RED}[ERROR] Unknown argument: $1${NC}" >&2
      exit 1
      ;;
  esac
  shift
done

echo -e "\n${BLUE}==> Checking prerequisites${NC}"
if ! command -v kubectl >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Missing required command: kubectl${NC}" >&2
  exit 1
fi
if ! command -v helm >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Missing required command: helm${NC}" >&2
  exit 1
fi

echo -e "${GREEN}[OK] Prerequisites satisfied${NC}"

if [[ "$PURGE_PV" == true ]]; then
  echo -e "${YELLOW}[MODE] Full cleanup (PVCs will be deleted)${NC}"
else
  echo -e "${YELLOW}[MODE] Preserve data (PVCs kept, Kafka metadata kept)${NC}"
  echo -e "${YELLOW}[WARN] Next deploy will reuse existing MongoDB data and SKIP user init.${NC}"
  echo -e "${YELLOW}[WARN] For a clean redeploy use: ./scripts/undeploy.sh --purge-pv${NC}"
fi

echo -e "\n${BLUE}==> Removing Gateway API resources${NC}"
kubectl -n "$NAMESPACE" delete -k "$ROOT_DIR/kubernetes/gateway-api" --ignore-not-found

echo -e "${GREEN}[OK] Gateway API resources removed${NC}"

echo -e "\n${BLUE}==> Removing application services${NC}"
for release_name in \
  gateway-api-controller \
  frontend-service \
  documents-service \
  ai-service \
  appointments-service \
  master-data-service \
  users-service; do
  if helm -n "$NAMESPACE" status "$release_name" >/dev/null 2>&1; then
    echo -e "${GRAY}  - Helm uninstall: $release_name${NC}"
    helm -n "$NAMESPACE" uninstall "$release_name"
  else
    echo -e "${GRAY}  - Release not found (skip): $release_name${NC}"
  fi
done

echo -e "${GREEN}[OK] Application services removed${NC}"

echo -e "\n${BLUE}==> Removing data stores${NC}"
for release_name in \
  minio \
  documents-db \
  appointments-db \
  master-data-db \
  users-db; do
  if helm -n "$NAMESPACE" status "$release_name" >/dev/null 2>&1; then
    echo -e "${GRAY}  - Helm uninstall: $release_name${NC}"
    helm -n "$NAMESPACE" uninstall "$release_name"
  else
    echo -e "${GRAY}  - Release not found (skip): $release_name${NC}"
  fi
done

echo -e "${GREEN}[OK] Data stores removed${NC}"

echo -e "\n${BLUE}==> Handling Kafka resources${NC}"
if [[ "$PURGE_PV" == true ]]; then
  if kubectl get crd kafkatopics.kafka.strimzi.io >/dev/null 2>&1; then
    kubectl -n "$NAMESPACE" delete -f "$ROOT_DIR/kubernetes/kafka-topics.yaml" --ignore-not-found
  else
    echo -e "${GRAY}  - CRD kafkatopics.kafka.strimzi.io not found (skip topics deletion)${NC}"
  fi

  if kubectl get crd kafkas.kafka.strimzi.io >/dev/null 2>&1; then
    kubectl -n "$NAMESPACE" delete -f "$ROOT_DIR/kubernetes/kafka.yaml" --ignore-not-found

    if kubectl -n "$NAMESPACE" get kafka/cluster >/dev/null 2>&1; then
      echo -e "${GRAY}  - Waiting for Kafka cluster deletion${NC}"
      if ! kubectl -n "$NAMESPACE" wait kafka/cluster --for=delete --timeout="$KAFKA_DELETE_TIMEOUT"; then
        echo -e "${YELLOW}[WARN] Timed out waiting for Kafka cluster deletion${NC}"
      fi
    fi
  else
    echo -e "${GRAY}  - CRD kafkas.kafka.strimzi.io not found (skip cluster deletion)${NC}"
  fi

  echo -e "${GREEN}[OK] Kafka resources removed${NC}"
else
  if kubectl get crd kafkanodepools.kafka.strimzi.io >/dev/null 2>&1; then
    nodepools="$(kubectl -n "$NAMESPACE" get kafkanodepool -l strimzi.io/cluster=cluster -o name 2>/dev/null || true)"
    if [[ -n "$nodepools" ]]; then
      while IFS= read -r nodepool; do
        [[ -z "$nodepool" ]] && continue
        echo -e "${GRAY}  - Scaling down $nodepool to 0 replicas${NC}"
        kubectl -n "$NAMESPACE" patch "$nodepool" --type=merge -p '{"spec":{"replicas":0}}' >/dev/null
      done <<< "$nodepools"

      echo -e "${GREEN}[OK] Kafka broker/controller scale-down requested (data preserved)${NC}"
    else
      echo -e "${GRAY}  - No KafkaNodePool resources found for cluster 'cluster' (skip scale down)${NC}"
    fi
  else
    echo -e "${GRAY}  - CRD kafkanodepools.kafka.strimzi.io not found (skip scale down)${NC}"
  fi

  echo -e "${GRAY}  - Keeping Kafka CR and KafkaTopic resources to preserve metadata and topic definitions${NC}"
fi

echo -e "\n${BLUE}==> Removing Strimzi operator${NC}"
if helm -n "$NAMESPACE" status strimzi-cluster-operator >/dev/null 2>&1; then
  echo -e "${GRAY}  - Helm uninstall: strimzi-cluster-operator${NC}"
  helm -n "$NAMESPACE" uninstall strimzi-cluster-operator
else
  echo -e "${GRAY}  - Release not found (skip): strimzi-cluster-operator${NC}"
fi

echo -e "${GREEN}[OK] Strimzi operator removal completed${NC}"

if [[ "$PURGE_PV" == true ]]; then
  echo -e "\n${BLUE}==> Purging persistent volumes${NC}"

  # Use label selectors where possible so that PVC names remain correct
  # even if Helm release names change in the future.

  # MongoDB PVCs — identified by the StatefulSet label set by the mongo-chart.
  for release_name in users-db master-data-db documents-db; do
    echo -e "${GRAY}  - Removing PVCs for release: $release_name${NC}"
    kubectl -n "$NAMESPACE" delete pvc \
      -l "app.kubernetes.io/instance=${release_name}" \
      --ignore-not-found >/dev/null || true
  done

  # Postgres PVC — same approach via release label.
  echo -e "${GRAY}  - Removing PVCs for release: appointments-db${NC}"
  kubectl -n "$NAMESPACE" delete pvc \
    -l "app.kubernetes.io/instance=appointments-db" \
    --ignore-not-found >/dev/null || true

  # MinIO PVC — via release label.
  echo -e "${GRAY}  - Removing PVCs for release: minio${NC}"
  kubectl -n "$NAMESPACE" delete pvc \
    -l "app.kubernetes.io/instance=minio" \
    --ignore-not-found >/dev/null || true

  # Kafka PVCs — managed by Strimzi, identified by cluster label.
  echo -e "${GRAY}  - Removing Kafka PVCs (label: strimzi.io/cluster=cluster)${NC}"
  kubectl -n "$NAMESPACE" delete pvc \
    -l "strimzi.io/cluster=cluster" \
    --ignore-not-found >/dev/null || true

  echo -e "${GREEN}[OK] Persistent volumes purge completed${NC}"
fi

echo -e "\n${BLUE}==> Undeploy summary${NC}"
kubectl -n "$NAMESPACE" get pods || true
echo

if [[ "$PURGE_PV" == true ]]; then
  echo -e "${GREEN}[OK] Nucleo undeployed from namespace '$NAMESPACE' (with PVC purge)${NC}"
else
  echo -e "${GREEN}[OK] Nucleo undeployed from namespace '$NAMESPACE' (PVCs preserved)${NC}"
  echo -e "${YELLOW}[WARN] Kafka and DB data were kept. Next deploy will reuse existing persisted state.${NC}"
  echo -e "${YELLOW}[WARN] For a clean redeploy: ./scripts/undeploy.sh --purge-pv${NC}"
fi