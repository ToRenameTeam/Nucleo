#!/bin/bash

set -euo pipefail

# PRE-REQUISITES
# start docker daemon
# minikube start

# DEPLOYMENT (STEP 1): Strimzi operator + Kafka cluster
helm upgrade --install strimzi-cluster-operator \
  --set replicas=1 \
  --set resources.limits.cpu=700 \
  oci://quay.io/strimzi-helm/strimzi-kafka-operator

# Wait for Strimzi operator readiness to avoid race conditions on first install.
kubectl wait deployment/strimzi-cluster-operator \
  --for=condition=Available=True \
  --timeout=300s

kubectl apply -f kubernetes/kafka.yaml

# Wait for Kafka CR to be ready before creating KafkaTopic resources.
kubectl wait kafka/cluster \
  --for=condition=Ready=True \
  --timeout=600s

# DEPLOYMENT (STEP 2): Kafka topics
kubectl apply -f kubernetes/kafka-topics.yaml

echo "Kafka cluster ready and topics applied."
