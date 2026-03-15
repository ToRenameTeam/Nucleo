package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.*
import it.nucleo.commons.errors.getOrElse
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
    val availabilityId =
        AvailabilityId(this[AvailabilitiesTable.availabilityId]).getOrElse {
            throw IllegalStateException("Invalid persisted availabilityId: ${it.message}")
        }
    val doctorId =
        DoctorId(this[AvailabilitiesTable.doctorId]).getOrElse {
            throw IllegalStateException("Invalid persisted doctorId: ${it.message}")
        }
    val facilityId =
        FacilityId(this[AvailabilitiesTable.facilityId]).getOrElse {
            throw IllegalStateException("Invalid persisted facilityId: ${it.message}")
        }
    val serviceTypeId =
        ServiceTypeId(this[AvailabilitiesTable.serviceTypeId]).getOrElse {
            throw IllegalStateException("Invalid persisted serviceTypeId: ${it.message}")
        }
    val timeSlot =
        TimeSlot(
                startDateTime = this[AvailabilitiesTable.startDateTime].toKotlinLocalDateTime(),
                durationMinutes = this[AvailabilitiesTable.durationMinutes]
            )
            .getOrElse { throw IllegalStateException("Invalid persisted time slot: ${it.message}") }

    return Availability(
        availabilityId = availabilityId,
        doctorId = doctorId,
        facilityId = facilityId,
        serviceTypeId = serviceTypeId,
        timeSlot = timeSlot,
        status = AvailabilityStatus.valueOf(this[AvailabilitiesTable.status])
    )
}
