package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.errors.*
import java.util.UUID
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

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
value class AppointmentId(val value: String) {
    companion object {
        fun generate(): AppointmentId = AppointmentId(UUID.randomUUID().toString())

        fun fromString(value: String): AppointmentId = AppointmentId(value)
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
value class PatientId(val value: String) {
    companion object {
        fun fromString(value: String): PatientId = PatientId(value)
    }

    override fun toString(): String = value
}
