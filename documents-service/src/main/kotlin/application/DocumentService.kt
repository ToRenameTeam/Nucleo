package it.nucleo.application

import it.nucleo.api.dto.CreateDocumentRequest
import it.nucleo.api.dto.CreateMedicinePrescriptionRequest
import it.nucleo.api.dto.CreateReportRequest
import it.nucleo.api.dto.CreateServicePrescriptionRequest
import it.nucleo.api.dto.UpdateReportRequest
import it.nucleo.api.dto.toDomain
import it.nucleo.domain.*
import it.nucleo.domain.errors.*
import it.nucleo.domain.prescription.implementation.FacilityId
import it.nucleo.domain.prescription.implementation.Priority
import it.nucleo.domain.prescription.implementation.ServiceId
import it.nucleo.domain.prescription.implementation.ServicePrescription
import it.nucleo.domain.report.*
import it.nucleo.infrastructure.ai.AiAnalysisResult
import it.nucleo.infrastructure.ai.AiServiceClient
import it.nucleo.infrastructure.logging.logger
import java.time.LocalDate
import java.util.UUID

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

    suspend fun createDocument(
        patientId: PatientId,
        request: CreateDocumentRequest
    ): Either<DomainError, Document> {
        val doctorId = DoctorId(request.doctorId)
        val title = Title(request.title)

        // Generate document ID upfront - needed for PDF storage and AI analysis
        val documentId = DocumentId(UUID.randomUUID().toString())

        // Create document with placeholder metadata initially
        val placeholderMetadata = request.metadata.toDomain()

        val document =
            when (request) {
                is CreateMedicinePrescriptionRequest -> {
                    DocumentFactory.createMedicinePrescription(
                        id = documentId,
                        doctorId = doctorId,
                        patientId = patientId,
                        title = title,
                        metadata = placeholderMetadata,
                        validity = request.validity.toDomain(),
                        dosage = request.dosage.toDomain()
                    )
                }
                is CreateServicePrescriptionRequest -> {
                    DocumentFactory.createServicePrescription(
                        id = documentId,
                        doctorId = doctorId,
                        patientId = patientId,
                        title = title,
                        metadata = placeholderMetadata,
                        validity = request.validity.toDomain(),
                        serviceId = ServiceId(request.serviceId),
                        facilityId = FacilityId(request.facilityId),
                        priority = Priority.valueOf(request.priority)
                    )
                }
                is CreateReportRequest -> {
                    val servicePrescriptionDoc =
                        repository
                            .findDocumentById(patientId, DocumentId(request.servicePrescriptionId))
                            .getOrElse {
                                return failure(it)
                            }

                    if (servicePrescriptionDoc !is ServicePrescription) {
                        return failure(
                            DocumentError.InvalidType(
                                "ServicePrescription",
                                servicePrescriptionDoc::class.simpleName ?: "Unknown"
                            )
                        )
                    }

                    DocumentFactory.createReport(
                        id = documentId,
                        doctorId = doctorId,
                        patientId = patientId,
                        title = title,
                        metadata = placeholderMetadata,
                        servicePrescription = servicePrescriptionDoc,
                        executionDate = ExecutionDate(LocalDate.parse(request.executionDate)),
                        findings = Findings(request.findings),
                        clinicalQuestion = request.clinicalQuestion?.let { ClinicalQuestion(it) },
                        conclusion = request.conclusion?.let { Conclusion(it) },
                        recommendations = request.recommendations?.let { Recommendations(it) }
                    )
                }
            }

        generateAndStorePdf(document).getOrElse {
            return failure(it)
        }

        val finalDocument = analyzeDocumentWithAi(document, patientId)

        repository.addDocument(patientId, finalDocument).getOrElse {
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

    suspend fun updateReport(
        patientId: PatientId,
        documentId: DocumentId,
        request: UpdateReportRequest
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

        request.findings?.let { existingDocument.updateFindings(Findings(it)) }
        request.clinicalQuestion?.let { existingDocument.setClinicalQuestion(ClinicalQuestion(it)) }
        request.conclusion?.let { existingDocument.setConclusion(Conclusion(it)) }
        request.recommendations?.let { existingDocument.setRecommendations(Recommendations(it)) }

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

        return try {
            logger.debug("Requesting AI analysis for document: ${document.id.id}")

            val result =
                aiServiceClient.analyzeDocument(
                    patientId = patientId.id,
                    documentId = document.id.id
                )

            when (result) {
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
        } catch (e: Exception) {
            logger.error("Error during AI analysis for document ${document.id.id}", e)
            document
        }
    }
}
