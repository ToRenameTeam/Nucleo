package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.valueobjects.*

interface AppointmentRepository {
    suspend fun save(appointment: Appointment): Appointment

    suspend fun findById(id: AppointmentId): Appointment?

    suspend fun findByFilters(
        patientId: PatientId? = null,
        doctorId: DoctorId? = null,
        status: AppointmentStatus? = null
    ): List<Appointment>

    suspend fun update(appointment: Appointment): Appointment?
}
