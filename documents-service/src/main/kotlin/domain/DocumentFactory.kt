package it.nucleo.domain

import it.nucleo.domain.prescription.Prescription
import it.nucleo.domain.prescription.Validity
import it.nucleo.domain.prescription.implementation.Dosage
import it.nucleo.domain.prescription.implementation.FacilityId
import it.nucleo.domain.prescription.implementation.MedicinePrescription
import it.nucleo.domain.prescription.implementation.Priority
import it.nucleo.domain.prescription.implementation.ServiceId
import it.nucleo.domain.prescription.implementation.ServicePrescription
import it.nucleo.domain.report.ClinicalQuestion
import it.nucleo.domain.report.Conclusion
import it.nucleo.domain.report.ExecutionDate
import it.nucleo.domain.report.Findings
import it.nucleo.domain.report.Recommendations
import it.nucleo.domain.report.Report
import it.nucleo.domain.report.implementation.DefaultReport
import it.nucleo.domain.uploaded.UploadedDocument
import it.nucleo.domain.uploaded.UploadedDocumentType
import java.util.UUID

object DocumentFactory {

    private val UNKNOWN_DOCTOR_ID = DoctorId("UNKNOWN")

    fun createMedicinePrescription(
        id: DocumentId = generateDocumentId(),
        doctorId: DoctorId,
        patientId: PatientId,
        title: Title,
        metadata: FileMetadata,
        validity: Validity,
        dosage: Dosage,
        issueDate: IssueDate = IssueDate()
    ): Prescription =
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
        issueDate: IssueDate = IssueDate()
    ): Prescription =
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
        issueDate: IssueDate = IssueDate()
    ): Report =
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

    fun createUploadedDocument(
        id: DocumentId = generateDocumentId(),
        patientId: PatientId,
        title: Title,
        filename: String,
        metadata: FileMetadata,
        documentType: UploadedDocumentType = UploadedDocumentType.OTHER,
        issueDate: IssueDate = IssueDate()
    ): UploadedDocument =
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

    private fun generateDocumentId(): DocumentId = DocumentId(UUID.randomUUID().toString())
}
