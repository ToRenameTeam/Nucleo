package it.nucleo.appointments.api.dto

import kotlinx.serialization.Serializable

@Serializable
data class UpdateAppointmentRequest(
    val availabilityId: String? = null,
    val status: String? = null
)
