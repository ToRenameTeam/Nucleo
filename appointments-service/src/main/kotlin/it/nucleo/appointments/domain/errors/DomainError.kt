package it.nucleo.appointments.domain.errors

import io.ktor.http.*

sealed interface DomainError {
    val message: String
    val errorCode: String
}

sealed interface AppointmentError : DomainError {

    data class NotFound(val id: String) : AppointmentError {
        override val message = "Appointment not found: $id"
        override val errorCode = "APPOINTMENT_NOT_FOUND"
    }

    data class InvalidStatusTransition(val from: String, val to: String) : AppointmentError {
        override val message = "Cannot transition appointment from $from to $to"
        override val errorCode = "INVALID_STATUS_TRANSITION"
    }

    data class InvalidRequest(val reason: String) : AppointmentError {
        override val message = reason
        override val errorCode = "INVALID_REQUEST"
    }
}

sealed interface AvailabilityError : DomainError {

    data class NotFound(val id: String) : AvailabilityError {
        override val message = "Availability not found: $id"
        override val errorCode = "AVAILABILITY_NOT_FOUND"
    }

    data class NotAvailable(val id: String) : AvailabilityError {
        override val message = "Availability is not available: $id"
        override val errorCode = "AVAILABILITY_NOT_AVAILABLE"
    }

    data class OverlapDetected(val doctorId: String, val timeSlotDescription: String) :
        AvailabilityError {
        override val message =
            "The doctor $doctorId already has an availability that overlaps with $timeSlotDescription"
        override val errorCode = "OVERLAP_ERROR"
    }

    data class InvalidRequest(val reason: String) : AvailabilityError {
        override val message = reason
        override val errorCode = "INVALID_REQUEST"
    }
}

data class ValidationError(override val message: String) : DomainError {
    override val errorCode = "VALIDATION_ERROR"
}

data class InternalError(override val message: String, val cause: Throwable? = null) : DomainError {
    override val errorCode = "INTERNAL_ERROR"
}

fun DomainError.toHttpStatusCode(): HttpStatusCode =
    when (this) {
        is AppointmentError.NotFound -> HttpStatusCode.NotFound
        is AppointmentError.InvalidStatusTransition -> HttpStatusCode.BadRequest
        is AppointmentError.InvalidRequest -> HttpStatusCode.BadRequest
        is AvailabilityError.NotFound -> HttpStatusCode.NotFound
        is AvailabilityError.NotAvailable -> HttpStatusCode.BadRequest
        is AvailabilityError.OverlapDetected -> HttpStatusCode.Conflict
        is AvailabilityError.InvalidRequest -> HttpStatusCode.BadRequest
        is ValidationError -> HttpStatusCode.BadRequest
        is InternalError -> HttpStatusCode.InternalServerError
    }
