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
import java.time.LocalDate

class DocumentService(private val repository: DocumentRepository) {

    suspend fun getAllDocumentsByPatient(patientId: PatientId): Iterable<Document> {
        return repository.findAllDocumentsByPatient(patientId)
    }

    suspend fun getDocumentById(patientId: PatientId, documentId: DocumentId): Document {
        return repository.findDocumentById(patientId, documentId)
    }

    suspend fun createDocument(patientId: PatientId, request: CreateDocumentRequest): Document {
        val doctorId = DoctorId(request.doctorId)
        val metadata = request.metadata.toDomain()

        val document =
            when (request) {
                is CreateMedicinePrescriptionRequest -> {
                    DocumentFactory.createMedicinePrescription(
                        doctorId = doctorId,
                        patientId = patientId,
                        metadata = metadata,
                        validity = request.validity.toDomain(),
                        dosage = request.dosage.toDomain()
                    )
                }
                is CreateServicePrescriptionRequest -> {
                    DocumentFactory.createServicePrescription(
                        doctorId = doctorId,
                        patientId = patientId,
                        metadata = metadata,
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
                        doctorId = doctorId,
                        patientId = patientId,
                        metadata = metadata,
                        servicePrescription = servicePrescriptionDoc,
                        executionDate = ExecutionDate(LocalDate.parse(request.executionDate)),
                        findings = Findings(request.findings),
                        clinicalQuestion = request.clinicalQuestion?.let { ClinicalQuestion(it) },
                        conclusion = request.conclusion?.let { Conclusion(it) },
                        recommendations = request.recommendations?.let { Recommendations(it) }
                    )
                }
            }

        repository.addDocument(patientId, document)
        return document
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

        return existingDocument
    }
}
