package it.nucleo.infrastructure.persistence.mongodb.dto

import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.bson.types.ObjectId

@Serializable
data class MedicalRecordDocument(
    @SerialName("_id") @Contextual val id: ObjectId = ObjectId(),
    val patientId: String,
    val documents: List<DocumentDto> = emptyList()
)

@Serializable
sealed class DocumentDto {
    abstract val id: String
    abstract val doctorId: String
    abstract val patientId: String
    abstract val issueDate: String
    abstract val summary: String
    abstract val tags: Set<String>
}

@Serializable
@SerialName("medicine_prescription")
data class MedicinePrescriptionDto(
    override val id: String,
    override val doctorId: String,
    override val patientId: String,
    override val issueDate: String,
    override val summary: String,
    override val tags: Set<String>,
    val validity: ValidityDto,
    val dosage: DosageDto
) : DocumentDto()

@Serializable
@SerialName("service_prescription")
data class ServicePrescriptionDto(
    override val id: String,
    override val doctorId: String,
    override val patientId: String,
    override val issueDate: String,
    override val summary: String,
    override val tags: Set<String>,
    val validity: ValidityDto,
    val serviceId: String,
    val facilityId: String,
    val priority: String
) : DocumentDto()

@Serializable
@SerialName("report")
data class ReportDto(
    override val id: String,
    override val doctorId: String,
    override val patientId: String,
    override val issueDate: String,
    override val summary: String,
    override val tags: Set<String>,
    val servicePrescription: ServicePrescriptionDto,
    val executionDate: String,
    val clinicalQuestion: String?,
    val findings: String,
    val conclusion: String?,
    val recommendations: String?
) : DocumentDto()

@Serializable
@SerialName("uploaded_document")
data class UploadedDocumentDto(
    override val id: String,
    override val doctorId: String,
    override val patientId: String,
    override val issueDate: String,
    override val summary: String,
    override val tags: Set<String>,
    val filename: String,
    val documentType: String
) : DocumentDto()

@Serializable
sealed class ValidityDto {
    @Serializable @SerialName("until_date") data class UntilDate(val date: String) : ValidityDto()

    @Serializable @SerialName("until_execution") data object UntilExecution : ValidityDto()
}

@Serializable
data class DosageDto(
    val medicineId: String,
    val doseAmount: Int,
    val doseUnit: String,
    val frequencyTimesPerPeriod: Int,
    val frequencyPeriod: String,
    val durationLength: Int,
    val durationUnit: String
)
