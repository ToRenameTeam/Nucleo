package it.nucleo.documents.application

import it.nucleo.commons.errors.*
import it.nucleo.commons.logging.logger
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.errors.*
import it.nucleo.documents.domain.prescription.implementation.ServicePrescription
import it.nucleo.documents.domain.report.Report
import it.nucleo.documents.infrastructure.ai.AiAnalysisResult
import it.nucleo.documents.infrastructure.ai.AiServiceClient

class DocumentService(
    private val repository: DocumentRepository,
    private val fileStorageRepository: FileStorageRepository,
    private val pdfGenerator: DocumentPdfGenerator,
    private val aiServiceClient: AiServiceClient? = null
) {
    private val logger = logger()

    suspend fun getAllDocumentsByPatient(
        patientId: PatientId
    ): Either<DomainError, List<Document>> {
        return repository.findAllDocumentsByPatient(patientId)
    }

    suspend fun getAllDocumentsByDoctor(doctorId: DoctorId): Either<DomainError, List<Document>> {
        return repository.findAllDocumentsByDoctor(doctorId)
    }

    suspend fun getDocumentById(
        patientId: PatientId,
        documentId: DocumentId
    ): Either<DomainError, Document> {
        return repository.findDocumentById(patientId, documentId)
    }

    /**
     * Resolves an existing [ServicePrescription] by [documentId] for the given [patientId]. Exposed
     * so that the api layer can use it as a resolver callback when building a Report document
     * before calling [createDocument].
     */
    suspend fun getServicePrescription(
        patientId: PatientId,
        documentId: DocumentId,
    ): Either<DocumentError, ServicePrescription> {
        val doc =
            repository.findDocumentById(patientId, documentId).getOrElse {
                return failure(
                    it as? DocumentError ?: DocumentError.NotFound(patientId.id, documentId.id)
                )
            }
        return if (doc is ServicePrescription) success(doc)
        else
            failure(
                DocumentError.InvalidType("ServicePrescription", doc::class.simpleName ?: "Unknown")
            )
    }

    /**
     * Persists a fully-constructed domain [Document], generates its PDF and runs AI analysis. The
     * caller (api layer) is responsible for building the [Document] via [DocumentFactory].
     */
    suspend fun createDocument(
        document: Document,
    ): Either<DomainError, Document> {
        generateAndStorePdf(document).getOrElse {
            return failure(it)
        }

        val finalDocument = analyzeDocumentWithAi(document, document.patientId)

        repository.addDocument(document.patientId, finalDocument).getOrElse {
            return failure(it)
        }

        return success(finalDocument)
    }

    suspend fun deleteDocument(
        patientId: PatientId,
        documentId: DocumentId
    ): Either<DomainError, Unit> {
        return repository.deleteDocument(patientId, documentId)
    }

    /**
     * Updates the editable fields of a [Report] using domain value objects from
     * [UpdateReportCommand].
     */
    suspend fun updateReport(
        patientId: PatientId,
        documentId: DocumentId,
        command: UpdateReportCommand,
    ): Either<DomainError, Report> {
        val existingDocument =
            repository.findDocumentById(patientId, documentId).getOrElse {
                return failure(it)
            }

        if (existingDocument !is Report) {
            return failure(
                DocumentError.InvalidType("Report", existingDocument::class.simpleName ?: "Unknown")
            )
        }

        command.findings?.let { existingDocument.updateFindings(it) }
        command.clinicalQuestion?.let { existingDocument.setClinicalQuestion(it) }
        command.conclusion?.let { existingDocument.setConclusion(it) }
        command.recommendations?.let { existingDocument.setRecommendations(it) }

        repository.updateReport(patientId, existingDocument).getOrElse {
            return failure(it)
        }

        // Regenerate PDF after update
        generateAndStorePdf(existingDocument).getOrElse {
            return failure(it)
        }

        // Re-analyze with AI after update
        val updatedDocument = analyzeDocumentWithAi(existingDocument, patientId) as Report
        repository.updateReport(patientId, updatedDocument).getOrElse {
            return failure(it)
        }

        return success(updatedDocument)
    }

    private fun generateAndStorePdf(document: Document): Either<DomainError, Unit> {
        logger.debug("Generating PDF for document: ${document.id.id}")
        val pdfBytes = pdfGenerator.generate(document)
        val filename = "${document.id.id}.pdf"

        return fileStorageRepository
            .store(
                patientId = document.patientId,
                documentId = document.id,
                filename = filename,
                inputStream = pdfBytes.inputStream(),
                contentLength = pdfBytes.size.toLong(),
                contentType = "application/pdf"
            )
            .onSuccess { logger.info("PDF stored successfully for document: ${document.id.id}") }
            .onFailure {
                logger.error("Failed to generate/store PDF for document: ${document.id.id}")
            }
    }

    private suspend fun analyzeDocumentWithAi(document: Document, patientId: PatientId): Document {
        if (aiServiceClient == null) {
            logger.warn("AI service client not configured, using provided metadata")
            return document
        }

        logger.debug("Requesting AI analysis for document: ${document.id.id}")

        val result =
            aiServiceClient.analyzeDocument(patientId = patientId.id, documentId = document.id.id)

        return when (result) {
            is AiAnalysisResult.Success -> {
                logger.info(
                    "AI analysis successful for document ${document.id.id}: " +
                        "summary_length=${result.metadata.summary.summary.length}, " +
                        "tags_count=${result.metadata.tags.size}"
                )
                document.withMetadata(result.metadata)
            }
            is AiAnalysisResult.Failure -> {
                logger.warn(
                    "AI analysis failed for document ${document.id.id}: " +
                        "${result.errorCode} - ${result.message}. Using provided metadata."
                )
                document
            }
        }
    }
}
