package it.nucleo.appointments.api.dto

import kotlinx.serialization.Serializable

@Serializable
data class AppointmentResponse(
    val appointmentId: String,
    val patientId: String,
    val availabilityId: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String
)
