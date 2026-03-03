package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.errors.*
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
value class AvailabilityId(val value: String) {
    init {
        require(value.isNotBlank()) { "AvailabilityId cannot be blank" }
        require(isValidUUID(value)) { "AvailabilityId must be a valid UUID" }
    }

    companion object {
        fun generate(): AvailabilityId = AvailabilityId(UUID.randomUUID().toString())

        fun fromString(value: String): AvailabilityId = AvailabilityId(value)

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
value class DoctorId(val value: String) {
    init {
        require(value.isNotBlank()) { "DoctorId cannot be blank" }
        require(value.length <= 50) { "DoctorId cannot exceed 50 characters" }
    }

    companion object {
        fun fromString(value: String): DoctorId = DoctorId(value)
    }

    override fun toString(): String = value
}

@Serializable
@JvmInline
value class FacilityId(val value: String) {
    init {
        require(value.isNotBlank()) { "FacilityId cannot be blank" }
        require(value.length <= 50) { "FacilityId cannot exceed 50 characters" }
    }

    companion object {
        fun fromString(value: String): FacilityId = FacilityId(value)
    }

    override fun toString(): String = value
}

@Serializable
@JvmInline
value class ServiceTypeId(val value: String) {
    init {
        require(value.isNotBlank()) { "ServiceTypeId cannot be blank" }
        require(value.length <= 50) { "ServiceTypeId cannot exceed 50 characters" }
    }

    companion object {
        fun fromString(value: String): ServiceTypeId = ServiceTypeId(value)
    }

    override fun toString(): String = value
}

@Serializable
data class TimeSlot(val startDateTime: LocalDateTime, val durationMinutes: Int) {
    init {
        require(durationMinutes > 0) { "Duration must be positive" }
        require(durationMinutes <= 1440) { "Duration cannot exceed 24 hours (1440 minutes)" }
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
