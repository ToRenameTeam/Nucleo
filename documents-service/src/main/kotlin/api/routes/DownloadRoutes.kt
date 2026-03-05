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

/**
 * Registers download-related routes under `/patients/{patientId}/documents`.
 * - `GET /patients/{patientId}/documents/{documentId}/pdf` – stream the PDF for a document
 */
fun Route.downloadRoutes(downloadService: DocumentDownloadService) {
    route("/patients/{patientId}/documents") {

        // GET /patients/{patientId}/documents/{documentId}/pdf
        // Streams the PDF file associated with the given document.
        // Sets Content-Disposition: attachment with the original filename.
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
                }
                is Either.Left -> {
                    val error = result.error
                    val status = error.toHttpStatusCode()
                    call.respond(
                        status,
                        ErrorResponse(error = error.errorCode, message = error.message)
                    )
                }
            }
        }
    }
}
