package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.valueobjects.*

interface AvailabilityRepository {
    suspend fun save(availability: Availability): Availability

    suspend fun findById(id: AvailabilityId): Availability?

    suspend fun findByFilters(
        doctorId: DoctorId? = null,
        facilityId: FacilityId? = null,
        serviceTypeId: ServiceTypeId? = null,
        status: AvailabilityStatus? = null
    ): List<Availability>

    suspend fun update(availability: Availability): Availability?

    suspend fun checkOverlap(
        doctorId: DoctorId,
        timeSlot: TimeSlot,
        excludeId: AvailabilityId? = null
    ): Boolean
}
