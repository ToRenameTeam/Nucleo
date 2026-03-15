package it.nucleo.documents.application

import it.nucleo.documents.domain.report.ClinicalQuestion
import it.nucleo.documents.domain.report.Conclusion
import it.nucleo.documents.domain.report.Findings
import it.nucleo.documents.domain.report.Recommendations

/**
 * Command that carries the editable fields of a [it.nucleo.documents.domain.report.Report]. All
 * fields are optional: only non-null values are applied during the update. Uses domain value
 * objects — no dependency on the api layer.
 */
data class UpdateReportCommand(
    val findings: Findings? = null,
    val clinicalQuestion: ClinicalQuestion? = null,
    val conclusion: Conclusion? = null,
    val recommendations: Recommendations? = null,
)
