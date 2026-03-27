#!/bin/bash

set -euo pipefail

# Script to create initial Kafka topics
BOOTSTRAP_SERVER="${KAFKA_BOOTSTRAP_SERVER:-kafka:9092}"
KAFKA_TOPICS_BIN="/opt/kafka/bin/kafka-topics.sh"

echo "Waiting for Kafka to become ready at ${BOOTSTRAP_SERVER}..."

# Wait for Kafka to be ready
until "$KAFKA_TOPICS_BIN" --bootstrap-server "$BOOTSTRAP_SERVER" --list > /dev/null 2>&1; do
  echo "Kafka not yet ready... waiting 5 seconds"
  sleep 5
done

echo "Kafka is ready! Creating topics..."

# Topic definitions in-place: <topic_name>:<partitions>:<replication_factor>
TOPICS_TO_CREATE=(
  # Publisher: User Service | Consumers: Appointment Service, Document Service
  "users.user-deleted:3:1"

  # Publisher: Master Data Service | Consumers: Document Service
  "master-data.medicine-deleted:3:1"

  # Publisher: Master Data Service | Consumers: Appointment Service
  "master-data.facility-deleted:3:1"

  # Publisher: Master Data Service | Consumers: Appointment Service, Document Service
  "master-data.service-type-deleted:3:1"
)

for topic_definition in "${TOPICS_TO_CREATE[@]}"; do
  IFS=':' read -r TOPIC_NAME TOPIC_PARTITIONS TOPIC_REPLICATION <<< "$topic_definition"

  echo "Creating Kafka topic: $TOPIC_NAME (partitions=$TOPIC_PARTITIONS, replication=$TOPIC_REPLICATION)"
  "$KAFKA_TOPICS_BIN" --bootstrap-server "$BOOTSTRAP_SERVER" --create --if-not-exists \
    --topic "$TOPIC_NAME" \
    --partitions "$TOPIC_PARTITIONS" \
    --replication-factor "$TOPIC_REPLICATION"

  echo "Topic $TOPIC_NAME created successfully"
done

# List created topics
echo "Topics created successfully! Current topics:"
"$KAFKA_TOPICS_BIN" --bootstrap-server "$BOOTSTRAP_SERVER" --list

echo "Topic initialization complete!"