package it.nucleo.appointments.api

import it.nucleo.appointments.api.dto.AvailabilityResponse
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
