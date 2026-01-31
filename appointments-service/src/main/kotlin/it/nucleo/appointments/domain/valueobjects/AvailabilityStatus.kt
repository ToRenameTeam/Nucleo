package it.nucleo.appointments.domain.valueobjects

import kotlinx.serialization.Serializable

@Serializable
enum class AvailabilityStatus {
    AVAILABLE,
    BOOKED,
    CANCELLED
}
