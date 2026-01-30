package it.nucleo.appointments.domain

interface AppointmentRepository {
    suspend fun save(appointment: Appointment): Appointment

    suspend fun findAll(): List<Appointment>
}
