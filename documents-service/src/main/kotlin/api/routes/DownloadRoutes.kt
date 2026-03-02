package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.application.DocumentDownloadService
import it.nucleo.application.DownloadDocumentQuery
import it.nucleo.domain.DocumentId
import it.nucleo.domain.PatientId
import it.nucleo.domain.errors.*
import it.nucleo.infrastructure.logging.logger

private val logger = logger("it.nucleo.api.routes.DownloadRoutes")

fun Route.downloadRoutes(downloadService: DocumentDownloadService) {
    route("/patients/{patientId}/documents") { downloadDocument(downloadService) }
}

/**
 * GET /patients/{patientId}/documents/{documentId}/pdf Downloads the PDF for a specific document by
 * document ID.
 */
private fun Route.downloadDocument(downloadService: DocumentDownloadService) {
    get("/{documentId}/pdf") {
        val patientId =
            call.parameters["patientId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        val documentId =
            call.parameters["documentId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Document ID is required")
                )

        logger.debug("GET /patients/$patientId/documents/$documentId/pdf")

        val query =
            DownloadDocumentQuery(
                patientId = PatientId(patientId),
                documentId = DocumentId(documentId)
            )

        when (val result = downloadService.download(query)) {
            is Either.Right -> {
                val file = result.value
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

                logger.info("GET /patients/$patientId/documents/$documentId/pdf - Success")
            }
            is Either.Left -> {
                val error = result.error
                val status = error.toHttpStatusCode()
                if (status.value >= 500) {
                    logger.error(
                        "GET /patients/$patientId/documents/$documentId/pdf - ${error.message}"
                    )
                } else {
                    logger.warn(
                        "GET /patients/$patientId/documents/$documentId/pdf - ${error.message}"
                    )
                }
                call.respond(
                    status,
                    ErrorResponse(error = error.errorCode, message = error.message)
                )
            }
        }
    }
}
