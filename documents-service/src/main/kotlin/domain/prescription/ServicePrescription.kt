package it.nucleo.domain.prescription

import it.nucleo.domain.Doctor
import it.nucleo.domain.DocumentId
import it.nucleo.domain.IssueDate
import it.nucleo.domain.Metadata
import it.nucleo.domain.Patient

data class ServicePrescription(
    override val id: DocumentId,
    override val author: Doctor,
    override val patient: Patient,
    override val issueDate: IssueDate,
    override val metadata: Metadata
) : Prescription

@JvmInline value class Facility(val id: String)
