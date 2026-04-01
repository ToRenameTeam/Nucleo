package it.nucleo.documents.infrastructure.kafka

import com.mongodb.MongoException
import it.nucleo.documents.infrastructure.persistence.mongodb.MongoDocumentRepository
import java.time.Duration
import java.util.Properties
import kotlin.concurrent.thread
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.KafkaException
import org.apache.kafka.common.errors.WakeupException
import org.apache.kafka.common.serialization.StringDeserializer
import org.slf4j.LoggerFactory

private const val DEFAULT_POLL_TIMEOUT_SECONDS = 1L

class DeleteEventsConsumer(
    private val documentRepository: MongoDocumentRepository,
    private val bootstrapServers: String,
    private val clientId: String,
    private val groupId: String,
    private val userDeletedTopic: String,
    private val medicineDeletedTopic: String,
    private val serviceTypeDeletedTopic: String
) {
    private val logger = LoggerFactory.getLogger(DeleteEventsConsumer::class.java)
    private val json = Json { ignoreUnknownKeys = true }

    @Volatile private var running = false
    private var consumer: KafkaConsumer<String, String>? = null

    fun start() {
        if (!isEnabled()) {
            logger.info("Kafka delete-events consumer is disabled: missing Kafka configuration")
            return
        }

        if (running) {
            return
        }

        running = true
        thread(name = "documents-delete-events-consumer", isDaemon = true) { runConsumerLoop() }
    }

    fun stop() {
        if (!running) {
            return
        }

        running = false
        consumer?.wakeup()
    }

    private fun isEnabled(): Boolean {
        return bootstrapServers.isNotBlank() &&
            groupId.isNotBlank() &&
            listOf(userDeletedTopic, medicineDeletedTopic, serviceTypeDeletedTopic).all {
                it.isNotBlank()
            }
    }

    private fun runConsumerLoop() {
        val topics = listOf(userDeletedTopic, medicineDeletedTopic, serviceTypeDeletedTopic)
        val kafkaConsumer = KafkaConsumer<String, String>(consumerProperties())
        consumer = kafkaConsumer

        try {
            kafkaConsumer.subscribe(topics)
            logger.info("Kafka consumer subscribed to topics: {}", topics)

            while (running) {
                val records = kafkaConsumer.poll(Duration.ofSeconds(DEFAULT_POLL_TIMEOUT_SECONDS))
                for (record in records) {
                    handleRecord(record.topic(), record.value())
                }
            }
        } catch (_: WakeupException) {
            logger.info("Kafka consumer wakeup requested")
        } catch (error: KafkaException) {
            logger.error("Kafka consumer loop failed", error)
        } finally {
            kafkaConsumer.close()
            logger.info("Kafka consumer stopped")
        }
    }

    private fun handleRecord(topic: String, payload: String) {
        try {
            when (topic) {
                userDeletedTopic -> handleUserDeleted(payload)
                medicineDeletedTopic -> handleMedicineDeleted(payload)
                serviceTypeDeletedTopic -> handleServiceTypeDeleted(payload)
                else -> logger.warn("Received message from unexpected topic: {}", topic)
            }
        } catch (error: IllegalArgumentException) {
            logger.error("Failed to handle message on topic {}", topic, error)
        } catch (error: IllegalStateException) {
            logger.error("Failed to handle message on topic {}", topic, error)
        } catch (error: SerializationException) {
            logger.error("Failed to handle message on topic {}", topic, error)
        } catch (error: MongoException) {
            logger.error("Failed to handle message on topic {}", topic, error)
        }
    }

    private fun handleUserDeleted(payload: String) {
        val userId = extractField(payload, "userId")

        runBlocking {
            documentRepository.cleanupByDeletedUser(userId)
            logger.info("Processed user-deleted event for {}", userId)
        }
    }

    private fun handleMedicineDeleted(payload: String) {
        val medicineId = extractField(payload, "id")

        runBlocking {
            documentRepository.cleanupByDeletedMedicine(medicineId)
            logger.info("Processed medicine-deleted event for {}", medicineId)
        }
    }

    private fun handleServiceTypeDeleted(payload: String) {
        val serviceTypeId = extractField(payload, "id")

        runBlocking {
            documentRepository.cleanupByDeletedServiceType(serviceTypeId)
            logger.info("Processed service-type-deleted event for {}", serviceTypeId)
        }
    }

    private fun extractField(payload: String, fieldName: String): String {
        val element = json.parseToJsonElement(payload)
        val value = element.jsonObject[fieldName]?.jsonPrimitive?.content

        if (value.isNullOrBlank()) {
            throw IllegalArgumentException("Missing field '$fieldName' in Kafka payload: $payload")
        }

        return value
    }

    private fun consumerProperties(): Properties {
        val properties = Properties()
        properties[ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG] = bootstrapServers
        properties[ConsumerConfig.CLIENT_ID_CONFIG] = clientId
        properties[ConsumerConfig.GROUP_ID_CONFIG] = groupId
        properties[ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG] = StringDeserializer::class.java
        properties[ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG] = StringDeserializer::class.java
        properties[ConsumerConfig.AUTO_OFFSET_RESET_CONFIG] = "earliest"
        properties[ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG] = "true"
        return properties
    }
}
