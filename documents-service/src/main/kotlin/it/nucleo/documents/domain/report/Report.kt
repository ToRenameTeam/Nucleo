package it.nucleo.documents.domain.report

import it.nucleo.commons.errors.DomainError
import it.nucleo.commons.errors.Either
import it.nucleo.commons.errors.ValidationError
import it.nucleo.commons.errors.failure
import it.nucleo.commons.errors.success
import it.nucleo.documents.domain.Document
import it.nucleo.documents.domain.prescription.implementation.ServicePrescription
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

@JvmInline
value class ExecutionDate private constructor(val date: LocalDate) {
    companion object {
        operator fun invoke(date: LocalDate): Either<DomainError, ExecutionDate> {
            if (date.isAfter(LocalDate.now())) {
                return failure(ValidationError("ExecutionDate cannot be in the future"))
            }
            return success(ExecutionDate(date))
        }
    }
}

@JvmInline
value class ClinicalQuestion private constructor(val text: String) {
    companion object {
        operator fun invoke(text: String): Either<DomainError, ClinicalQuestion> {
            if (text.isBlank()) return failure(ValidationError("ClinicalQuestion cannot be blank"))
            return success(ClinicalQuestion(text))
        }
    }
}

@JvmInline
value class Findings private constructor(val text: String) {
    companion object {
        operator fun invoke(text: String): Either<DomainError, Findings> {
            if (text.isBlank()) return failure(ValidationError("Findings cannot be blank"))
            return success(Findings(text))
        }
    }
}

@JvmInline
value class Conclusion private constructor(val text: String) {
    companion object {
        operator fun invoke(text: String): Either<DomainError, Conclusion> {
            if (text.isBlank()) return failure(ValidationError("Conclusion cannot be blank"))
            return success(Conclusion(text))
        }
    }
}

@JvmInline
value class Recommendations private constructor(val text: String) {
    companion object {
        operator fun invoke(text: String): Either<DomainError, Recommendations> {
            if (text.isBlank()) {
                return failure(ValidationError("Recommendations cannot be blank"))
            }
            return success(Recommendations(text))
        }
    }
}
