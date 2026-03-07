package it.nucleo.api.dto

import it.nucleo.domain.*
import it.nucleo.domain.DocumentFactory
import it.nucleo.domain.errors.DocumentError
import it.nucleo.domain.errors.Either
import it.nucleo.domain.errors.failure
import it.nucleo.domain.errors.success
import it.nucleo.domain.prescription.Validity
import it.nucleo.domain.prescription.implementation.*
import it.nucleo.domain.report.*
import it.nucleo.domain.uploaded.UploadedDocument
import java.time.LocalDate

fun Document.toResponse(): DocumentResponse =
    when (this) {
        is MedicinePrescription ->
            MedicinePrescriptionResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                validity = validity.toResponse(),
                dosage = dosage.toResponse()
            )
        is ServicePrescription ->
            ServicePrescriptionResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                validity = validity.toResponse(),
                serviceId = serviceId.id,
                facilityId = facilityId.id,
                priority = priority.name
            )
        is Report ->
            ReportResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                servicePrescription =
                    servicePrescription.toResponse() as ServicePrescriptionResponse,
                executionDate = executionDate.date.toString(),
                clinicalQuestion = clinicalQuestion?.text,
                findings = findings.text,
                conclusion = conclusion?.text,
                recommendations = recommendations?.text
            )
        is UploadedDocument ->
            UploadedDocumentResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                filename = filename,
                documentType = documentType.name
            )
        else -> throw IllegalArgumentException("Unknown document type: ${this::class.simpleName}")
    }

fun FileMetadata.toDto(): FileMetadataDto =
    FileMetadataDto(summary = summary.summary, tags = tags.map { it.tag }.toSet())

fun Validity.toResponse(): ValidityResponse =
    when (this) {
        is Validity.UntilDate -> ValidityResponse.UntilDate(date.toString())
        is Validity.UntilExecution -> ValidityResponse.UntilExecution
    }

fun Dosage.toResponse(): DosageResponse =
    DosageResponse(
        medicineId = medicine.id,
        dose = DoseDto(dose.amount, dose.unit.name),
        frequency = FrequencyDto(frequency.timesPerPeriod, frequency.period.name),
        duration = DurationDto(duration.length, duration.unit.name)
    )

fun ValidityRequest.toDomain(): Validity =
    when (this) {
        is ValidityRequest.UntilDate -> Validity.UntilDate(LocalDate.parse(date))
        is ValidityRequest.UntilExecution -> Validity.UntilExecution
    }

fun DosageRequest.toDomain(): Dosage =
    Dosage(
        medicine = MedicineId(medicineId),
        dose = Dose(dose.amount, DoseUnit.valueOf(dose.unit)),
        frequency = Frequency(frequency.timesPerPeriod, Period.valueOf(frequency.period)),
        duration = Duration(duration.length, Period.valueOf(duration.unit))
    )

fun FileMetadataDto.toDomain(): FileMetadata =
    FileMetadata(summary = Summary(summary), tags = tags.map { Tag(it) }.toSet())

suspend fun CreateDocumentRequest.toDomain(
    patientId: PatientId,
    documentId: DocumentId,
    resolveServicePrescription:
        (suspend (DocumentId) -> Either<DocumentError, ServicePrescription>)? =
        null,
): Either<DocumentError, Document> {
    val doctorId = DoctorId(this.doctorId)
    val title = Title(this.title)
    val metadata = this.metadata.toDomain()

    return when (this) {
        is CreateMedicinePrescriptionRequest ->
            success(
                DocumentFactory.createMedicinePrescription(
                    id = documentId,
                    doctorId = doctorId,
                    patientId = patientId,
                    title = title,
                    metadata = metadata,
                    validity = validity.toDomain(),
                    dosage = dosage.toDomain()
                )
            )
        is CreateServicePrescriptionRequest ->
            success(
                DocumentFactory.createServicePrescription(
                    id = documentId,
                    doctorId = doctorId,
                    patientId = patientId,
                    title = title,
                    metadata = metadata,
                    validity = validity.toDomain(),
                    serviceId = ServiceId(serviceId),
                    facilityId = FacilityId(facilityId),
                    priority = Priority.valueOf(priority)
                )
            )
        is CreateReportRequest -> {
            val prescriptionId = DocumentId(servicePrescriptionId)
            val servicePrescription =
                resolveServicePrescription?.invoke(prescriptionId)
                    ?: return failure(
                        DocumentError.InvalidRequest("Service prescription resolver not provided")
                    )

            when (servicePrescription) {
                is Either.Left -> failure(servicePrescription.error)
                is Either.Right ->
                    success(
                        DocumentFactory.createReport(
                            id = documentId,
                            doctorId = doctorId,
                            patientId = patientId,
                            title = title,
                            metadata = metadata,
                            servicePrescription = servicePrescription.value,
                            executionDate = ExecutionDate(LocalDate.parse(executionDate)),
                            findings = Findings(findings),
                            clinicalQuestion = clinicalQuestion?.let { ClinicalQuestion(it) },
                            conclusion = conclusion?.let { Conclusion(it) },
                            recommendations = recommendations?.let { Recommendations(it) }
                        )
                    )
            }
        }
    }
}
