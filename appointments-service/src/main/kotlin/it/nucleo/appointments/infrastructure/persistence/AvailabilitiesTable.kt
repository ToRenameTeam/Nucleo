package it.nucleo.appointments.infrastructure.persistence

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