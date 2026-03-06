package it.nucleo

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.ErrorResponse
import it.nucleo.appointments.api.routes.appointmentRoutes
import it.nucleo.appointments.api.routes.availabilityRoutes
import it.nucleo.appointments.application.AppointmentService
import it.nucleo.appointments.application.AvailabilityService
import it.nucleo.appointments.infrastructure.database.DatabaseFactory
import it.nucleo.appointments.infrastructure.persistence.ExposedAppointmentRepository
import it.nucleo.appointments.infrastructure.persistence.ExposedAvailabilityRepository
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import org.slf4j.event.Level

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
                ErrorResponse(message = "Invalid request", code = "INVALID_REQUEST")
            )
        }

        exception<Throwable> { call, cause ->
            logger.error("Unexpected error: ${cause.message}", cause)
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(message = "An unexpected error occurred", code = "INTERNAL_ERROR")
            )
        }

        status(HttpStatusCode.NotFound) { call, status ->
            call.respond(
                status,
                ErrorResponse(message = "The requested resource was not found", code = "NOT_FOUND")
            )
        }

        status(HttpStatusCode.MethodNotAllowed) { call, status ->
            call.respond(
                status,
                ErrorResponse(
                    message = "The HTTP method is not allowed for this resource",
                    code = "METHOD_NOT_ALLOWED"
                )
            )
        }
    }
}

private fun Application.configureCors() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader("X-Requested-With")
        anyHost()
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
    val appointmentService = AppointmentService(appointmentRepository, availabilityRepository)

    routing {
        get("/health") { call.respond(HttpStatusCode.OK, mapOf("status" to "UP")) }

        availabilityRoutes(availabilityService)
        appointmentRoutes(appointmentService)
    }
}

private object Environment {
    val serverPort: Int
        get() = System.getenv("SERVER_PORT")?.toIntOrNull() ?: 8080
}
