package it.nucleo.documents.domain.prescription.implementation

import it.nucleo.commons.errors.DomainError
import it.nucleo.commons.errors.Either
import it.nucleo.commons.errors.ValidationError
import it.nucleo.commons.errors.failure
import it.nucleo.commons.errors.success
import it.nucleo.documents.domain.DoctorId
import it.nucleo.documents.domain.Document
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.FileMetadata
import it.nucleo.documents.domain.IssueDate
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.Title
import it.nucleo.documents.domain.prescription.Prescription
import it.nucleo.documents.domain.prescription.Validity

data class MedicinePrescription(
    override val id: DocumentId,
    override val doctorId: DoctorId,
    override val patientId: PatientId,
    override val issueDate: IssueDate,
    override val title: Title,
    override val metadata: FileMetadata,
    override val validity: Validity,
    val dosage: Dosage
) : Prescription {
    override fun withMetadata(newMetadata: FileMetadata): Document = copy(metadata = newMetadata)
}

@ConsistentCopyVisibility
data class Dosage
private constructor(
    val medicine: MedicineId,
    val dose: Dose,
    val frequency: Frequency,
    val duration: Duration
) {
    companion object {
        operator fun invoke(
            medicine: MedicineId,
            dose: Dose,
            frequency: Frequency,
            duration: Duration,
        ): Either<DomainError, Dosage> = success(Dosage(medicine, dose, frequency, duration))
    }
}

@JvmInline
value class MedicineId private constructor(val id: String) {
    companion object {
        operator fun invoke(id: String): Either<DomainError, MedicineId> {
            if (id.isBlank()) return failure(ValidationError("MedicineId cannot be blank"))
            return success(MedicineId(id))
        }
    }
}

@ConsistentCopyVisibility
data class Dose private constructor(val amount: Int, val unit: DoseUnit) {
    companion object {
        operator fun invoke(amount: Int, unit: DoseUnit): Either<DomainError, Dose> {
            if (amount <= 0) return failure(ValidationError("Dose amount must be positive"))
            return success(Dose(amount, unit))
        }
    }
}

@ConsistentCopyVisibility
data class Frequency private constructor(val timesPerPeriod: Int, val period: Period) {
    companion object {
        operator fun invoke(timesPerPeriod: Int, period: Period): Either<DomainError, Frequency> {
            if (timesPerPeriod <= 0) {
                return failure(ValidationError("Frequency timesPerPeriod must be positive"))
            }
            return success(Frequency(timesPerPeriod, period))
        }
    }
}

@ConsistentCopyVisibility
data class Duration private constructor(val length: Int, val unit: Period) {
    companion object {
        operator fun invoke(length: Int, unit: Period): Either<DomainError, Duration> {
            if (length <= 0) return failure(ValidationError("Duration length must be positive"))
            return success(Duration(length, unit))
        }
    }
}

enum class DoseUnit(val symbol: String) {
    GRAM("g"),
    MILLIGRAM("mg"),
    LITER("l"),
    MILLILITER("ml")
}

enum class Period {
    DAY,
    WEEK,
    MONTH,
    YEAR
}
