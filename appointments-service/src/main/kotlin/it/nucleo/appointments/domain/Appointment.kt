package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.errors.*
import it.nucleo.commons.errors.*
import java.util.UUID
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

private const val MAX_PATIENT_ID_LENGTH = 50

data class Appointment(
    val id: AppointmentId,
    val patientId: PatientId,
    val availabilityId: AvailabilityId,
    val status: AppointmentStatus,
    val createdAt: LocalDateTime = Clock.System.now().toLocalDateTime(TimeZone.UTC),
    val updatedAt: LocalDateTime = Clock.System.now().toLocalDateTime(TimeZone.UTC)
) {
    companion object {
        fun schedule(patientId: PatientId, availabilityId: AvailabilityId): Appointment {
            return Appointment(
                id = AppointmentId.generate(),
                patientId = patientId,
                availabilityId = availabilityId,
                status = AppointmentStatus.SCHEDULED
            )
        }
    }

    fun complete(): Either<AppointmentError.InvalidStatusTransition, Appointment> =
        transitionTo(AppointmentStatus.COMPLETED)

    fun markNoShow(): Either<AppointmentError.InvalidStatusTransition, Appointment> =
        transitionTo(AppointmentStatus.NO_SHOW)

    fun cancel(): Either<AppointmentError.InvalidStatusTransition, Appointment> =
        transitionTo(AppointmentStatus.CANCELLED)

    fun reschedule(
        newAvailabilityId: AvailabilityId
    ): Either<AppointmentError.InvalidStatusTransition, Appointment> {
        if (status != AppointmentStatus.SCHEDULED) {
            return failure(
                AppointmentError.InvalidStatusTransition(
                    from = status.name,
                    to = "SCHEDULED (reschedule)"
                )
            )
        }
        return success(
            copy(
                availabilityId = newAvailabilityId,
                updatedAt = Clock.System.now().toLocalDateTime(TimeZone.UTC)
            )
        )
    }

    private fun transitionTo(
        target: AppointmentStatus
    ): Either<AppointmentError.InvalidStatusTransition, Appointment> {
        if (!status.canTransitionTo(target)) {
            return failure(
                AppointmentError.InvalidStatusTransition(from = status.name, to = target.name)
            )
        }
        return success(
            copy(status = target, updatedAt = Clock.System.now().toLocalDateTime(TimeZone.UTC))
        )
    }
}

@JvmInline
value class AppointmentId private constructor(val value: String) {
    companion object {
        fun generate(): AppointmentId = AppointmentId(UUID.randomUUID().toString())

        operator fun invoke(value: String): Either<DomainError, AppointmentId> {
            if (value.isBlank()) {
                return failure(ValidationError("AppointmentId cannot be blank"))
            }
            return success(AppointmentId(value))
        }
    }

    override fun toString(): String = value
}

enum class AppointmentStatus {
    SCHEDULED,
    COMPLETED,
    NO_SHOW,
    CANCELLED;

    fun canTransitionTo(newStatus: AppointmentStatus): Boolean {
        return when (this) {
            SCHEDULED -> newStatus in setOf(COMPLETED, NO_SHOW, CANCELLED)
            COMPLETED,
            NO_SHOW,
            CANCELLED -> false
        }
    }
}

@JvmInline
value class PatientId private constructor(val value: String) {
    companion object {
        operator fun invoke(value: String): Either<DomainError, PatientId> {
            if (value.isBlank()) {
                return failure(ValidationError("PatientId cannot be blank"))
            }
            if (value.length > MAX_PATIENT_ID_LENGTH) {
                return failure(
                    ValidationError("PatientId cannot exceed $MAX_PATIENT_ID_LENGTH characters")
                )
            }
            return success(PatientId(value))
        }
    }

    override fun toString(): String = value
}
