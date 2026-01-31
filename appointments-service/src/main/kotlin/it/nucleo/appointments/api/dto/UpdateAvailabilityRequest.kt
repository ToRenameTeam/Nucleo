package it.nucleo.appointments.api.dto

import it.nucleo.appointments.domain.valueobjects.TimeSlot
import kotlinx.serialization.Serializable

@Serializable
data class UpdateAvailabilityRequest(
    val facilityId: String? = null,
    val serviceTypeId: String? = null,
    val timeSlot: TimeSlot? = null
)
