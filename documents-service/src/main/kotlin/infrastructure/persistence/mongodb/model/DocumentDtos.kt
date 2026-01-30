package it.nucleo.infrastructure.persistence.mongodb.model

import it.nucleo.domain.*
import it.nucleo.domain.prescription.Validity
import it.nucleo.domain.prescription.implementation.*
import it.nucleo.domain.report.*
import it.nucleo.domain.report.implementation.DefaultReport
import java.time.LocalDate
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
    abstract val fileUri: String
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
    override val fileUri: String,
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
    override val fileUri: String,
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
    override val fileUri: String,
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

fun Document.toDto(): DocumentDto =
    when (this) {
        is MedicinePrescription ->
            MedicinePrescriptionDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                fileUri = metadata.fileURI.uri,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                validity = validity.toDto(),
                dosage = dosage.toDto()
            )
        is ServicePrescription ->
            ServicePrescriptionDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                fileUri = metadata.fileURI.uri,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                validity = validity.toDto(),
                serviceId = serviceId.id,
                facilityId = facilityId.id,
                priority = priority.name
            )
        is Report ->
            ReportDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                fileUri = metadata.fileURI.uri,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                servicePrescription = servicePrescription.toDto() as ServicePrescriptionDto,
                executionDate = executionDate.date.toString(),
                clinicalQuestion = clinicalQuestion?.text,
                findings = findings.text,
                conclusion = conclusion?.text,
                recommendations = recommendations?.text
            )
        else -> throw IllegalArgumentException("Unknown document type: ${this::class.simpleName}")
    }

fun Validity.toDto(): ValidityDto =
    when (this) {
        is Validity.UntilDate -> ValidityDto.UntilDate(date.toString())
        is Validity.UntilExecution -> ValidityDto.UntilExecution
    }

fun Dosage.toDto(): DosageDto =
    DosageDto(
        medicineId = medicine.id,
        doseAmount = dose.amount,
        doseUnit = dose.unit.name,
        frequencyTimesPerPeriod = frequency.timesPerPeriod,
        frequencyPeriod = frequency.period.name,
        durationLength = duration.length,
        durationUnit = duration.unit.name
    )

fun DocumentDto.toDomain(): Document =
    when (this) {
        is MedicinePrescriptionDto ->
            MedicinePrescription(
                id = DocumentId(id),
                doctorId = DoctorId(doctorId),
                patientId = PatientId(patientId),
                issueDate = IssueDate(LocalDate.parse(issueDate)),
                metadata =
                    FileMetadata(
                        fileURI = FileURI(fileUri),
                        summary = Summary(summary),
                        tags = tags.map { Tag(it) }.toSet()
                    ),
                validity = validity.toDomain(),
                dosage = dosage.toDomain()
            )
        is ServicePrescriptionDto ->
            ServicePrescription(
                id = DocumentId(id),
                doctorId = DoctorId(doctorId),
                patientId = PatientId(patientId),
                issueDate = IssueDate(LocalDate.parse(issueDate)),
                metadata =
                    FileMetadata(
                        fileURI = FileURI(fileUri),
                        summary = Summary(summary),
                        tags = tags.map { Tag(it) }.toSet()
                    ),
                validity = validity.toDomain(),
                serviceId = ServiceId(serviceId),
                facilityId = FacilityId(facilityId),
                priority = Priority.valueOf(priority)
            )
        is ReportDto ->
            DefaultReport(
                id = DocumentId(id),
                doctorId = DoctorId(doctorId),
                patientId = PatientId(patientId),
                issueDate = IssueDate(LocalDate.parse(issueDate)),
                metadata =
                    FileMetadata(
                        fileURI = FileURI(fileUri),
                        summary = Summary(summary),
                        tags = tags.map { Tag(it) }.toSet()
                    ),
                servicePrescription = servicePrescription.toDomain() as ServicePrescription,
                executionDate = ExecutionDate(LocalDate.parse(executionDate)),
                clinicalQuestion = clinicalQuestion?.let { ClinicalQuestion(it) },
                findings = Findings(findings),
                conclusion = conclusion?.let { Conclusion(it) },
                recommendations = recommendations?.let { Recommendations(it) }
            )
    }

fun ValidityDto.toDomain(): Validity =
    when (this) {
        is ValidityDto.UntilDate -> Validity.UntilDate(LocalDate.parse(date))
        is ValidityDto.UntilExecution -> Validity.UntilExecution
    }

fun DosageDto.toDomain(): Dosage =
    Dosage(
        medicine = MedicineId(medicineId),
        dose = Dose(doseAmount, DoseUnit.valueOf(doseUnit)),
        frequency = Frequency(frequencyTimesPerPeriod, Period.valueOf(frequencyPeriod)),
        duration = Duration(durationLength, Period.valueOf(durationUnit))
    )
