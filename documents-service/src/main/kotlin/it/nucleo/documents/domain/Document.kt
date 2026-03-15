package it.nucleo.documents.domain

import it.nucleo.commons.errors.DomainError
import it.nucleo.commons.errors.Either
import it.nucleo.commons.errors.ValidationError
import it.nucleo.commons.errors.failure
import it.nucleo.commons.errors.success
import java.time.LocalDate

interface Document {
    val id: DocumentId

    val doctorId: DoctorId

    val patientId: PatientId

    val issueDate: IssueDate

    val title: Title

    val metadata: FileMetadata

    fun withMetadata(newMetadata: FileMetadata): Document
}

@ConsistentCopyVisibility
data class FileMetadata private constructor(val summary: Summary, val tags: Set<Tag>) {
    companion object {
        operator fun invoke(summary: Summary, tags: Set<Tag>): Either<DomainError, FileMetadata> {
            if (tags.any { it.tag.isBlank() }) {
                return failure(ValidationError("Metadata tags cannot contain blank values"))
            }
            return success(FileMetadata(summary, tags))
        }
    }
}

@JvmInline
value class DocumentId private constructor(val id: String) {
    companion object {
        operator fun invoke(id: String): Either<DomainError, DocumentId> {
            if (id.isBlank()) return failure(ValidationError("DocumentId cannot be blank"))
            return success(DocumentId(id))
        }
    }
}

@JvmInline
value class PatientId private constructor(val id: String) {
    companion object {
        operator fun invoke(id: String): Either<DomainError, PatientId> {
            if (id.isBlank()) return failure(ValidationError("PatientId cannot be blank"))
            return success(PatientId(id))
        }
    }
}

@JvmInline
value class DoctorId private constructor(val id: String) {
    companion object {
        operator fun invoke(id: String): Either<DomainError, DoctorId> {
            if (id.isBlank()) return failure(ValidationError("DoctorId cannot be blank"))
            return success(DoctorId(id))
        }
    }
}

@JvmInline
value class IssueDate private constructor(val date: LocalDate) {
    companion object {
        operator fun invoke(date: LocalDate): Either<DomainError, IssueDate> {
            if (date.isAfter(LocalDate.now())) {
                return failure(ValidationError("IssueDate cannot be in the future"))
            }
            return success(IssueDate(date))
        }

        @Suppress("unused") fun now(): IssueDate = IssueDate(LocalDate.now())
    }
}

@JvmInline
value class Title private constructor(val value: String) {
    companion object {
        operator fun invoke(value: String): Either<DomainError, Title> {
            if (value.isBlank()) return failure(ValidationError("Title cannot be blank"))
            if (value.length > 200) {
                return failure(ValidationError("Title cannot exceed 200 characters"))
            }
            return success(Title(value))
        }
    }
}

@JvmInline
value class Summary private constructor(val summary: String) {
    companion object {
        operator fun invoke(summary: String): Either<DomainError, Summary> {
            if (summary.isBlank()) return failure(ValidationError("Summary cannot be blank"))
            if (summary.length > 2000) {
                return failure(ValidationError("Summary cannot exceed 2000 characters"))
            }
            return success(Summary(summary))
        }
    }
}

@JvmInline
value class Tag private constructor(val tag: String) {
    companion object {
        operator fun invoke(tag: String): Either<DomainError, Tag> {
            if (tag.isBlank()) return failure(ValidationError("Tag cannot be blank"))
            if (tag.length > 100) {
                return failure(ValidationError("Tag cannot exceed 100 characters"))
            }
            return success(Tag(tag))
        }
    }
}
