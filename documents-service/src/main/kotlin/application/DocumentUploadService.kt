package it.nucleo.application

import it.nucleo.domain.DocumentFactory
import it.nucleo.domain.DocumentId
import it.nucleo.domain.DocumentRepository
import it.nucleo.domain.FileMetadata
import it.nucleo.domain.FileStorageException
import it.nucleo.domain.FileStorageRepository
import it.nucleo.domain.PatientId
import it.nucleo.domain.Summary
import it.nucleo.domain.Tag
import it.nucleo.domain.Title
import it.nucleo.domain.uploaded.UploadedDocumentType
import it.nucleo.infrastructure.ai.AiAnalysisResult
import it.nucleo.infrastructure.ai.AiServiceClient
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

    data class AiAnalysisError(val message: String) : UploadResult()
}

class DocumentUploadService(
    private val fileStorageRepository: FileStorageRepository,
    private val documentRepository: DocumentRepository,
    private val aiServiceClient: AiServiceClient? = null
) {

    private val logger = logger()

    companion object {
        const val MAX_FILE_SIZE = 50 * 1024 * 1024L // 50 MB
        const val PDF_CONTENT_TYPE = "application/pdf"
        private val PDF_MAGIC_BYTES = byteArrayOf(0x25, 0x50, 0x44, 0x46) // %PDF

        // Default metadata when AI analysis is not available or fails
        private const val DEFAULT_SUMMARY = "Document uploaded - AI analysis not available"
        private val DEFAULT_TAGS = setOf("uploaded", "unprocessed")
    }

    suspend fun upload(command: UploadDocumentCommand): UploadResult {
        logger.debug(
            "Processing upload for patient: ${command.patientId.id}, filename: ${command.filename}"
        )

        val validationError = validate(command)
        if (validationError != null) {
            return validationError
        }

        val documentId = DocumentId(UUID.randomUUID().toString())

        // Step 1: Store PDF file in MinIO
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
                "PDF uploaded successfully with ID: ${documentId.id}, filename: ${command.filename}"
            )

            // Step 2: Analyze document with AI to extract metadata
            val metadata = analyzeDocumentWithAi(command.patientId, documentId)

            // Step 2.5: Validate that document is medical-related
            if (metadata.summary.summary.isBlank() && metadata.tags.isEmpty()) {
                logger.warn(
                    "Document ${documentId.id} identified as non-medical by AI. Rejecting upload."
                )
                // Delete the PDF from MinIO since we're rejecting it
                try {
                    fileStorageRepository.delete(command.patientId, documentId)
                    logger.debug("Deleted non-medical PDF from MinIO: ${documentId.id}")
                } catch (e: Exception) {
                    logger.error("Failed to delete non-medical PDF from MinIO: ${documentId.id}", e)
                }
                return UploadResult.ValidationError(
                    "The uploaded document does not appear to be a medical document. " +
                        "Only medical documents (reports, prescriptions, clinical notes) are accepted."
                )
            }

            // Step 3: Create document entity with AI-generated metadata and default values
            val document =
                DocumentFactory.createUploadedDocument(
                    id = documentId,
                    patientId = command.patientId,
                    title = Title(command.filename.removeSuffix(".pdf")),
                    filename = command.filename,
                    metadata = metadata,
                    documentType = inferDocumentType(metadata)
                )

            // Step 4: Save document entity to MongoDB
            documentRepository.addDocument(command.patientId, document)
            logger.info(
                "Document entity created and saved successfully: ${documentId.id}, type: ${document.documentType}"
            )

            UploadResult.Success(documentId)
        } catch (e: FileStorageException) {
            logger.error("Failed to upload document for patient: ${command.patientId.id}", e)
            UploadResult.StorageError(e.message ?: "Unknown storage error")
        } catch (e: Exception) {
            logger.error("Failed to create document entity for patient: ${command.patientId.id}", e)
            UploadResult.StorageError("Failed to create document: ${e.message}")
        }
    }

    private suspend fun analyzeDocumentWithAi(
        patientId: PatientId,
        documentId: DocumentId
    ): FileMetadata {
        if (aiServiceClient == null) {
            logger.warn("AI service client not configured, using default metadata")
            return createDefaultMetadata()
        }

        return try {
            logger.debug("Requesting AI analysis for uploaded document: ${documentId.id}")

            val result =
                aiServiceClient.analyzeDocument(
                    patientId = patientId.id,
                    documentId = documentId.id
                )

            when (result) {
                is AiAnalysisResult.Success -> {
                    logger.info(
                        "AI analysis successful for uploaded document ${documentId.id}: " +
                            "summary_length=${result.metadata.summary.summary.length}, " +
                            "tags_count=${result.metadata.tags.size}"
                    )
                    result.metadata
                }
                is AiAnalysisResult.Failure -> {
                    logger.warn(
                        "AI analysis failed for uploaded document ${documentId.id}: " +
                            "${result.errorCode} - ${result.message}. Using default metadata."
                    )
                    createDefaultMetadata()
                }
            }
        } catch (e: Exception) {
            logger.error("Error during AI analysis for uploaded document ${documentId.id}", e)
            createDefaultMetadata()
        }
    }

    private fun createDefaultMetadata(): FileMetadata {
        return FileMetadata(
            summary = Summary(DEFAULT_SUMMARY),
            tags = DEFAULT_TAGS.map { Tag(it) }.toSet()
        )
    }

    private fun inferDocumentType(metadata: FileMetadata): UploadedDocumentType {
        val tags = metadata.tags.map { it.tag.lowercase() }.toSet()
        return when {
            tags.contains("prescription") -> UploadedDocumentType.PRESCRIPTION
            tags.contains("report") -> UploadedDocumentType.REPORT
            else -> UploadedDocumentType.OTHER
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
