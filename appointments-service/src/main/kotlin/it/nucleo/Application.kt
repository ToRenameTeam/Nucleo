package it.nucleo

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.application.ApplicationStopping
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.routes.appointmentRoutes
import it.nucleo.appointments.api.routes.availabilityRoutes
import it.nucleo.appointments.application.AppointmentService
import it.nucleo.appointments.application.AvailabilityService
import it.nucleo.appointments.infrastructure.database.DatabaseFactory
import it.nucleo.appointments.infrastructure.kafka.DeleteEventsConsumer
import it.nucleo.appointments.infrastructure.kafka.NotificationEventsPublisher
import it.nucleo.appointments.infrastructure.persistence.ExposedAppointmentRepository
import it.nucleo.appointments.infrastructure.persistence.ExposedAvailabilityRepository
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.commons.ktor.configureCors
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import org.slf4j.event.Level

private const val DEFAULT_SERVER_PORT = 8080
private val logger = LoggerFactory.getLogger("it.nucleo.Application")

fun main() {
    val port = Environment.serverPort
    logger.info("Starting Appointments Service on port $port")
    embeddedServer(Netty, port = port, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    configureSerialization()
    configureStatusPages()
    configureCors()
    configureCallLogging()
    initializeDatabase()
    configureKafkaConsumers()
    configureRouting()
    logger.info("Application initialized successfully")
}

private fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            }
        )
    }
}

private fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            logger.warn("Invalid request: ${cause.message}")
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(error = "INVALID_REQUEST", message = "Invalid request")
            )
        }

        exception<Throwable> { call, cause ->
            logger.error("Unexpected error: ${cause.message}", cause)
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(error = "INTERNAL_ERROR", message = "An unexpected error occurred")
            )
        }

        status(HttpStatusCode.NotFound) { call, status ->
            call.respond(
                status,
                ErrorResponse(error = "NOT_FOUND", message = "The requested resource was not found")
            )
        }

        status(HttpStatusCode.MethodNotAllowed) { call, status ->
            call.respond(
                status,
                ErrorResponse(
                    error = "METHOD_NOT_ALLOWED",
                    message = "The HTTP method is not allowed for this resource"
                )
            )
        }
    }
}

private fun Application.configureCallLogging() {
    install(CallLogging) {
        level = Level.INFO
        filter { call -> call.request.path().startsWith("/") }
    }
}

private fun initializeDatabase() {
    logger.info("Initializing database connection")
    DatabaseFactory.init()
    logger.info("Database initialized successfully")
}

private fun Application.configureRouting() {
    val availabilityRepository = ExposedAvailabilityRepository()
    val appointmentRepository = ExposedAppointmentRepository()
    val availabilityService = AvailabilityService(availabilityRepository)
    val notificationPublisher =
        NotificationEventsPublisher(
            bootstrapServers = Environment.kafkaBootstrapServers,
            clientId = Environment.kafkaClientId,
            notificationsTopic = Environment.kafkaTopicNotifications
        )
    val appointmentService =
        AppointmentService(appointmentRepository, availabilityRepository, notificationPublisher)

    environment.monitor.subscribe(ApplicationStopping) { notificationPublisher.close() }

    routing {
        get("/health") { call.respond(HttpStatusCode.OK, mapOf("status" to "UP")) }

        route("/api") {
            availabilityRoutes(availabilityService)
            appointmentRoutes(appointmentService)
        }
    }
}

private fun Application.configureKafkaConsumers() {
    val consumer =
        DeleteEventsConsumer(
            cleanupRepository = ExposedAppointmentRepository(),
            bootstrapServers = Environment.kafkaBootstrapServers,
            clientId = Environment.kafkaClientId,
            groupId = Environment.kafkaConsumerGroupId,
            userDeletedTopic = Environment.kafkaTopicUserDeleted,
            facilityDeletedTopic = Environment.kafkaTopicFacilityDeleted,
            serviceTypeDeletedTopic = Environment.kafkaTopicServiceTypeDeleted
        )

    consumer.start()
    environment.monitor.subscribe(ApplicationStopping) { consumer.stop() }
}

private object Environment {
    val serverPort: Int
        get() = System.getenv("SERVER_PORT")?.toIntOrNull() ?: DEFAULT_SERVER_PORT

    val kafkaBootstrapServers: String
        get() = System.getenv("KAFKA_BOOTSTRAP_SERVERS") ?: ""

    val kafkaClientId: String
        get() = System.getenv("KAFKA_CLIENT_ID") ?: "appointments-service"

    val kafkaConsumerGroupId: String
        get() = System.getenv("KAFKA_CONSUMER_GROUP_ID") ?: ""

    val kafkaTopicUserDeleted: String
        get() = System.getenv("KAFKA_TOPIC_USER_DELETED") ?: ""

    val kafkaTopicFacilityDeleted: String
        get() = System.getenv("KAFKA_TOPIC_FACILITY_DELETED") ?: ""

    val kafkaTopicServiceTypeDeleted: String
        get() = System.getenv("KAFKA_TOPIC_SERVICE_TYPE_DELETED") ?: ""

    val kafkaTopicNotifications: String
        get() = System.getenv("KAFKA_TOPIC_NOTIFICATIONS") ?: ""
}
