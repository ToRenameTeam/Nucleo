package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.*
import it.nucleo.commons.errors.getOrElse
import kotlinx.datetime.toKotlinLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.datetime

object AppointmentsTable : Table("appointments") {
    val appointmentId = varchar("appointment_id", 50).uniqueIndex()
    val patientId = varchar("patient_id", 50)
    val availabilityId = varchar("availability_id", 50)
    val status = varchar("status", 20)
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")

    override val primaryKey = PrimaryKey(appointmentId)
}

fun ResultRow.toAppointment(): Appointment {
    val id =
        AppointmentId(this[AppointmentsTable.appointmentId]).getOrElse {
            throw IllegalStateException("Invalid persisted appointmentId: ${it.message}")
        }
    val patientId =
        PatientId(this[AppointmentsTable.patientId]).getOrElse {
            throw IllegalStateException("Invalid persisted patientId: ${it.message}")
        }
    val availabilityId =
        AvailabilityId(this[AppointmentsTable.availabilityId]).getOrElse {
            throw IllegalStateException("Invalid persisted availabilityId: ${it.message}")
        }

    return Appointment(
        id = id,
        patientId = patientId,
        availabilityId = availabilityId,
        status = AppointmentStatus.valueOf(this[AppointmentsTable.status]),
        createdAt = this[AppointmentsTable.createdAt].toKotlinLocalDateTime(),
        updatedAt = this[AppointmentsTable.updatedAt].toKotlinLocalDateTime()
    )
}
