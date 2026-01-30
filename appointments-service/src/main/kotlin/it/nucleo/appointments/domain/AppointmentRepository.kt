package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.LocalDateTime

interface AppointmentRepository {
    suspend fun save(appointment: Appointment): Appointment

    suspend fun findById(id: AppointmentId): Appointment?

    suspend fun findByFilters(
        patientId: PatientId? = null,
        doctorId: DoctorId? = null,
        facilityId: FacilityId? = null,
        status: AppointmentStatus? = null,
        startDate: LocalDateTime? = null,
        endDate: LocalDateTime? = null
    ): List<Appointment>
}
