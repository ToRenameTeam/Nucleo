package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.Availability
import kotlinx.datetime.toJavaLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction

interface AvailabilityRepository {
    suspend fun save(availability: Availability): Availability

    suspend fun findAll(): List<Availability>
}

class ExposedAvailabilityRepository : AvailabilityRepository {

    private suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction { block() }

    override suspend fun save(availability: Availability): Availability = dbQuery {
        AvailabilitiesTable.insert {
            it[availabilityId] = availability.availabilityId.value
            it[doctorId] = availability.doctorId.value
            it[facilityId] = availability.facilityId.value
            it[serviceTypeId] = availability.serviceTypeId.value
            it[startDateTime] = availability.timeSlot.startDateTime.toJavaLocalDateTime()
            it[durationMinutes] = availability.timeSlot.durationMinutes
            it[status] = availability.status.name
        }
        availability
    }

    override suspend fun findAll(): List<Availability> = dbQuery {
        AvailabilitiesTable.selectAll().map { it.toAvailability() }
    }
}
