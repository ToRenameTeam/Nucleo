package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.Availability
import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.toKotlinLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.datetime

object AvailabilitiesTable : Table("availabilities") {
    val availabilityId = varchar("availability_id", 50).uniqueIndex()
    val doctorId = varchar("doctor_id", 50)
    val facilityId = varchar("facility_id", 50)
    val serviceTypeId = varchar("service_type_id", 50)
    val startDateTime = datetime("start_date_time")
    val durationMinutes = integer("duration_minutes")
    val status = varchar("status", 20)

    override val primaryKey = PrimaryKey(availabilityId)
}

fun ResultRow.toAvailability(): Availability {
    return Availability(
        availabilityId = AvailabilityId.fromString(this[AvailabilitiesTable.availabilityId]),
        doctorId = DoctorId.fromString(this[AvailabilitiesTable.doctorId]),
        facilityId = FacilityId.fromString(this[AvailabilitiesTable.facilityId]),
        serviceTypeId = ServiceTypeId.fromString(this[AvailabilitiesTable.serviceTypeId]),
        timeSlot =
            TimeSlot(
                startDateTime = this[AvailabilitiesTable.startDateTime].toKotlinLocalDateTime(),
                durationMinutes = this[AvailabilitiesTable.durationMinutes]
            ),
        status = AvailabilityStatus.valueOf(this[AvailabilitiesTable.status])
    )
}
