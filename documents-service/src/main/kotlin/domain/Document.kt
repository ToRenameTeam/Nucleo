package it.nucleo.domain

import java.time.LocalDate

interface Document {
    val id: DocumentId

    val doctorId: DoctorId

    val patientId: PatientId

    val issueDate: IssueDate

    val metadata: FileMetadata

    fun withMetadata(newMetadata: FileMetadata): Document
}

data class FileMetadata(val summary: Summary, val tags: Set<Tag>)

@JvmInline value class DocumentId(val id: String)

@JvmInline value class PatientId(val id: String)

@JvmInline value class DoctorId(val id: String)

@JvmInline value class IssueDate(val date: LocalDate = LocalDate.now())

@JvmInline value class Summary(val summary: String)

@JvmInline value class Tag(val tag: String)
