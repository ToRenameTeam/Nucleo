#!/bin/bash

# Script to create initial Kafka topics
echo "Waiting for Kafka to become ready..."

KAFKA_TOPICS_BIN="/opt/kafka/bin/kafka-topics.sh"

# Wait for Kafka to be ready
until "$KAFKA_TOPICS_BIN" --bootstrap-server kafka:9092 --list > /dev/null 2>&1; do
  echo "Kafka not yet ready... waiting 5 seconds"
  sleep 5
done

echo "Kafka is ready! Creating topics..."

# Topic definitions in-place: <topic_name>:<partitions>:<replication_factor>
TOPICS_TO_CREATE=(
  "example:3:1"
)

for topic_definition in "${TOPICS_TO_CREATE[@]}"; do
  IFS=':' read -r TOPIC_NAME TOPIC_PARTITIONS TOPIC_REPLICATION <<< "$topic_definition"

  echo "Creating Kafka topic: $TOPIC_NAME (partitions=$TOPIC_PARTITIONS, replication=$TOPIC_REPLICATION)"
  "$KAFKA_TOPICS_BIN" --bootstrap-server kafka:9092 --create --if-not-exists \
    --topic "$TOPIC_NAME" \
    --partitions "$TOPIC_PARTITIONS" \
    --replication-factor "$TOPIC_REPLICATION"

  echo "Topic $TOPIC_NAME created successfully"
done

# List created topics
echo "Topics created successfully! Current topics:"
"$KAFKA_TOPICS_BIN" --bootstrap-server kafka:9092 --list

echo "Topic initialization complete!"