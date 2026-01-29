package it.nucleo.domain

import java.time.LocalDate

interface Document {
    val id: DocumentId

    val doctorId: DoctorId

    val patientId: PatientId

    val issueDate: IssueDate

    val metadata: Metadata
}

data class Metadata(val fileURI: FileURI, val summary: Summary, val tags: Set<Tag>)

@JvmInline value class DocumentId(val id: String)

@JvmInline value class PatientId(val id: String)

@JvmInline value class DoctorId(val id: String)

@JvmInline value class IssueDate(val date: LocalDate = LocalDate.now())

@JvmInline value class FileURI(val uri: String)

@JvmInline value class Summary(val summary: String)

@JvmInline value class Tag(val tag: String)
