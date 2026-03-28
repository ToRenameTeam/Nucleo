#!/bin/bash

set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-default}"
HELM_RELEASE="strimzi-cluster-operator"
CLEANUP_PVCS="${CLEANUP_PVCS:-false}"

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl not found in PATH"
  exit 1
fi

if ! command -v helm >/dev/null 2>&1; then
  echo "helm not found in PATH"
  exit 1
fi

echo "Kafka undeploy in namespace: ${NAMESPACE}"

echo "[1/4] Delete Kafka topics (ignore if missing)"
kubectl delete -f ../kubernetes/kafka-topics.yaml -n "${NAMESPACE}" --ignore-not-found=true || true

echo "[2/4] Delete Kafka cluster resources (ignore if missing)"
kubectl delete -f ../kubernetes/kafka.yaml -n "${NAMESPACE}" --ignore-not-found=true || true

echo "[3/4] Uninstall Strimzi Helm release if present"
if helm status "${HELM_RELEASE}" -n "${NAMESPACE}" >/dev/null 2>&1; then
  helm uninstall "${HELM_RELEASE}" -n "${NAMESPACE}"
else
  echo "Helm release ${HELM_RELEASE} not found, skipping"
fi

echo "[4/4] Optional PVC cleanup"
if [ "${CLEANUP_PVCS}" = "true" ]; then
  kubectl delete pvc -n "${NAMESPACE}" -l strimzi.io/cluster=cluster --ignore-not-found=true || true
  echo "PVC cleanup completed"
else
  echo "PVCs kept (CLEANUP_PVCS=${CLEANUP_PVCS})"
fi

echo "Undeploy completed."
