package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.api.dto.UploadResponse
import it.nucleo.application.DocumentUploadService
import it.nucleo.application.UploadDocumentCommand
import it.nucleo.application.UploadResult
import it.nucleo.domain.PatientId
import it.nucleo.infrastructure.logging.logger

private val logger = logger("it.nucleo.api.routes.UploadRoutes")

private const val PDF_CONTENT_TYPE = "application/pdf"

fun Route.uploadRoutes(uploadService: DocumentUploadService) {
    route("/patients/{patientId}/documents") { uploadDocument(uploadService) }
}

/** POST /patients/{patientId}/documents/upload Uploads a PDF document for a patient. */
private fun Route.uploadDocument(uploadService: DocumentUploadService) {
    post("/upload") {
        val patientId =
            call.parameters["patientId"]
                ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        logger.debug("POST /patients/$patientId/documents/upload - Uploading document")

        val multipart =
            try {
                call.receiveMultipart()
            } catch (e: Exception) {
                logger.warn(
                    "POST /patients/$patientId/documents/upload - Invalid multipart request",
                    e
                )
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

                            when (val result = uploadService.upload(command)) {
                                is UploadResult.Success -> {
                                    logger.info(
                                        "POST /patients/$patientId/documents/upload - Success"
                                    )
                                    call.respond(
                                        HttpStatusCode.Created,
                                        UploadResponse(
                                            success = true,
                                            message = "Document uploaded successfully"
                                        )
                                    )
                                }
                                is UploadResult.ValidationError -> {
                                    logger.warn(
                                        "POST /patients/$patientId/documents/upload - ${result.message}"
                                    )
                                    call.respond(
                                        HttpStatusCode.BadRequest,
                                        ErrorResponse("bad_request", result.message)
                                    )
                                }
                                is UploadResult.StorageError -> {
                                    logger.error(
                                        "POST /patients/$patientId/documents/upload - ${result.message}"
                                    )
                                    call.respond(
                                        HttpStatusCode.InternalServerError,
                                        ErrorResponse(
                                            "internal_error",
                                            "Failed to upload document",
                                            result.message
                                        )
                                    )
                                }
                            }
                        }
                    }
                    part.dispose()
                }
                else -> part.dispose()
            }
        }

        if (!fileProcessed) {
            logger.warn("POST /patients/$patientId/documents/upload - No file provided")
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
