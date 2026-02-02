package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.AppointmentRepository
import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.toJavaLocalDateTime
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update

class ExposedAppointmentRepository : AppointmentRepository {

    private suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction { block() }

    override suspend fun save(appointment: Appointment): Appointment = dbQuery {
        AppointmentsTable.insert {
            it[appointmentId] = appointment.id.value
            it[patientId] = appointment.patientId.value
            it[availabilityId] = appointment.availabilityId.value
            it[status] = appointment.status.name
            it[createdAt] = appointment.createdAt.toJavaLocalDateTime()
            it[updatedAt] = appointment.updatedAt.toJavaLocalDateTime()
        }
        appointment
    }

    override suspend fun findById(id: AppointmentId): Appointment? = dbQuery {
        AppointmentsTable.selectAll()
            .where { AppointmentsTable.appointmentId eq id.value }
            .map { it.toAppointment() }
            .singleOrNull()
    }

    override suspend fun findByFilters(
        patientId: PatientId?,
        status: AppointmentStatus?
    ): List<Appointment> = dbQuery {
        var query = AppointmentsTable.selectAll()

        patientId?.let { query = query.where { AppointmentsTable.patientId eq it.value } }
        status?.let { query = query.andWhere { AppointmentsTable.status eq it.name } }

        query.map { it.toAppointment() }
    }

    override suspend fun update(appointment: Appointment): Appointment? = dbQuery {
        val updated =
            AppointmentsTable.update({ AppointmentsTable.appointmentId eq appointment.id.value }) {
                it[patientId] = appointment.patientId.value
                it[availabilityId] = appointment.availabilityId.value
                it[status] = appointment.status.name
                it[updatedAt] = appointment.updatedAt.toJavaLocalDateTime()
            }

        if (updated > 0) appointment else null
    }
}
