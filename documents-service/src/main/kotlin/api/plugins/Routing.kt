package it.nucleo.api.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.routes.documentRoutes
import it.nucleo.domain.DocumentRepository

fun Application.configureRouting(repository: DocumentRepository) {
    routing {
        healthCheck()
        route("/api/v1") { documentRoutes(repository) }
    }
}

private fun Routing.healthCheck() {
    get("/health") { call.respondText("OK") }
}
