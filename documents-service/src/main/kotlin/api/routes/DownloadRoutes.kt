package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.infrastructure.logging.logger
import it.nucleo.infrastructure.persistence.minio.DocumentNotFoundException
import it.nucleo.infrastructure.persistence.minio.FileStorageException
import it.nucleo.infrastructure.persistence.minio.MinioFileStorageService
import it.nucleo.domain.PatientId

private val logger = logger("it.nucleo.api.routes.DownloadRoutes")

fun Route.downloadRoutes(fileStorageService: MinioFileStorageService) {
    route("/patients/{patientId}/documents") {
        downloadDocument(fileStorageService)
    }
}

/**
 * GET /patients/{patientId}/documents/{documentKey}/download
 * Downloads a specific document from MinIO storage.
 *
 * The documentKey is the filename stored in MinIO (including the timestamp prefix).
 * Example: 20260131T120000000_report.pdf
 *
 * Returns the PDF file as a binary stream with appropriate headers for download.
 */
private fun Route.downloadDocument(fileStorageService: MinioFileStorageService) {
    get("/{documentKey}/download") {
        val patientId = call.parameters["patientId"]
            ?: return@get call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", "Patient ID is required")
            )

        val documentKey = call.parameters["documentKey"]
            ?: return@get call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", "Document key is required")
            )

        logger.debug("GET /patients/$patientId/documents/$documentKey/download - Downloading document")

        try {
            val download = fileStorageService.downloadDocument(
                patientId = PatientId(patientId),
                documentKey = documentKey
            )

            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(
                    ContentDisposition.Parameters.FileName,
                    download.filename
                ).toString()
            )

            call.respondOutputStream(
                contentType = ContentType.parse(download.contentType),
                contentLength = download.contentLength
            ) {
                download.inputStream.use { input ->
                    input.copyTo(this)
                }
            }

            logger.info("GET /patients/$patientId/documents/$documentKey/download - Document downloaded successfully")
        } catch (e: DocumentNotFoundException) {
            logger.warn("GET /patients/$patientId/documents/$documentKey/download - ${e.message}")
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", e.message ?: "Document not found")
            )
        } catch (e: FileStorageException) {
            logger.error("GET /patients/$patientId/documents/$documentKey/download - ${e.message}", e)
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to download document", e.message)
            )
        }
    }
}
