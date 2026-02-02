package it.nucleo.domain.uploaded

import it.nucleo.domain.*

/**
 * Represents a medical document that was uploaded as a PDF without complete structured data. This
 * type is used when a PDF is directly uploaded without going through the form-based creation
 * workflow. It contains minimal information and AI-generated metadata.
 */
data class UploadedDocument(
    override val id: DocumentId,
    override val doctorId: DoctorId,
    override val patientId: PatientId,
    override val issueDate: IssueDate,
    override val metadata: FileMetadata,
    val filename: String,
    val documentType: UploadedDocumentType
) : Document {
    override fun withMetadata(newMetadata: FileMetadata): Document = copy(metadata = newMetadata)
}

enum class UploadedDocumentType {
    REPORT,
    PRESCRIPTION,
    OTHER
}
