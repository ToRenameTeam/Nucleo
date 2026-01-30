package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.AppointmentRepository
import kotlinx.datetime.toJavaLocalDateTime
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction

class ExposedAppointmentRepository : AppointmentRepository {

    private suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction { block() }

    override suspend fun save(appointment: Appointment): Appointment = dbQuery {
        AppointmentsTable.insert {
            it[appointmentId] = appointment.id.value
            it[patientId] = appointment.patientId.value
            it[availabilityId] = appointment.availabilityId.value
            it[doctorId] = appointment.doctorId.value
            it[facilityId] = appointment.facilityId.value
            it[serviceTypeId] = appointment.serviceTypeId.value
            it[startDateTime] = appointment.timeSlot.startDateTime.toJavaLocalDateTime()
            it[durationMinutes] = appointment.timeSlot.durationMinutes
            it[status] = appointment.status.name
            it[createdAt] = appointment.createdAt.toJavaLocalDateTime()
            it[updatedAt] = appointment.updatedAt.toJavaLocalDateTime()
        }
        appointment
    }

    override suspend fun findAll(): List<Appointment> = dbQuery {
        AppointmentsTable.selectAll().map { it.toAppointment() }
    }
}
