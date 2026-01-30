package it.nucleo

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.path
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.routes.appointmentRoutes
import it.nucleo.appointments.api.routes.availabilityRoutes
import it.nucleo.appointments.application.AvailabilityService
import it.nucleo.appointments.infrastructure.database.DatabaseFactory
import it.nucleo.appointments.infrastructure.persistence.ExposedAppointmentRepository
import it.nucleo.appointments.infrastructure.persistence.ExposedAvailabilityRepository
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import org.slf4j.event.Level

private val logger = LoggerFactory.getLogger("Application")

fun main() {
    logger.info("Starting Appointments Service...")
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") { configureApp() }.start(wait = true)
}

fun Application.configureApp() {
    logger.info("Configuring application...")

    // Initialize database
    logger.info("Initializing database...")
    DatabaseFactory.init()
    logger.info("Database initialized successfully")

    // Configure JSON serialization
    logger.info("Configuring content negotiation...")
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            }
        )
    }

    // Configure logging
    logger.info("Configuring call logging...")
    install(CallLogging) {
        level = Level.INFO
        filter { call -> call.request.path().startsWith("/") }
    }

    // Configure routing
    logger.info("Configuring routing...")
    routing {
        get("/") { call.respondText("Appointments Service API is running", ContentType.Text.Plain) }

        get("/health") { call.respond(HttpStatusCode.OK, mapOf("status" to "UP")) }

        val availabilityRepository = ExposedAvailabilityRepository()
        val appointmentRepository = ExposedAppointmentRepository()

        // Initialize services
        val availabilityService = AvailabilityService(availabilityRepository)

        logger.info("Application configuration completed successfully")
        availabilityRoutes(availabilityService)
        appointmentRoutes(appointmentRepository, availabilityRepository)
    }
}
