package it.nucleo.appointments.fixtures

import it.nucleo.appointments.domain.*
import kotlinx.datetime.LocalDateTime

/**
 * Reusable factory methods that create fully-constructed domain objects for tests. All IDs are
 * deterministic so assertions are straightforward.
 */
object AppointmentFixtures {

    const val PATIENT_ID = "pat-001"
    const val DOCTOR_ID = "doc-001"
    const val FACILITY_ID = "facility-001"
    const val SERVICE_TYPE_ID = "service-001"
    const val APPOINTMENT_ID = "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9"
    const val AVAILABILITY_ID = "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
    const val OTHER_AVAILABILITY_ID = "b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7"

    val DEFAULT_TIME_SLOT =
        TimeSlot(
            startDateTime = LocalDateTime.parse("2026-02-01T09:00:00"),
            durationMinutes = 30,
        )

    val DEFAULT_TIMESTAMP: LocalDateTime = LocalDateTime.parse("2026-01-30T10:00:00")

    fun appointment(
        id: String = APPOINTMENT_ID,
        patientId: String = PATIENT_ID,
        availabilityId: String = AVAILABILITY_ID,
        status: AppointmentStatus = AppointmentStatus.SCHEDULED,
    ) =
        Appointment(
            id = AppointmentId.fromString(id),
            patientId = PatientId.fromString(patientId),
            availabilityId = AvailabilityId.fromString(availabilityId),
            status = status,
            createdAt = DEFAULT_TIMESTAMP,
            updatedAt = DEFAULT_TIMESTAMP,
        )

    fun availability(
        id: String = AVAILABILITY_ID,
        doctorId: String = DOCTOR_ID,
        facilityId: String = FACILITY_ID,
        serviceTypeId: String = SERVICE_TYPE_ID,
        timeSlot: TimeSlot = DEFAULT_TIME_SLOT,
        status: AvailabilityStatus = AvailabilityStatus.AVAILABLE,
    ) =
        Availability(
            availabilityId = AvailabilityId.fromString(id),
            doctorId = DoctorId.fromString(doctorId),
            facilityId = FacilityId.fromString(facilityId),
            serviceTypeId = ServiceTypeId.fromString(serviceTypeId),
            timeSlot = timeSlot,
            status = status,
        )
}
