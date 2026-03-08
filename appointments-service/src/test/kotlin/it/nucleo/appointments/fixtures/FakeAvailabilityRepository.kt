package it.nucleo.appointments.fixtures

import it.nucleo.appointments.domain.*

/** In-memory fake implementation of [AvailabilityRepository] for unit testing. */
class FakeAvailabilityRepository(
    private val availabilityExists: Boolean = true,
    private val overlapDetected: Boolean = false,
    private val availabilityStatus: AvailabilityStatus = AvailabilityStatus.AVAILABLE,
) : AvailabilityRepository {

    override suspend fun save(availability: Availability): Availability = availability

    override suspend fun findById(id: AvailabilityId): Availability? {
        if (!availabilityExists) return null
        return AppointmentFixtures.availability(id = id.value, status = availabilityStatus)
    }

    override suspend fun findByFilters(
        doctorId: DoctorId?,
        facilityId: FacilityId?,
        serviceTypeId: ServiceTypeId?,
        status: AvailabilityStatus?,
    ): List<Availability> {
        if (!availabilityExists) return emptyList()
        return listOf(AppointmentFixtures.availability())
    }

    override suspend fun update(availability: Availability): Availability? {
        if (!availabilityExists) return null
        return availability
    }

    override suspend fun checkOverlap(
        doctorId: DoctorId,
        timeSlot: TimeSlot,
        excludeId: AvailabilityId?,
    ): Boolean = overlapDetected
}
