package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.api.dto.UploadResponse
import it.nucleo.domain.PatientId
import it.nucleo.infrastructure.logging.logger
import it.nucleo.infrastructure.persistence.minio.FileStorageException
import it.nucleo.infrastructure.persistence.minio.MinioFileStorageService

private val logger = logger("it.nucleo.api.routes.UploadRoutes")

private const val MAX_FILE_SIZE = 50 * 1024 * 1024L // 50 MB
private const val PDF_CONTENT_TYPE = "application/pdf"

fun Route.uploadRoutes(fileStorageService: MinioFileStorageService) {
    route("/patients/{patientId}/documents") {
        uploadDocument(fileStorageService)
    }
}

/**
 * POST /patients/{patientId}/documents/upload
 * Uploads a PDF document for a patient.
 *
 * The request must be a multipart form with a file part named "file".
 * Only PDF files are accepted.
 *
 * The upload can be performed by a patient or by a doctor on behalf of a patient.
 */
private fun Route.uploadDocument(fileStorageService: MinioFileStorageService) {
    post("/upload") {
        val patientId = call.parameters["patientId"]
            ?: return@post call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", "Patient ID is required")
            )

        logger.debug("POST /patients/$patientId/documents/upload - Uploading document")

        val multipart = try {
            call.receiveMultipart()
        } catch (e: Exception) {
            logger.warn("POST /patients/$patientId/documents/upload - Invalid multipart request", e)
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
                        val result = processFileUpload(part, patientId, fileStorageService)
                        fileProcessed = true

                        when (result) {
                            is UploadResult.Success -> {
                                logger.info("POST /patients/$patientId/documents/upload - Document uploaded successfully")
                                call.respond(
                                    HttpStatusCode.Created,
                                    UploadResponse(success = true, message = "Document uploaded successfully")
                                )
                            }
                            is UploadResult.ValidationError -> {
                                logger.warn("POST /patients/$patientId/documents/upload - ${result.message}")
                                call.respond(
                                    HttpStatusCode.BadRequest,
                                    ErrorResponse("bad_request", result.message)
                                )
                            }
                            is UploadResult.StorageError -> {
                                logger.error("POST /patients/$patientId/documents/upload - ${result.message}")
                                call.respond(
                                    HttpStatusCode.InternalServerError,
                                    ErrorResponse("internal_error", "Failed to upload document", result.message)
                                )
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
                ErrorResponse("bad_request", "No file provided. Please include a 'file' field in the multipart request.")
            )
        }
    }
}

private sealed class UploadResult {
    data object Success : UploadResult()
    data class ValidationError(val message: String) : UploadResult()
    data class StorageError(val message: String) : UploadResult()
}

private suspend fun processFileUpload(
    filePart: PartData.FileItem,
    patientId: String,
    fileStorageService: MinioFileStorageService
): UploadResult {
    val filename = filePart.originalFileName
        ?: return UploadResult.ValidationError("Filename is required")

    if (!filename.lowercase().endsWith(".pdf")) {
        return UploadResult.ValidationError("Only PDF files are accepted")
    }

    val contentType = filePart.contentType?.toString() ?: PDF_CONTENT_TYPE
    if (contentType != PDF_CONTENT_TYPE) {
        return UploadResult.ValidationError("Content type must be application/pdf")
    }

    val bytes = filePart.provider().toByteArray()

    if (bytes.isEmpty()) {
        return UploadResult.ValidationError("File is empty")
    }

    if (bytes.size > MAX_FILE_SIZE) {
        return UploadResult.ValidationError("File size exceeds maximum allowed (50 MB)")
    }

    // Validate PDF magic bytes
    if (!isPdfFile(bytes)) {
        return UploadResult.ValidationError("File does not appear to be a valid PDF")
    }

    return try {
        fileStorageService.uploadDocument(
            patientId = PatientId(patientId),
            filename = filename,
            inputStream = bytes.inputStream(),
            contentLength = bytes.size.toLong(),
            contentType = PDF_CONTENT_TYPE
        )
        UploadResult.Success
    } catch (e: FileStorageException) {
        UploadResult.StorageError(e.message ?: "Unknown storage error")
    }
}

/**
 * Validates that the file starts with PDF magic bytes (%PDF-).
 */
private fun isPdfFile(bytes: ByteArray): Boolean {
    if (bytes.size < 4) return false
    return bytes[0] == 0x25.toByte() && // %
           bytes[1] == 0x50.toByte() && // P
           bytes[2] == 0x44.toByte() && // D
           bytes[3] == 0x46.toByte()    // F
}
