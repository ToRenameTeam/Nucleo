package it.nucleo.appointments.api.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateAppointmentRequest(val patientId: String, val availabilityId: String)
