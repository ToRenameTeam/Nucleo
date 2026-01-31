package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.application.DocumentDownloadService
import it.nucleo.application.DownloadDocumentQuery
import it.nucleo.application.DownloadResult
import it.nucleo.domain.PatientId
import it.nucleo.infrastructure.logging.logger

private val logger = logger("it.nucleo.api.routes.DownloadRoutes")

fun Route.downloadRoutes(downloadService: DocumentDownloadService) {
    route("/patients/{patientId}/documents") { downloadDocument(downloadService) }
}

/**
 * GET /patients/{patientId}/documents/{documentKey}/download Downloads a specific document from
 * storage.
 */
private fun Route.downloadDocument(downloadService: DocumentDownloadService) {
    get("/{documentKey}/download") {
        val patientId =
            call.parameters["patientId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        val documentKey =
            call.parameters["documentKey"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Document key is required")
                )

        logger.debug("GET /patients/$patientId/documents/$documentKey/download")

        val query =
            DownloadDocumentQuery(patientId = PatientId(patientId), documentKey = documentKey)

        when (val result = downloadService.download(query)) {
            is DownloadResult.Success -> {
                val file = result.file
                call.response.header(
                    HttpHeaders.ContentDisposition,
                    ContentDisposition.Attachment.withParameter(
                            ContentDisposition.Parameters.FileName,
                            file.filename
                        )
                        .toString()
                )

                call.respondOutputStream(
                    contentType = ContentType.parse(file.contentType),
                    contentLength = file.contentLength
                ) {
                    file.inputStream.use { input -> input.copyTo(this) }
                }

                logger.info("GET /patients/$patientId/documents/$documentKey/download - Success")
            }
            is DownloadResult.NotFound -> {
                logger.warn(
                    "GET /patients/$patientId/documents/$documentKey/download - ${result.message}"
                )
                call.respond(HttpStatusCode.NotFound, ErrorResponse("not_found", result.message))
            }
            is DownloadResult.StorageError -> {
                logger.error(
                    "GET /patients/$patientId/documents/$documentKey/download - ${result.message}"
                )
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse("internal_error", "Failed to download document", result.message)
                )
            }
        }
    }
}
