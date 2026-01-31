package it.nucleo.appointments.api

import it.nucleo.appointments.api.dto.AppointmentResponse
import it.nucleo.appointments.api.dto.AvailabilityResponse
import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.Availability

fun Availability.toResponse(): AvailabilityResponse {
    return AvailabilityResponse(
        availabilityId = availabilityId.value,
        doctorId = doctorId.value,
        facilityId = facilityId.value,
        serviceTypeId = serviceTypeId.value,
        timeSlot = timeSlot,
        status = status.name
    )
}

fun Appointment.toResponse(): AppointmentResponse {
    return AppointmentResponse(
        appointmentId = id.value,
        patientId = patientId.value,
        availabilityId = availabilityId.value,
        status = status.name,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString()
    )
}
