package it.nucleo.api.dto

import it.nucleo.domain.*
import it.nucleo.domain.prescription.Validity
import it.nucleo.domain.prescription.implementation.*
import it.nucleo.domain.report.*
import java.time.LocalDate
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** API response wrapper for document operations. */
@Serializable
sealed class DocumentResponse {
    abstract val id: String
    abstract val doctorId: String
    abstract val patientId: String
    abstract val issueDate: String
    abstract val metadata: FileMetadataDto
}

@Serializable
@SerialName("medicine_prescription")
data class MedicinePrescriptionResponse(
    override val id: String,
    override val doctorId: String,
    override val patientId: String,
    override val issueDate: String,
    override val metadata: FileMetadataDto,
    val validity: ValidityResponse,
    val dosage: DosageResponse
) : DocumentResponse()

@Serializable
@SerialName("service_prescription")
data class ServicePrescriptionResponse(
    override val id: String,
    override val doctorId: String,
    override val patientId: String,
    override val issueDate: String,
    override val metadata: FileMetadataDto,
    val validity: ValidityResponse,
    val serviceId: String,
    val facilityId: String,
    val priority: String
) : DocumentResponse()

@Serializable
@SerialName("report")
data class ReportResponse(
    override val id: String,
    override val doctorId: String,
    override val patientId: String,
    override val issueDate: String,
    override val metadata: FileMetadataDto,
    val servicePrescription: ServicePrescriptionResponse,
    val executionDate: String,
    val clinicalQuestion: String?,
    val findings: String,
    val conclusion: String?,
    val recommendations: String?
) : DocumentResponse()

@Serializable
data class FileMetadataDto(val fileUri: String, val summary: String, val tags: Set<String>)

@Serializable
sealed class ValidityResponse {
    @Serializable
    @SerialName("until_date")
    data class UntilDate(val date: String) : ValidityResponse()

    @Serializable @SerialName("until_execution") data object UntilExecution : ValidityResponse()
}

@Serializable
data class DosageResponse(
    val medicineId: String,
    val dose: DoseDto,
    val frequency: FrequencyDto,
    val duration: DurationDto
)

@Serializable data class DoseDto(val amount: Int, val unit: String)

@Serializable data class FrequencyDto(val timesPerPeriod: Int, val period: String)

@Serializable data class DurationDto(val length: Int, val unit: String)

// ============================================
// Request DTOs
// ============================================

/** Base request for creating documents. */
@Serializable
sealed class CreateDocumentRequest {
    abstract val doctorId: String
    abstract val metadata: FileMetadataDto
}

@Serializable
@SerialName("medicine_prescription")
data class CreateMedicinePrescriptionRequest(
    override val doctorId: String,
    override val metadata: FileMetadataDto,
    val validity: ValidityRequest,
    val dosage: DosageRequest
) : CreateDocumentRequest()

@Serializable
@SerialName("service_prescription")
data class CreateServicePrescriptionRequest(
    override val doctorId: String,
    override val metadata: FileMetadataDto,
    val validity: ValidityRequest,
    val serviceId: String,
    val facilityId: String,
    val priority: String = "ROUTINE"
) : CreateDocumentRequest()

@Serializable
@SerialName("report")
data class CreateReportRequest(
    override val doctorId: String,
    override val metadata: FileMetadataDto,
    val servicePrescriptionId: String,
    val executionDate: String,
    val findings: String,
    val clinicalQuestion: String? = null,
    val conclusion: String? = null,
    val recommendations: String? = null
) : CreateDocumentRequest()

@Serializable
sealed class ValidityRequest {
    @Serializable
    @SerialName("until_date")
    data class UntilDate(val date: String) : ValidityRequest()

    @Serializable @SerialName("until_execution") data object UntilExecution : ValidityRequest()
}

@Serializable
data class DosageRequest(
    val medicineId: String,
    val dose: DoseDto,
    val frequency: FrequencyDto,
    val duration: DurationDto
)

/** Request for updating a report. */
@Serializable
data class UpdateReportRequest(
    val findings: String? = null,
    val clinicalQuestion: String? = null,
    val conclusion: String? = null,
    val recommendations: String? = null
)

/** API error response. */
@Serializable
data class ErrorResponse(val error: String, val message: String, val details: String? = null)

/** Successful deletion response. */
@Serializable data class DeleteResponse(val message: String)

// ============================================
// Extension functions for domain to API DTO mapping
// ============================================

fun Document.toResponse(): DocumentResponse =
    when (this) {
        is MedicinePrescription ->
            MedicinePrescriptionResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
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
                metadata = metadata.toDto(),
                servicePrescription =
                    servicePrescription.toResponse() as ServicePrescriptionResponse,
                executionDate = executionDate.date.toString(),
                clinicalQuestion = clinicalQuestion?.text,
                findings = findings.text,
                conclusion = conclusion?.text,
                recommendations = recommendations?.text
            )
        else -> throw IllegalArgumentException("Unknown document type: ${this::class.simpleName}")
    }

fun FileMetadata.toDto(): FileMetadataDto =
    FileMetadataDto(
        fileUri = fileURI.uri,
        summary = summary.summary,
        tags = tags.map { it.tag }.toSet()
    )

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

// ============================================
// Extension functions for API DTO to domain mapping
// ============================================

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
    FileMetadata(
        fileURI = FileURI(fileUri),
        summary = Summary(summary),
        tags = tags.map { Tag(it) }.toSet()
    )
