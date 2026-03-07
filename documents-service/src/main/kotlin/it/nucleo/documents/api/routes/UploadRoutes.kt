package it.nucleo.documents.api.routes

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import it.nucleo.documents.api.dto.ErrorResponse
import it.nucleo.documents.api.dto.UploadResponse
import it.nucleo.documents.api.respondEither
import it.nucleo.documents.application.DocumentUploadService
import it.nucleo.documents.application.UploadDocumentCommand
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.errors.map

private const val PDF_CONTENT_TYPE = "application/pdf"

/**
 * Registers upload-related routes under `/patients/{patientId}/documents`.
 * - `POST /patients/{patientId}/documents/upload` – upload a PDF document for a patient
 */
fun Route.uploadRoutes(uploadService: DocumentUploadService) {
    route("/patients/{patientId}/documents") {

        // POST /patients/{patientId}/documents/upload
        // Accepts a multipart/form-data request with a "file" field containing a PDF document.
        // Returns the generated document ID on success.
        post("/upload") {
            val patientId =
                call.parameters["patientId"]
                    ?: return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse("bad_request", "Patient ID is required")
                    )

            val multipart =
                try {
                    call.receiveMultipart()
                } catch (e: Exception) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse("bad_request", "Invalid multipart request", e.message)
                    )
                }

            var fileProcessed = false

            multipart.forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        if (part.name == "file") {
                            fileProcessed = true
                            val filename = part.originalFileName
                            val contentType = part.contentType?.toString() ?: PDF_CONTENT_TYPE
                            val bytes = part.provider().toByteArray()

                            if (filename == null) {
                                call.respond(
                                    HttpStatusCode.BadRequest,
                                    ErrorResponse("bad_request", "Filename is required")
                                )
                            } else {
                                val command =
                                    UploadDocumentCommand(
                                        patientId = PatientId(patientId),
                                        filename = filename,
                                        content = bytes,
                                        contentType = contentType
                                    )

                                val result =
                                    uploadService.upload(command).map { documentId ->
                                        UploadResponse(
                                            success = true,
                                            message = "Document uploaded successfully",
                                            documentId = documentId.id
                                        )
                                    }

                                call.respondEither(result, HttpStatusCode.Created)
                            }
                        }
                        part.dispose()
                    }
                    else -> part.dispose()
                }
            }

            if (!fileProcessed) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        "bad_request",
                        "No file provided. Please include a 'file' field in the multipart request."
                    )
                )
            }
        }
    }
}
