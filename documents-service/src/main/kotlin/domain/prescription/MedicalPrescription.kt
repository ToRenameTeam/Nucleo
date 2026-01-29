package it.nucleo.domain.prescription

import it.nucleo.domain.Doctor
import it.nucleo.domain.DocumentId
import it.nucleo.domain.IssueDate
import it.nucleo.domain.Metadata
import it.nucleo.domain.Patient

data class MedicalPrescription(
    override val id: DocumentId,
    override val author: Doctor,
    override val patient: Patient,
    override val issueDate: IssueDate,
    override val metadata: Metadata,
    val dosage: Dosage
) : Prescription

data class Dosage(
    val medicine: Medicine,
    val dose: Dose,
    val frequency: Frequency,
    val duration: Duration
)

@JvmInline value class Medicine(val id: String)

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
