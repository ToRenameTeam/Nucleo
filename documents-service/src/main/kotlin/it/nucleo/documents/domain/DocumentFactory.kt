package it.nucleo.documents.domain

import it.nucleo.commons.errors.DomainError
import it.nucleo.commons.errors.Either
import it.nucleo.commons.errors.failure
import it.nucleo.commons.errors.getOrElse
import it.nucleo.commons.errors.success
import it.nucleo.documents.domain.prescription.Prescription
import it.nucleo.documents.domain.prescription.Validity
import it.nucleo.documents.domain.prescription.implementation.Dosage
import it.nucleo.documents.domain.prescription.implementation.FacilityId
import it.nucleo.documents.domain.prescription.implementation.MedicinePrescription
import it.nucleo.documents.domain.prescription.implementation.Priority
import it.nucleo.documents.domain.prescription.implementation.ServiceId
import it.nucleo.documents.domain.prescription.implementation.ServicePrescription
import it.nucleo.documents.domain.report.ClinicalQuestion
import it.nucleo.documents.domain.report.Conclusion
import it.nucleo.documents.domain.report.ExecutionDate
import it.nucleo.documents.domain.report.Findings
import it.nucleo.documents.domain.report.Recommendations
import it.nucleo.documents.domain.report.Report
import it.nucleo.documents.domain.report.implementation.DefaultReport
import it.nucleo.documents.domain.uploaded.UploadedDocument
import it.nucleo.documents.domain.uploaded.UploadedDocumentType
import java.util.UUID

object DocumentFactory {

    private val UNKNOWN_DOCTOR_ID =
        DoctorId("UNKNOWN").getOrElse {
            throw IllegalStateException("Invalid static UNKNOWN_DOCTOR_ID: ${it.message}")
        }

    fun createMedicinePrescription(
        id: DocumentId = generateDocumentId(),
        doctorId: DoctorId,
        patientId: PatientId,
        title: Title,
        metadata: FileMetadata,
        validity: Validity,
        dosage: Dosage,
        issueDate: IssueDate = IssueDate.now()
    ): Either<DomainError, Prescription> =
        success(
            MedicinePrescription(
                id = id,
                doctorId = doctorId,
                patientId = patientId,
                issueDate = issueDate,
                title = title,
                metadata = metadata,
                validity = validity,
                dosage = dosage
            )
        )

    fun createServicePrescription(
        id: DocumentId = generateDocumentId(),
        doctorId: DoctorId,
        patientId: PatientId,
        title: Title,
        metadata: FileMetadata,
        validity: Validity,
        serviceId: ServiceId,
        facilityId: FacilityId,
        priority: Priority = Priority.ROUTINE,
        issueDate: IssueDate = IssueDate.now()
    ): Either<DomainError, Prescription> =
        success(
            ServicePrescription(
                id = id,
                doctorId = doctorId,
                patientId = patientId,
                issueDate = issueDate,
                title = title,
                metadata = metadata,
                validity = validity,
                serviceId = serviceId,
                facilityId = facilityId,
                priority = priority
            )
        )

    fun createReport(
        id: DocumentId = generateDocumentId(),
        doctorId: DoctorId,
        patientId: PatientId,
        title: Title,
        metadata: FileMetadata,
        servicePrescription: ServicePrescription,
        executionDate: ExecutionDate,
        findings: Findings,
        clinicalQuestion: ClinicalQuestion? = null,
        conclusion: Conclusion? = null,
        recommendations: Recommendations? = null,
        issueDate: IssueDate = IssueDate.now()
    ): Either<DomainError, Report> =
        success(
            DefaultReport(
                id = id,
                doctorId = doctorId,
                patientId = patientId,
                issueDate = issueDate,
                title = title,
                metadata = metadata,
                servicePrescription = servicePrescription,
                executionDate = executionDate,
                clinicalQuestion = clinicalQuestion,
                findings = findings,
                conclusion = conclusion,
                recommendations = recommendations
            )
        )

    fun createUploadedDocument(
        id: DocumentId = generateDocumentId(),
        patientId: PatientId,
        title: Title,
        filename: String,
        metadata: FileMetadata,
        documentType: UploadedDocumentType = UploadedDocumentType.OTHER,
        issueDate: IssueDate = IssueDate.now()
    ): Either<DomainError, UploadedDocument> {
        if (filename.isBlank()) {
            return failure(it.nucleo.commons.errors.ValidationError("Filename cannot be blank"))
        }

        return success(
            UploadedDocument(
                id = id,
                doctorId = UNKNOWN_DOCTOR_ID,
                patientId = patientId,
                issueDate = issueDate,
                title = title,
                metadata = metadata,
                filename = filename,
                documentType = documentType
            )
        )
    }

    private fun generateDocumentId(): DocumentId =
        DocumentId(UUID.randomUUID().toString()).getOrElse {
            throw IllegalStateException("Failed to generate DocumentId: ${it.message}")
        }
}
