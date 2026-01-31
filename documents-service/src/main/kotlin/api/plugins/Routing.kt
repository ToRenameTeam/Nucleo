package it.nucleo.api.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.routes.documentRoutes
import it.nucleo.api.routes.downloadRoutes
import it.nucleo.api.routes.uploadRoutes
import it.nucleo.application.DocumentDownloadService
import it.nucleo.application.DocumentPdfGenerator
import it.nucleo.application.DocumentService
import it.nucleo.application.DocumentUploadService
import it.nucleo.domain.DocumentRepository
import it.nucleo.domain.FileStorageRepository

fun Application.configureRouting(
    documentRepository: DocumentRepository,
    fileStorageRepository: FileStorageRepository
) {
    val pdfGenerator = DocumentPdfGenerator()
    val documentService = DocumentService(documentRepository, fileStorageRepository, pdfGenerator)
    val uploadService = DocumentUploadService(fileStorageRepository)
    val downloadService = DocumentDownloadService(fileStorageRepository)

    routing {
        healthCheck()
        route("/api/v1") {
            documentRoutes(documentService)
            uploadRoutes(uploadService)
            downloadRoutes(downloadService)
        }
    }
}

private fun Routing.healthCheck() {
    get("/health") { call.respondText("OK") }
}
