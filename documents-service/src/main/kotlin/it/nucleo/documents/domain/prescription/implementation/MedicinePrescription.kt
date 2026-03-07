package it.nucleo.documents.domain.prescription.implementation

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

data class Dosage(
    val medicine: MedicineId,
    val dose: Dose,
    val frequency: Frequency,
    val duration: Duration
)

@JvmInline value class MedicineId(val id: String)

data class Dose(val amount: Int, val unit: DoseUnit)

data class Frequency(val timesPerPeriod: Int, val period: Period)

data class Duration(val length: Int, val unit: Period)

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
