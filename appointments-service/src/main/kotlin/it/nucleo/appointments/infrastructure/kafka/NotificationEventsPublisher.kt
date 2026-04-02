package it.nucleo.appointments.infrastructure.kafka

import java.time.Instant
import java.util.Properties
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.clients.producer.ProducerRecord
import org.apache.kafka.common.serialization.StringSerializer
import org.slf4j.LoggerFactory

@Serializable
private data class NotificationEvent(
    val receiver: String,
    val title: String,
    val content: String? = null,
    val sourceService: String,
    val occurredAt: String
)

class NotificationEventsPublisher(
    private val bootstrapServers: String,
    private val clientId: String,
    private val notificationsTopic: String
) {
    private val logger = LoggerFactory.getLogger(NotificationEventsPublisher::class.java)
    private val json = Json { encodeDefaults = true }
    private var producer: KafkaProducer<String, String>? = null

    fun isEnabled(): Boolean {
        return bootstrapServers.isNotBlank() && notificationsTopic.isNotBlank()
    }

    fun publish(receiver: String, title: String, content: String? = null) {
        if (!isEnabled() || receiver.isBlank() || title.isBlank()) {
            return
        }

        try {
            val event =
                NotificationEvent(
                    receiver = receiver,
                    title = title,
                    content = content,
                    sourceService = clientId,
                    occurredAt = Instant.now().toString()
                )
            val payload = json.encodeToString(event)

            getOrCreateProducer().send(
                ProducerRecord(notificationsTopic, receiver, payload)
            )
        } catch (error: Exception) {
            logger.error("Failed to publish notification event", error)
        }
    }

    fun close() {
        producer?.close()
        producer = null
    }

    private fun getOrCreateProducer(): KafkaProducer<String, String> {
        val currentProducer = producer
        if (currentProducer != null) {
            return currentProducer
        }

        val properties = Properties()
        properties[ProducerConfig.BOOTSTRAP_SERVERS_CONFIG] = bootstrapServers
        properties[ProducerConfig.CLIENT_ID_CONFIG] = "$clientId-notifications"
        properties[ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG] = StringSerializer::class.java
        properties[ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG] = StringSerializer::class.java

        val createdProducer = KafkaProducer<String, String>(properties)
        producer = createdProducer
        return createdProducer
    }
}
