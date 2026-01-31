package it.nucleo.api.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.routes.documentRoutes
import it.nucleo.api.routes.downloadRoutes
import it.nucleo.api.routes.uploadRoutes
import it.nucleo.application.DocumentService
import it.nucleo.domain.DocumentRepository
import it.nucleo.infrastructure.persistence.minio.MinioFileStorageService

fun Application.configureRouting(
    repository: DocumentRepository,
    fileStorageService: MinioFileStorageService
) {
    val documentService = DocumentService(repository)

    routing {
        healthCheck()
        route("/api/v1") {
            documentRoutes(documentService)
            uploadRoutes(fileStorageService)
            downloadRoutes(fileStorageService)
        }
    }
}

private fun Routing.healthCheck() {
    get("/health") { call.respondText("OK") }
}
