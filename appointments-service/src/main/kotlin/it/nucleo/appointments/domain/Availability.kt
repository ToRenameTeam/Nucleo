package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.errors.*
import it.nucleo.commons.errors.*
import java.time.Duration
import java.util.UUID
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.toJavaLocalDateTime
import kotlinx.datetime.toKotlinLocalDateTime
import kotlinx.serialization.Serializable

@Serializable
data class Availability(
    val availabilityId: AvailabilityId,
    val doctorId: DoctorId,
    val facilityId: FacilityId,
    val serviceTypeId: ServiceTypeId,
    val timeSlot: TimeSlot,
    val status: AvailabilityStatus
) {
    companion object {
        fun create(
            doctorId: DoctorId,
            facilityId: FacilityId,
            serviceTypeId: ServiceTypeId,
            timeSlot: TimeSlot
        ): Availability {
            return Availability(
                availabilityId = AvailabilityId.generate(),
                doctorId = doctorId,
                facilityId = facilityId,
                serviceTypeId = serviceTypeId,
                timeSlot = timeSlot,
                status = AvailabilityStatus.AVAILABLE
            )
        }
    }

    fun book(): Either<AvailabilityError, Availability> {
        if (status != AvailabilityStatus.AVAILABLE) {
            return failure(AvailabilityError.NotAvailable(availabilityId.value))
        }
        return success(copy(status = AvailabilityStatus.BOOKED))
    }

    fun makeAvailable(): Either<AvailabilityError.InvalidRequest, Availability> {
        if (status != AvailabilityStatus.BOOKED) {
            return failure(
                AvailabilityError.InvalidRequest(
                    "Cannot make available an availability that is not BOOKED"
                )
            )
        }
        return success(copy(status = AvailabilityStatus.AVAILABLE))
    }

    fun cancel(): Either<AvailabilityError.InvalidRequest, Availability> {
        if (status == AvailabilityStatus.BOOKED) {
            return failure(
                AvailabilityError.InvalidRequest(
                    "Cannot cancel availability that is already BOOKED"
                )
            )
        }
        return success(copy(status = AvailabilityStatus.CANCELLED))
    }

    fun update(
        facilityId: FacilityId? = null,
        serviceTypeId: ServiceTypeId? = null,
        timeSlot: TimeSlot? = null
    ): Either<AvailabilityError.InvalidRequest, Availability> {
        if (status == AvailabilityStatus.BOOKED) {
            return failure(
                AvailabilityError.InvalidRequest(
                    "Cannot modify availability that is already BOOKED"
                )
            )
        }
        return success(
            copy(
                facilityId = facilityId ?: this.facilityId,
                serviceTypeId = serviceTypeId ?: this.serviceTypeId,
                timeSlot = timeSlot ?: this.timeSlot
            )
        )
    }
}

@Serializable
@JvmInline
value class AvailabilityId private constructor(val value: String) {
    companion object {
        fun generate(): AvailabilityId = AvailabilityId(UUID.randomUUID().toString())

        operator fun invoke(value: String): Either<DomainError, AvailabilityId> {
            if (value.isBlank()) {
                return failure(ValidationError("AvailabilityId cannot be blank"))
            }
            if (!isValidUUID(value)) {
                return failure(ValidationError("AvailabilityId must be a valid UUID"))
            }
            return success(AvailabilityId(value))
        }

        private fun isValidUUID(value: String): Boolean {
            return try {
                UUID.fromString(value)
                true
            } catch (_: IllegalArgumentException) {
                false
            }
        }
    }

    override fun toString(): String = value
}

@Serializable
enum class AvailabilityStatus {
    AVAILABLE,
    BOOKED,
    CANCELLED
}

@Serializable
@JvmInline
value class DoctorId private constructor(val value: String) {
    companion object {
        operator fun invoke(value: String): Either<DomainError, DoctorId> {
            if (value.isBlank()) {
                return failure(ValidationError("DoctorId cannot be blank"))
            }
            if (value.length > 50) {
                return failure(ValidationError("DoctorId cannot exceed 50 characters"))
            }
            return success(DoctorId(value))
        }
    }

    override fun toString(): String = value
}

@Serializable
@JvmInline
value class FacilityId private constructor(val value: String) {
    companion object {
        operator fun invoke(value: String): Either<DomainError, FacilityId> {
            if (value.isBlank()) {
                return failure(ValidationError("FacilityId cannot be blank"))
            }
            if (value.length > 50) {
                return failure(ValidationError("FacilityId cannot exceed 50 characters"))
            }
            return success(FacilityId(value))
        }
    }

    override fun toString(): String = value
}

@Serializable
@JvmInline
value class ServiceTypeId private constructor(val value: String) {
    companion object {
        operator fun invoke(value: String): Either<DomainError, ServiceTypeId> {
            if (value.isBlank()) {
                return failure(ValidationError("ServiceTypeId cannot be blank"))
            }
            if (value.length > 50) {
                return failure(ValidationError("ServiceTypeId cannot exceed 50 characters"))
            }
            return success(ServiceTypeId(value))
        }
    }

    override fun toString(): String = value
}

@Serializable
@ConsistentCopyVisibility
data class TimeSlot
private constructor(val startDateTime: LocalDateTime, val durationMinutes: Int) {
    companion object {
        operator fun invoke(
            startDateTime: LocalDateTime,
            durationMinutes: Int,
        ): Either<DomainError, TimeSlot> {
            if (durationMinutes <= 0) {
                return failure(ValidationError("Duration must be positive"))
            }
            if (durationMinutes > 1440) {
                return failure(ValidationError("Duration cannot exceed 24 hours (1440 minutes)"))
            }
            return success(TimeSlot(startDateTime, durationMinutes))
        }
    }

    val endDateTime: LocalDateTime
        get() =
            startDateTime
                .toJavaLocalDateTime()
                .plus(Duration.ofMinutes(durationMinutes.toLong()))
                .toKotlinLocalDateTime()

    fun overlaps(other: TimeSlot): Boolean {
        return startDateTime < other.endDateTime && other.startDateTime < endDateTime
    }
}
