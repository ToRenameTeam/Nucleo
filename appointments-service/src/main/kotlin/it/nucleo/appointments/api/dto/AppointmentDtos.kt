package it.nucleo.appointments.api.dto

import it.nucleo.appointments.domain.TimeSlot
import kotlinx.serialization.Serializable

@Serializable
data class CreateAppointmentRequest(val patientId: String, val availabilityId: String)

@Serializable
data class UpdateAppointmentRequest(val availabilityId: String? = null, val status: String? = null)

@Serializable
data class AppointmentResponse(
    val appointmentId: String,
    val patientId: String,
    val availabilityId: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class AppointmentDetailsResponse(
    val appointmentId: String,
    val patientId: String,
    val availabilityId: String,
    val doctorId: String,
    val facilityId: String,
    val serviceTypeId: String,
    val timeSlot: TimeSlot,
    val status: String,
    val availabilityStatus: String,
    val createdAt: String,
    val updatedAt: String
)
