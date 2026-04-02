package it.nucleo.documents.application

import it.nucleo.commons.errors.*
import it.nucleo.commons.logging.logger
import it.nucleo.documents.domain.DocumentFactory
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.DocumentRepository
import it.nucleo.documents.domain.FileMetadata
import it.nucleo.documents.domain.FileStorageRepository
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.Summary
import it.nucleo.documents.domain.Tag
import it.nucleo.documents.domain.Title
import it.nucleo.documents.domain.uploaded.UploadedDocumentType
import it.nucleo.documents.infrastructure.ai.AiAnalysisResult
import it.nucleo.documents.infrastructure.ai.AiServiceClient
import it.nucleo.documents.infrastructure.kafka.NotificationEventsPublisher
import java.time.OffsetDateTime
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

class DocumentUploadService(
    private val fileStorageRepository: FileStorageRepository,
    private val documentRepository: DocumentRepository,
    private val aiServiceClient: AiServiceClient? = null,
    private val notificationEventsPublisher: NotificationEventsPublisher? = null
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

    suspend fun upload(command: UploadDocumentCommand): Either<DomainError, DocumentId> {
        logger.debug(
            "Processing upload for patient: ${command.patientId.id}, filename: ${command.filename}"
        )

        validate(command)?.let {
            return failure(it)
        }

        val documentId =
            DocumentId(UUID.randomUUID().toString()).getOrElse {
                return failure(it)
            }

        // Step 1: Store PDF file in MinIO
        fileStorageRepository
            .store(
                patientId = command.patientId,
                documentId = documentId,
                filename = command.filename,
                inputStream = command.content.inputStream(),
                contentLength = command.content.size.toLong(),
                contentType = PDF_CONTENT_TYPE
            )
            .getOrElse {
                return failure(it)
            }

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
            fileStorageRepository.delete(command.patientId, documentId).onFailure {
                logger.error("Failed to delete non-medical PDF from MinIO: ${documentId.id}")
            }
            return failure(
                ValidationError(
                    "The uploaded document does not appear to be a medical document. " +
                        "Only medical documents (reports, prescriptions, clinical notes) are accepted."
                )
            )
        }

        // Step 3: Create document entity with AI-generated metadata and default values
        val title =
            Title(command.filename.removeSuffix(".pdf")).getOrElse {
                return failure(it)
            }
        val document =
            DocumentFactory.createUploadedDocument(
                    id = documentId,
                    patientId = command.patientId,
                    title = title,
                    filename = command.filename,
                    metadata = metadata,
                    documentType = inferDocumentType(metadata)
                )
                .getOrElse {
                    return failure(it)
                }

        // Step 4: Save document entity to MongoDB
        documentRepository.addDocument(command.patientId, document).getOrElse {
            return failure(it)
        }

        notificationEventsPublisher?.publish(
            receiver = command.patientId.id,
            title = "Nuovo documento disponibile",
            content = "E stato caricato un nuovo referto: ${command.filename}"
        )

        logger.info(
            "Document entity created and saved successfully: ${documentId.id}, type: ${document.documentType}"
        )
        return success(documentId)
    }

    private suspend fun analyzeDocumentWithAi(
        patientId: PatientId,
        documentId: DocumentId
    ): FileMetadata {
        if (aiServiceClient == null) {
            logger.warn("AI service client not configured, using default metadata")
            return createDefaultMetadata()
        }

        logger.debug("Requesting AI analysis for uploaded document: ${documentId.id}")

        val result =
            aiServiceClient.analyzeDocument(patientId = patientId.id, documentId = documentId.id)

        return when (result) {
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
    }

    private fun createDefaultMetadata(): FileMetadata {
        val summary =
            Summary(DEFAULT_SUMMARY).getOrElse {
                throw IllegalStateException("Invalid default summary metadata: ${it.message}")
            }
        val tags =
            DEFAULT_TAGS.map {
                    Tag(it).getOrElse { error ->
                        throw IllegalStateException(
                            "Invalid default tag metadata: ${error.message}"
                        )
                    }
                }
                .toSet()

        return FileMetadata(summary = summary, tags = tags).getOrElse {
            throw IllegalStateException("Invalid default metadata: ${it.message}")
        }
    }

    private fun inferDocumentType(metadata: FileMetadata): UploadedDocumentType {
        val tags = metadata.tags.map { it.tag.lowercase() }.toSet()
        return when {
            tags.contains("prescription") -> UploadedDocumentType.PRESCRIPTION
            tags.contains("report") -> UploadedDocumentType.REPORT
            else -> UploadedDocumentType.OTHER
        }
    }

                val uploadedAt = OffsetDateTime.now()

    private fun validate(command: UploadDocumentCommand): ValidationError? {
        if (!command.filename.lowercase().endsWith(".pdf")) {
            return ValidationError("Only PDF files are accepted")
        }
                        "Referto '${command.filename}' caricato il ${uploadedAt.toLocalDate()} alle ${uploadedAt.toLocalTime().toString().take(5)}"
        if (command.contentType != PDF_CONTENT_TYPE) {
            return ValidationError("Content type must be application/pdf")
        }

        if (command.content.isEmpty()) {
            return ValidationError("File is empty")
        }

        if (command.content.size > MAX_FILE_SIZE) {
            return ValidationError("File size exceeds maximum allowed (50 MB)")
        }

        if (!isPdfFile(command.content)) {
            return ValidationError("File does not appear to be a valid PDF")
        }

        return null
    }

    private fun isPdfFile(bytes: ByteArray): Boolean {
        if (bytes.size < PDF_MAGIC_BYTES.size) return false
        return bytes.take(PDF_MAGIC_BYTES.size).toByteArray().contentEquals(PDF_MAGIC_BYTES)
    }
}
