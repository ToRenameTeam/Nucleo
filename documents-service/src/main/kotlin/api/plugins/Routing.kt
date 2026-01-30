package it.nucleo.api.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.routes.documentRoutes
import it.nucleo.application.DocumentService
import it.nucleo.domain.DocumentRepository

fun Application.configureRouting(repository: DocumentRepository) {
    val documentService = DocumentService(repository)

    routing {
        healthCheck()
        route("/api/v1") { documentRoutes(documentService) }
    }
}

private fun Routing.healthCheck() {
    get("/health") { call.respondText("OK") }
}
