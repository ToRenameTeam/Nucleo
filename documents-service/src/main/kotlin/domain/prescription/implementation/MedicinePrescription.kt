package it.nucleo.domain.prescription.implementation

import it.nucleo.domain.DoctorId
import it.nucleo.domain.DocumentId
import it.nucleo.domain.IssueDate
import it.nucleo.domain.Metadata
import it.nucleo.domain.PatientId
import it.nucleo.domain.prescription.Prescription
import it.nucleo.domain.prescription.Validity

data class MedicinePrescription(
    override val id: DocumentId,
    override val doctorId: DoctorId,
    override val patientId: PatientId,
    override val issueDate: IssueDate,
    override val metadata: Metadata,
    override val validity: Validity,
    val dosage: Dosage
) : Prescription

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
