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

@Serializable
data class UpdateAvailabilityRequest(
    val facilityId: String? = null,
    val serviceTypeId: String? = null,
    val timeSlot: TimeSlot? = null
)

@Serializable
data class AvailabilityResponse(
    val availabilityId: String,
    val doctorId: String,
    val facilityId: String,
    val serviceTypeId: String,
    val timeSlot: TimeSlot,
    val status: String
)
