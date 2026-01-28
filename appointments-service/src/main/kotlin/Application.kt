package it.nucleo

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.routes.availabilityRoutes
import it.nucleo.appointments.infrastructure.database.DatabaseFactory
import it.nucleo.appointments.infrastructure.persistence.ExposedAvailabilityRepository
import kotlinx.serialization.json.Json

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") { configureApp() }.start(wait = true)
}

fun Application.configureApp() {
    // Initialize database
    DatabaseFactory.init()

    // Configure JSON serialization
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            }
        )
    }

    // Configure routing
    routing {
        get("/") { call.respondText("Appointments Service API is running", ContentType.Text.Plain) }

        get("/health") { call.respond(HttpStatusCode.OK, mapOf("status" to "UP")) }

        val availabilityRepository = ExposedAvailabilityRepository()
        availabilityRoutes(availabilityRepository)
    }
}
