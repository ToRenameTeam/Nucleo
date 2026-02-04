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
import it.nucleo.application.upload.UploadEventChannel
import it.nucleo.application.upload.UploadEventFormatter
import it.nucleo.domain.PatientId
import it.nucleo.infrastructure.logging.logger
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.collect

private val logger = logger("it.nucleo.api.routes.UploadRoutes")

private const val PDF_CONTENT_TYPE = "application/pdf"

fun Route.uploadRoutes(uploadService: DocumentUploadService) {
    route("/patients/{patientId}/documents") {
        uploadDocument(uploadService)
        uploadDocumentWithSSE(uploadService)
    }
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
                                        "POST /patients/$patientId/documents/upload - Success, documentId: ${result.documentId.id}"
                                    )
                                    call.respond(
                                        HttpStatusCode.Created,
                                        UploadResponse(
                                            success = true,
                                            message = "Document uploaded successfully",
                                            documentId = result.documentId.id
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
                                is UploadResult.AiAnalysisError -> {
                                    logger.error(
                                        "POST /patients/$patientId/documents/upload - AI analysis failed: ${result.message}"
                                    )
                                    call.respond(
                                        HttpStatusCode.InternalServerError,
                                        ErrorResponse(
                                            "ai_analysis_error",
                                            "Failed to analyze document with AI",
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

/**
 * POST /patients/{patientId}/documents/upload-stream
 * Uploads a PDF document with Server-Sent Events progress tracking.
 */
private fun Route.uploadDocumentWithSSE(uploadService: DocumentUploadService) {
    post("/upload-stream") {
        val patientId =
            call.parameters["patientId"]
                ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        logger.debug("POST /patients/$patientId/documents/upload-stream - Starting SSE upload")

        val multipart =
            try {
                call.receiveMultipart()
            } catch (e: Exception) {
                logger.warn(
                    "POST /patients/$patientId/documents/upload-stream - Invalid multipart request",
                    e
                )
                return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Invalid multipart request", e.message)
                )
            }

        var fileProcessed = false
        var uploadCommand: UploadDocumentCommand? = null

        // First, extract file from multipart
        multipart.forEachPart { part ->
            when (part) {
                is PartData.FileItem -> {
                    if (part.name == "file") {
                        fileProcessed = true
                        val filename = part.originalFileName
                        val contentType = part.contentType?.toString() ?: PDF_CONTENT_TYPE
                        val bytes = part.provider().toByteArray()

                        if (filename != null) {
                            uploadCommand =
                                UploadDocumentCommand(
                                    patientId = PatientId(patientId),
                                    filename = filename,
                                    content = bytes,
                                    contentType = contentType
                                )
                        }
                    }
                    part.dispose()
                }
                else -> part.dispose()
            }
        }

        if (!fileProcessed || uploadCommand == null) {
            logger.warn("POST /patients/$patientId/documents/upload-stream - No file provided")
            return@post call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", "No file provided or invalid filename")
            )
        }

        // Set up SSE response
        call.response.headers.append(HttpHeaders.CacheControl, "no-cache")
        call.response.headers.append(HttpHeaders.Connection, "keep-alive")
        call.response.headers.append("X-Accel-Buffering", "no") // Disable nginx buffering

        call.respondTextWriter(contentType = ContentType.Text.EventStream) {
            val eventChannel = UploadEventChannel()

            coroutineScope {
                // Launch coroutine to collect and send events
                val job = async {
                    try {
                        eventChannel.asFlow().collect { event ->
                            val sseMessage = UploadEventFormatter.format(event)
                            write(sseMessage)
                            flush()
                        }
                    } catch (e: Exception) {
                        logger.error("Error streaming events for patient $patientId", e)
                    }
                }

                // Start upload with events
                uploadService.uploadWithEvents(uploadCommand!!, eventChannel)

                // Wait for all events to be sent
                job.await()
            }
        }
    }
}
