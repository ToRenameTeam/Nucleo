package it.nucleo.domain.prescription

import it.nucleo.domain.DoctorId
import it.nucleo.domain.DocumentId
import it.nucleo.domain.IssueDate
import it.nucleo.domain.Metadata
import it.nucleo.domain.PatientId

data class ServicePrescription(
    override val id: DocumentId,
    override val doctorId: DoctorId,
    override val patientId: PatientId,
    override val issueDate: IssueDate,
    override val metadata: Metadata,
    override val validity: Validity,
    val serviceId: ServiceId,
    val facilityId: FacilityId,
    val priority: Priority
) : Prescription

@JvmInline value class ServiceId(val id: String)

@JvmInline value class FacilityId(val id: String)

enum class Priority {
    ROUTINE,
    URGENT,
    DEFERRED
}
