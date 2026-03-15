package it.nucleo.documents.domain.report.implementation

import it.nucleo.documents.domain.DoctorId
import it.nucleo.documents.domain.Document
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.FileMetadata
import it.nucleo.documents.domain.IssueDate
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.Title
import it.nucleo.documents.domain.prescription.implementation.ServicePrescription
import it.nucleo.documents.domain.report.*

class DefaultReport(
    override val id: DocumentId,
    override val doctorId: DoctorId,
    override val patientId: PatientId,
    override val issueDate: IssueDate,
    override val title: Title,
    override var metadata: FileMetadata,
    override val servicePrescription: ServicePrescription,
    override val executionDate: ExecutionDate,
    clinicalQuestion: ClinicalQuestion? = null,
    override var findings: Findings,
    conclusion: Conclusion? = null,
    recommendations: Recommendations? = null
) : Report {

    override var clinicalQuestion: ClinicalQuestion? = clinicalQuestion
        private set

    override var conclusion: Conclusion? = conclusion
        private set

    override var recommendations: Recommendations? = recommendations
        private set

    override fun updateFindings(newFindings: Findings) {
        findings = newFindings
    }

    override fun setClinicalQuestion(question: ClinicalQuestion?) {
        clinicalQuestion = question
    }

    override fun setConclusion(conclusion: Conclusion) {
        this.conclusion = conclusion
    }

    override fun setRecommendations(recommendations: Recommendations) {
        this.recommendations = recommendations
    }

    override fun withMetadata(newMetadata: FileMetadata): Document {
        return DefaultReport(
            id = id,
            doctorId = doctorId,
            patientId = patientId,
            issueDate = issueDate,
            title = title,
            metadata = newMetadata,
            servicePrescription = servicePrescription,
            executionDate = executionDate,
            clinicalQuestion = clinicalQuestion,
            findings = findings,
            conclusion = conclusion,
            recommendations = recommendations
        )
    }
}
