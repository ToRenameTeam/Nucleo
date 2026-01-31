package it.nucleo.application

import it.nucleo.domain.DocumentId
import it.nucleo.domain.FileStorageException
import it.nucleo.domain.FileStorageRepository
import it.nucleo.domain.PatientId
import it.nucleo.infrastructure.logging.logger
import java.util.UUID

data class UploadDocumentCommand(
    val patientId: PatientId,
    val filename: String,
    val content: ByteArray,
    val contentType: String
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as UploadDocumentCommand
        return patientId == other.patientId &&
            filename == other.filename &&
            content.contentEquals(other.content) &&
            contentType == other.contentType
    }

    override fun hashCode(): Int {
        var result = patientId.hashCode()
        result = 31 * result + filename.hashCode()
        result = 31 * result + content.contentHashCode()
        result = 31 * result + contentType.hashCode()
        return result
    }
}

sealed class UploadResult {
    data class Success(val documentId: DocumentId) : UploadResult()

    data class ValidationError(val message: String) : UploadResult()

    data class StorageError(val message: String) : UploadResult()
}

class DocumentUploadService(private val fileStorageRepository: FileStorageRepository) {

    private val logger = logger()

    companion object {
        const val MAX_FILE_SIZE = 50 * 1024 * 1024L // 50 MB
        const val PDF_CONTENT_TYPE = "application/pdf"
        private val PDF_MAGIC_BYTES = byteArrayOf(0x25, 0x50, 0x44, 0x46) // %PDF
    }

    fun upload(command: UploadDocumentCommand): UploadResult {
        logger.debug(
            "Processing upload for patient: ${command.patientId.id}, filename: ${command.filename}"
        )

        val validationError = validate(command)
        if (validationError != null) {
            return validationError
        }

        val documentId = DocumentId(UUID.randomUUID().toString())

        return try {
            fileStorageRepository.store(
                patientId = command.patientId,
                documentId = documentId,
                filename = command.filename,
                inputStream = command.content.inputStream(),
                contentLength = command.content.size.toLong(),
                contentType = PDF_CONTENT_TYPE
            )
            logger.info(
                "Document uploaded successfully with ID: ${documentId.id}, filename: ${command.filename}"
            )
            UploadResult.Success(documentId)
        } catch (e: FileStorageException) {
            logger.error("Failed to upload document for patient: ${command.patientId.id}", e)
            UploadResult.StorageError(e.message ?: "Unknown storage error")
        }
    }

    private fun validate(command: UploadDocumentCommand): UploadResult.ValidationError? {
        if (!command.filename.lowercase().endsWith(".pdf")) {
            return UploadResult.ValidationError("Only PDF files are accepted")
        }

        if (command.contentType != PDF_CONTENT_TYPE) {
            return UploadResult.ValidationError("Content type must be application/pdf")
        }

        if (command.content.isEmpty()) {
            return UploadResult.ValidationError("File is empty")
        }

        if (command.content.size > MAX_FILE_SIZE) {
            return UploadResult.ValidationError("File size exceeds maximum allowed (50 MB)")
        }

        if (!isPdfFile(command.content)) {
            return UploadResult.ValidationError("File does not appear to be a valid PDF")
        }

        return null
    }

    private fun isPdfFile(bytes: ByteArray): Boolean {
        if (bytes.size < PDF_MAGIC_BYTES.size) return false
        return bytes.take(PDF_MAGIC_BYTES.size).toByteArray().contentEquals(PDF_MAGIC_BYTES)
    }
}
