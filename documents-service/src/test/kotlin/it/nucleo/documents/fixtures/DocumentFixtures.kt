package it.nucleo.documents.fixtures

import it.nucleo.documents.api.dto.*
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.prescription.Validity
import it.nucleo.documents.domain.prescription.implementation.*
import it.nucleo.documents.domain.report.*
import it.nucleo.documents.domain.report.implementation.DefaultReport
import java.time.LocalDate

/**
 * Reusable factory methods that create fully-constructed domain objects and API DTOs for unit and
 * route tests. All IDs are deterministic so assertions are straightforward.
 */
object DocumentFixtures {

    private fun <T> requireValue(either: it.nucleo.commons.errors.Either<*, T>): T =
        when (either) {
            is it.nucleo.commons.errors.Either.Right -> either.value
            is it.nucleo.commons.errors.Either.Left ->
                error("Invalid test fixture value: ${either.error.message}")
        }

    const val PATIENT_ID = "patient-001"
    const val DOCTOR_ID = "doctor-001"
    const val DOCUMENT_ID = "doc-001"
    const val SERVICE_PRESCRIPTION_ID = "sp-001"
    const val REPORT_ID = "report-001"

    fun metadata(
        summary: String = "Test summary",
        tags: Set<String> = setOf("test"),
    ) =
        requireValue(
            FileMetadata(
                summary = requireValue(Summary(summary)),
                tags = tags.map { requireValue(Tag(it)) }.toSet(),
            )
        )

    fun medicinePrescription(
        id: String = DOCUMENT_ID,
        patientId: String = PATIENT_ID,
        doctorId: String = DOCTOR_ID,
    ): MedicinePrescription =
        MedicinePrescription(
            id = requireValue(DocumentId(id)),
            doctorId = requireValue(DoctorId(doctorId)),
            patientId = requireValue(PatientId(patientId)),
            issueDate = requireValue(IssueDate(LocalDate.of(2026, 1, 15))),
            title = requireValue(Title("Amoxicillin Prescription")),
            metadata = metadata("Medicine prescription for test"),
            validity = Validity.UntilDate(LocalDate.of(2026, 12, 31)),
            dosage =
                requireValue(
                    Dosage(
                        medicine = requireValue(MedicineId("medicine-amoxicillin")),
                        dose = requireValue(Dose(500, DoseUnit.MILLIGRAM)),
                        frequency = requireValue(Frequency(3, Period.DAY)),
                        duration = requireValue(Duration(7, Period.DAY)),
                    )
                ),
        )

    fun servicePrescription(
        id: String = SERVICE_PRESCRIPTION_ID,
        patientId: String = PATIENT_ID,
        doctorId: String = DOCTOR_ID,
    ): ServicePrescription =
        ServicePrescription(
            id = requireValue(DocumentId(id)),
            doctorId = requireValue(DoctorId(doctorId)),
            patientId = requireValue(PatientId(patientId)),
            issueDate = requireValue(IssueDate(LocalDate.of(2026, 1, 15))),
            title = requireValue(Title("Blood Test Prescription")),
            metadata = metadata("Service prescription for test"),
            validity = Validity.UntilExecution,
            serviceId = requireValue(ServiceId("service-blood-test")),
            facilityId = requireValue(FacilityId("facility-lab-001")),
            priority = Priority.ROUTINE,
        )

    fun report(
        id: String = REPORT_ID,
        patientId: String = PATIENT_ID,
        doctorId: String = DOCTOR_ID,
        servicePrescription: ServicePrescription = servicePrescription(),
        findings: String = "All values within normal range",
        conclusion: String? = "No abnormalities detected",
        recommendations: String? = "Repeat in 12 months",
    ): DefaultReport =
        DefaultReport(
            id = requireValue(DocumentId(id)),
            doctorId = requireValue(DoctorId(doctorId)),
            patientId = requireValue(PatientId(patientId)),
            issueDate = requireValue(IssueDate(LocalDate.of(2026, 2, 1))),
            title = requireValue(Title("Blood Test Report")),
            metadata = metadata("Test report"),
            servicePrescription = servicePrescription,
            executionDate = requireValue(ExecutionDate(LocalDate.of(2026, 1, 30))),
            findings = requireValue(Findings(findings)),
            clinicalQuestion = requireValue(ClinicalQuestion("Check for infection markers")),
            conclusion = conclusion?.let { requireValue(Conclusion(it)) },
            recommendations = recommendations?.let { requireValue(Recommendations(it)) },
        )

    fun medicinePrescriptionRequest(
        doctorId: String = DOCTOR_ID,
        title: String = "Test Medicine Prescription",
        summary: String = "Medicine prescription for test",
        validity: ValidityRequest = ValidityRequest.UntilDate("2026-12-31"),
    ): CreateMedicinePrescriptionRequest =
        CreateMedicinePrescriptionRequest(
            doctorId = doctorId,
            title = title,
            metadata = FileMetadataDto(summary = summary, tags = setOf("test", "automated")),
            validity = validity,
            dosage =
                DosageRequest(
                    medicineId = "medicine-amoxicillin",
                    dose = DoseDto(amount = 500, unit = "MILLIGRAM"),
                    frequency = FrequencyDto(timesPerPeriod = 3, period = "DAY"),
                    duration = DurationDto(length = 7, unit = "DAY"),
                ),
        )

    fun servicePrescriptionRequest(
        doctorId: String = DOCTOR_ID,
        title: String = "Test Service Prescription",
        summary: String = "Service prescription for test",
        priority: String = "ROUTINE",
    ): CreateServicePrescriptionRequest =
        CreateServicePrescriptionRequest(
            doctorId = doctorId,
            title = title,
            metadata = FileMetadataDto(summary = summary, tags = setOf("test", "automated")),
            validity = ValidityRequest.UntilExecution,
            serviceId = "service-blood-test",
            facilityId = "facility-lab-001",
            priority = priority,
        )

    fun reportRequest(
        doctorId: String = DOCTOR_ID,
        title: String = "Test Report",
        servicePrescriptionId: String,
        executionDate: String = "2026-01-30",
        findings: String = "All values within normal range",
        clinicalQuestion: String? = "Check for infection markers",
        conclusion: String? = "No abnormalities detected",
        recommendations: String? = "Repeat in 12 months",
    ): CreateReportRequest =
        CreateReportRequest(
            doctorId = doctorId,
            title = title,
            metadata = FileMetadataDto(summary = "Test report", tags = setOf("test", "automated")),
            servicePrescriptionId = servicePrescriptionId,
            executionDate = executionDate,
            findings = findings,
            clinicalQuestion = clinicalQuestion,
            conclusion = conclusion,
            recommendations = recommendations,
        )
}
