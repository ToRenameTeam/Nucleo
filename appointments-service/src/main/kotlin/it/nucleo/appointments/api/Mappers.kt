package it.nucleo.appointments.api

import it.nucleo.appointments.api.dto.AppointmentDetailsResponse
import it.nucleo.appointments.api.dto.AppointmentResponse
import it.nucleo.appointments.api.dto.AvailabilityResponse
import it.nucleo.appointments.application.AppointmentService
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

fun AppointmentService.AppointmentDetails.toDetailsResponse(): AppointmentDetailsResponse {
    return AppointmentDetailsResponse(
        appointmentId = appointment.id.value,
        patientId = appointment.patientId.value,
        availabilityId = appointment.availabilityId.value,
        doctorId = availability.doctorId.value,
        facilityId = availability.facilityId.value,
        serviceTypeId = availability.serviceTypeId.value,
        timeSlot = availability.timeSlot,
        status = appointment.status.name,
        availabilityStatus = availability.status.name,
        createdAt = appointment.createdAt.toString(),
        updatedAt = appointment.updatedAt.toString()
    )
}
