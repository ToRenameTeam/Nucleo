package it.nucleo.appointments.api.dto

import it.nucleo.appointments.domain.valueobjects.TimeSlot
import kotlinx.serialization.Serializable

@Serializable
data class CreateAvailabilityRequest(
    val doctorId: String,
    val facilityId: String,
    val serviceTypeId: String,
    val timeSlot: TimeSlot
)
