package it.nucleo.api.fixtures

import it.nucleo.api.dto.*

object DocumentFixtures {

    fun medicinePrescriptionRequest(
        doctorId: String = "doctor-test-001",
        metadata: FileMetadataDto = defaultMetadata("Medicine prescription for test"),
        validity: ValidityRequest = ValidityRequest.UntilDate("2026-12-31"),
        dosage: DosageRequest = defaultDosage()
    ): CreateMedicinePrescriptionRequest = CreateMedicinePrescriptionRequest(
        doctorId = doctorId,
        metadata = metadata,
        validity = validity,
        dosage = dosage
    )

    fun servicePrescriptionRequest(
        doctorId: String = "doctor-test-001",
        metadata: FileMetadataDto = defaultMetadata("Service prescription for test"),
        validity: ValidityRequest = ValidityRequest.UntilExecution,
        serviceId: String = "service-blood-test",
        facilityId: String = "facility-lab-001",
        priority: String = "ROUTINE"
    ): CreateServicePrescriptionRequest = CreateServicePrescriptionRequest(
        doctorId = doctorId,
        metadata = metadata,
        validity = validity,
        serviceId = serviceId,
        facilityId = facilityId,
        priority = priority
    )

    fun reportRequest(
        doctorId: String = "doctor-test-002",
        metadata: FileMetadataDto = defaultMetadata("Test report"),
        servicePrescriptionId: String,
        executionDate: String = "2026-01-30",
        findings: String = "All values within normal range",
        clinicalQuestion: String? = "Check for infection markers",
        conclusion: String? = "No abnormalities detected",
        recommendations: String? = "Repeat in 12 months"
    ): CreateReportRequest = CreateReportRequest(
        doctorId = doctorId,
        metadata = metadata,
        servicePrescriptionId = servicePrescriptionId,
        executionDate = executionDate,
        findings = findings,
        clinicalQuestion = clinicalQuestion,
        conclusion = conclusion,
        recommendations = recommendations
    )

    private fun defaultMetadata(summary: String): FileMetadataDto = FileMetadataDto(
        fileUri = "s3://test-bucket/documents/${System.currentTimeMillis()}.pdf",
        summary = summary,
        tags = setOf("test", "automated")
    )

    private fun defaultDosage(): DosageRequest = DosageRequest(
        medicineId = "medicine-amoxicillin",
        dose = DoseDto(amount = 500, unit = "MILLIGRAM"),
        frequency = FrequencyDto(timesPerPeriod = 3, period = "DAY"),
        duration = DurationDto(length = 7, unit = "DAY")
    )
}
