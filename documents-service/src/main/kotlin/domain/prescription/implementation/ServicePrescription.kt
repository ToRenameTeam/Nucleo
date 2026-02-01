package it.nucleo.domain.prescription.implementation

import it.nucleo.domain.Document
import it.nucleo.domain.DoctorId
import it.nucleo.domain.DocumentId
import it.nucleo.domain.FileMetadata
import it.nucleo.domain.IssueDate
import it.nucleo.domain.PatientId
import it.nucleo.domain.prescription.Prescription
import it.nucleo.domain.prescription.Validity

data class ServicePrescription(
    override val id: DocumentId,
    override val doctorId: DoctorId,
    override val patientId: PatientId,
    override val issueDate: IssueDate,
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
