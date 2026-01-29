package it.nucleo.domain.factory

import it.nucleo.domain.*
import it.nucleo.domain.prescription.Prescription
import it.nucleo.domain.prescription.Validity
import it.nucleo.domain.prescription.implementation.Dosage
import it.nucleo.domain.prescription.implementation.MedicinePrescription
import it.nucleo.domain.prescription.implementation.Priority
import it.nucleo.domain.prescription.implementation.ServicePrescription
import it.nucleo.domain.report.ClinicalQuestion
import it.nucleo.domain.report.Conclusion
import it.nucleo.domain.report.ExecutionDate
import it.nucleo.domain.report.Findings
import it.nucleo.domain.report.Recommendations
import it.nucleo.domain.report.Report
import it.nucleo.domain.report.implementation.DefaultReport
import java.util.UUID

object DocumentFactory {

    fun createMedicinePrescription(
        doctorId: DoctorId,
        patientId: PatientId,
        metadata: FileMetadata,
        validity: Validity,
        dosage: Dosage,
        issueDate: IssueDate = IssueDate()
    ): Prescription =
        MedicinePrescription(
            id = generateDocumentId(),
            doctorId = doctorId,
            patientId = patientId,
            issueDate = issueDate,
            metadata = metadata,
            validity = validity,
            dosage = dosage
        )

    fun createServicePrescription(
        doctorId: DoctorId,
        patientId: PatientId,
        metadata: FileMetadata,
        validity: Validity,
        serviceId: it.nucleo.domain.prescription.implementation.ServiceId,
        facilityId: it.nucleo.domain.prescription.implementation.FacilityId,
        priority: Priority = Priority.ROUTINE,
        issueDate: IssueDate = IssueDate()
    ): Prescription =
        ServicePrescription(
            id = generateDocumentId(),
            doctorId = doctorId,
            patientId = patientId,
            issueDate = issueDate,
            metadata = metadata,
            validity = validity,
            serviceId = serviceId,
            facilityId = facilityId,
            priority = priority
        )

    fun createReport(
        doctorId: DoctorId,
        patientId: PatientId,
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
            id = generateDocumentId(),
            doctorId = doctorId,
            patientId = patientId,
            issueDate = issueDate,
            metadata = metadata,
            servicePrescription = servicePrescription,
            executionDate = executionDate,
            clinicalQuestion = clinicalQuestion,
            findings = findings,
            conclusion = conclusion,
            recommendations = recommendations
        )

    private fun generateDocumentId(): DocumentId = DocumentId(UUID.randomUUID().toString())
}
