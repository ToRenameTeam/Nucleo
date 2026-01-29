package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.toKotlinLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.datetime

object AppointmentsTable : Table("appointments") {
    val appointmentId = varchar("appointment_id", 50).uniqueIndex()
    val patientId = varchar("patient_id", 50)
    val availabilityId = varchar("availability_id", 50)
    val doctorId = varchar("doctor_id", 50)
    val facilityId = varchar("facility_id", 50)
    val serviceTypeId = varchar("service_type_id", 50)
    val startDateTime = datetime("start_date_time")
    val durationMinutes = integer("duration_minutes")
    val status = varchar("status", 20)
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")

    override val primaryKey = PrimaryKey(appointmentId)
}

fun ResultRow.toAppointment(): Appointment {
    return Appointment(
        id = AppointmentId.fromString(this[AppointmentsTable.appointmentId]),
        patientId = PatientId.fromString(this[AppointmentsTable.patientId]),
        availabilityId = AvailabilityId.fromString(this[AppointmentsTable.availabilityId]),
        doctorId = DoctorId.fromString(this[AppointmentsTable.doctorId]),
        facilityId = FacilityId.fromString(this[AppointmentsTable.facilityId]),
        serviceTypeId = ServiceTypeId.fromString(this[AppointmentsTable.serviceTypeId]),
        timeSlot =
            TimeSlot(
                startDateTime = this[AppointmentsTable.startDateTime].toKotlinLocalDateTime(),
                durationMinutes = this[AppointmentsTable.durationMinutes]
            ),
        status = AppointmentStatus.valueOf(this[AppointmentsTable.status]),
        createdAt = this[AppointmentsTable.createdAt].toKotlinLocalDateTime(),
        updatedAt = this[AppointmentsTable.updatedAt].toKotlinLocalDateTime()
    )
}
