package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.Availability
import it.nucleo.appointments.domain.valueobjects.AvailabilityId
import it.nucleo.appointments.domain.valueobjects.AvailabilityStatus
import it.nucleo.appointments.domain.valueobjects.DoctorId
import it.nucleo.appointments.domain.valueobjects.FacilityId
import it.nucleo.appointments.domain.valueobjects.ServiceTypeId
import kotlinx.datetime.toJavaLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction

interface AvailabilityRepository {
    suspend fun save(availability: Availability): Availability
    suspend fun findById(id: AvailabilityId): Availability?
    suspend fun findByFilters(
        doctorId: DoctorId? = null,
        facilityId: FacilityId? = null,
        serviceTypeId: ServiceTypeId? = null,
        status: AvailabilityStatus? = null
    ): List<Availability>
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

    override suspend fun findById(id: AvailabilityId): Availability? = dbQuery {
        AvailabilitiesTable
            .selectAll()
            .where { AvailabilitiesTable.availabilityId eq id.value }
            .map { it.toAvailability() }
            .singleOrNull()
    }

    override suspend fun findByFilters(
        doctorId: DoctorId?,
        facilityId: FacilityId?,
        serviceTypeId: ServiceTypeId?,
        status: AvailabilityStatus?
    ): List<Availability> = dbQuery {
        var query = AvailabilitiesTable.selectAll()

        doctorId?.let {
            query = query.where { AvailabilitiesTable.doctorId eq it.value }
        }
        facilityId?.let {
            query = query.andWhere { AvailabilitiesTable.facilityId eq it.value }
        }
        serviceTypeId?.let {
            query = query.andWhere { AvailabilitiesTable.serviceTypeId eq it.value }
        }
        status?.let {
            query = query.andWhere { AvailabilitiesTable.status eq it.name }
        }

        query.map { it.toAvailability() }
    }
}
