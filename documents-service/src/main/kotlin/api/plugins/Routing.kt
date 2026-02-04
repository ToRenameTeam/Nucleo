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
import it.nucleo.infrastructure.ai.AiServiceClient

fun Application.configureRouting(
    documentRepository: DocumentRepository,
    fileStorageRepository: FileStorageRepository,
    aiServiceClient: AiServiceClient? = null
) {
    val pdfGenerator = DocumentPdfGenerator()
    val documentService =
        DocumentService(
            repository = documentRepository,
            fileStorageRepository = fileStorageRepository,
            pdfGenerator = pdfGenerator,
            aiServiceClient = aiServiceClient
        )
    val uploadService =
        DocumentUploadService(
            fileStorageRepository = fileStorageRepository,
            documentRepository = documentRepository,
            aiServiceClient = aiServiceClient
        )
    val downloadService = DocumentDownloadService(fileStorageRepository)

    routing {
        healthCheck()
        route("/api") {
            documentRoutes(documentService)
            uploadRoutes(uploadService)
            downloadRoutes(downloadService)
        }
    }
}

private fun Routing.healthCheck() {
    get("/health") { call.respondText("OK") }
}
