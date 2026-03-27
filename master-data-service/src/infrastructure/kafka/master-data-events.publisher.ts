import { Kafka, type Producer } from 'kafkajs';

interface EntityDeletedEvent {
  id: string;
  deletedAt: string;
}

export class MasterDataEventsPublisher {
  private readonly bootstrapServers: string;
  private readonly clientId: string;
  private readonly medicineDeletedTopic: string;
  private readonly facilityDeletedTopic: string;
  private readonly serviceTypeDeletedTopic: string;
  private producer: Producer | null;
  private isConnected: boolean;

  constructor() {
    this.bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS ?? '';
    this.clientId = process.env.KAFKA_CLIENT_ID ?? 'master-data-service';
    this.medicineDeletedTopic = process.env.KAFKA_TOPIC_MEDICINE_DELETED ?? '';
    this.facilityDeletedTopic = process.env.KAFKA_TOPIC_FACILITY_DELETED ?? '';
    this.serviceTypeDeletedTopic = process.env.KAFKA_TOPIC_SERVICE_TYPE_DELETED ?? '';
    this.producer = null;
    this.isConnected = false;
  }

  async publishMedicineDeleted(event: EntityDeletedEvent): Promise<void> {
    await this.publish(this.medicineDeletedTopic, event);
  }

  async publishFacilityDeleted(event: EntityDeletedEvent): Promise<void> {
    await this.publish(this.facilityDeletedTopic, event);
  }

  async publishServiceTypeDeleted(event: EntityDeletedEvent): Promise<void> {
    await this.publish(this.serviceTypeDeletedTopic, event);
  }

  async disconnect(): Promise<void> {
    if (!this.producer || !this.isConnected) {
      return;
    }

    await this.producer.disconnect();
    this.isConnected = false;
  }

  private async publish(topic: string, event: EntityDeletedEvent): Promise<void> {
    if (!this.isEnabled(topic)) {
      return;
    }

    await this.ensureConnected();

    await this.producer?.send({
      topic,
      messages: [
        {
          key: event.id,
          value: JSON.stringify(event),
        },
      ],
    });
  }

  private isEnabled(topic: string): boolean {
    if (!this.bootstrapServers || !topic) {
      return false;
    }

    return true;
  }

  private async ensureConnected(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.bootstrapServers.split(',').map(function (broker) {
        return broker.trim();
      }),
    });

    this.producer = kafka.producer();
    await this.producer.connect();
    this.isConnected = true;
  }
}
