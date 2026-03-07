package it.nucleo.documents.domain.prescription.implementation

import it.nucleo.documents.domain.DoctorId
import it.nucleo.documents.domain.Document
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.FileMetadata
import it.nucleo.documents.domain.IssueDate
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.Title
import it.nucleo.documents.domain.prescription.Prescription
import it.nucleo.documents.domain.prescription.Validity

data class ServicePrescription(
    override val id: DocumentId,
    override val doctorId: DoctorId,
    override val patientId: PatientId,
    override val issueDate: IssueDate,
    override val title: Title,
    override val metadata: FileMetadata,
    override val validity: Validity,
    val serviceId: ServiceId,
    val facilityId: FacilityId,
    val priority: Priority
) : Prescription {
    override fun withMetadata(newMetadata: FileMetadata): Document = copy(metadata = newMetadata)
}

@JvmInline value class ServiceId(val id: String)

@JvmInline value class FacilityId(val id: String)

enum class Priority {
    ROUTINE,
    URGENT,
    DEFERRED
}
