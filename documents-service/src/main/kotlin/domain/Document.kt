package it.nucleo.domain

import java.time.LocalDate

interface Document {
    val id: DocumentId

    val author: Doctor

    val patient: Patient

    val issueDate: IssueDate

    val metadata: Metadata
}

data class Metadata(val fileURI: FileURI, val summary: Summary, val tags: Set<Tag>)

@JvmInline value class DocumentId(val id: String)

@JvmInline value class Patient(val id: String)

@JvmInline value class Doctor(val id: String)

@JvmInline value class IssueDate(val date: LocalDate = LocalDate.now())

@JvmInline value class FileURI(val uri: String)

@JvmInline value class Summary(val summary: String)

@JvmInline value class Tag(val tag: String)
