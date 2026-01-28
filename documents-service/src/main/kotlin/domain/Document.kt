package it.nucleo.domain

import it.nucleo.domain.implementation.Doctor
import it.nucleo.domain.implementation.DocumentId
import it.nucleo.domain.implementation.Facility
import it.nucleo.domain.implementation.FileURI
import it.nucleo.domain.implementation.IssueDate
import it.nucleo.domain.implementation.Patient
import it.nucleo.domain.implementation.Summary
import it.nucleo.domain.implementation.Tags

sealed interface Document {
    val id: DocumentId

    val author: Doctor

    val patient: Patient

    val facility: Facility

    val issueDate: IssueDate

    val metadata: Metadata
}

data class Metadata(val fileURI: FileURI, val summary: Summary, val tags: Tags)
