package it.nucleo.application

import it.nucleo.api.dto.CreateDocumentRequest
import it.nucleo.api.dto.CreateMedicinePrescriptionRequest
import it.nucleo.api.dto.CreateReportRequest
import it.nucleo.api.dto.CreateServicePrescriptionRequest
import it.nucleo.api.dto.UpdateReportRequest
import it.nucleo.api.dto.toDomain
import it.nucleo.domain.*
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

    suspend fun getAllDocumentsByPatient(patientId: PatientId): Iterable<Document> {
        return repository.findAllDocumentsByPatient(patientId)
    }

    suspend fun getDocumentById(patientId: PatientId, documentId: DocumentId): Document {
        return repository.findDocumentById(patientId, documentId)
    }

    suspend fun createDocument(patientId: PatientId, request: CreateDocumentRequest): Document {
        val doctorId = DoctorId(request.doctorId)

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
                        metadata = placeholderMetadata,
                        validity = request.validity.toDomain(),
                        serviceId = ServiceId(request.serviceId),
                        facilityId = FacilityId(request.facilityId),
                        priority = Priority.valueOf(request.priority)
                    )
                }
                is CreateReportRequest -> {
                    val servicePrescriptionDoc =
                        repository.findDocumentById(
                            patientId,
                            DocumentId(request.servicePrescriptionId)
                        )

                    if (servicePrescriptionDoc !is ServicePrescription) {
                        throw IllegalArgumentException(
                            "Document '${request.servicePrescriptionId}' is not a service prescription"
                        )
                    }

                    DocumentFactory.createReport(
                        id = documentId,
                        doctorId = doctorId,
                        patientId = patientId,
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

        generateAndStorePdf(document)

        val finalDocument = analyzeDocumentWithAi(document, patientId)

        repository.addDocument(patientId, finalDocument)

        return finalDocument
    }

    suspend fun deleteDocument(patientId: PatientId, documentId: DocumentId) {
        repository.deleteDocument(patientId, documentId)
    }

    suspend fun updateReport(
        patientId: PatientId,
        documentId: DocumentId,
        request: UpdateReportRequest
    ): Report {
        val existingDocument = repository.findDocumentById(patientId, documentId)

        if (existingDocument !is Report) {
            throw IllegalArgumentException("Only reports can be updated")
        }

        request.findings?.let { existingDocument.updateFindings(Findings(it)) }
        request.clinicalQuestion?.let { existingDocument.setClinicalQuestion(ClinicalQuestion(it)) }
        request.conclusion?.let { existingDocument.setConclusion(Conclusion(it)) }
        request.recommendations?.let { existingDocument.setRecommendations(Recommendations(it)) }

        repository.updateReport(patientId, existingDocument)

        // Regenerate PDF after update
        generateAndStorePdf(existingDocument)

        // Re-analyze with AI after update
        val updatedDocument = analyzeDocumentWithAi(existingDocument, patientId) as Report
        repository.updateReport(patientId, updatedDocument)

        return updatedDocument
    }

    private fun generateAndStorePdf(document: Document) {
        try {
            logger.debug("Generating PDF for document: ${document.id.id}")
            val pdfBytes = pdfGenerator.generate(document)
            val filename = "${document.id.id}.pdf"

            fileStorageRepository.store(
                patientId = document.patientId,
                documentId = document.id,
                filename = filename,
                inputStream = pdfBytes.inputStream(),
                contentLength = pdfBytes.size.toLong(),
                contentType = "application/pdf"
            )
            logger.info("PDF stored successfully for document: ${document.id.id}")
        } catch (e: Exception) {
            logger.error("Failed to generate/store PDF for document: ${document.id.id}", e)
            throw e
        }
    }

    private suspend fun analyzeDocumentWithAi(document: Document, patientId: PatientId): Document {
        if (aiServiceClient == null) {
            logger.warn("AI service client not configured, using provided metadata")
            return document
        }

        return try {
            logger.debug("Requesting AI analysis for document: ${document.id.id}")

            val result = aiServiceClient.analyzeDocument(
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
            // Fallback to original metadata if AI fails
            document
        }
    }
}
