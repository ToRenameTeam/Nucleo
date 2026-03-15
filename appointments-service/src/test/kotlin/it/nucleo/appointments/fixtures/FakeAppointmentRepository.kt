package it.nucleo.appointments.fixtures

import it.nucleo.appointments.domain.*

/** In-memory fake implementation of [AppointmentRepository] for unit testing. */
class FakeAppointmentRepository(
    private val appointmentExists: Boolean = true,
) : AppointmentRepository {

    private var savedAppointment: Appointment? = null

    override suspend fun save(appointment: Appointment): Appointment {
        savedAppointment = appointment
        return appointment
    }

    override suspend fun findById(id: AppointmentId): Appointment? {
        if (!appointmentExists) return null
        return AppointmentFixtures.appointment(id = id.value)
    }

    override suspend fun findByFilters(
        patientId: PatientId?,
        doctorId: DoctorId?,
        status: AppointmentStatus?,
    ): List<Appointment> {
        if (!appointmentExists) return emptyList()
        return listOf(AppointmentFixtures.appointment())
    }

    override suspend fun update(appointment: Appointment): Appointment? {
        if (!appointmentExists) return null
        return appointment
    }
}
