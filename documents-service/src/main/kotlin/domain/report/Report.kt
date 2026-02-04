package it.nucleo.domain.report

import it.nucleo.domain.Document
import it.nucleo.domain.prescription.implementation.ServicePrescription
import java.time.LocalDate

interface Report : Document {
    val servicePrescription: ServicePrescription

    val executionDate: ExecutionDate

    val clinicalQuestion: ClinicalQuestion?

    val findings: Findings

    val conclusion: Conclusion?

    val recommendations: Recommendations?

    fun updateFindings(newFindings: Findings)

    fun setClinicalQuestion(question: ClinicalQuestion?)

    fun setConclusion(conclusion: Conclusion)

    fun setRecommendations(recommendations: Recommendations)
}

@JvmInline value class ExecutionDate(val date: LocalDate)

@JvmInline value class ClinicalQuestion(val text: String)

@JvmInline value class Findings(val text: String)

@JvmInline value class Conclusion(val text: String)

@JvmInline value class Recommendations(val text: String)
