package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

data class Appointment(
    val id: AppointmentId,
    val patientId: PatientId,
    val availabilityId: AvailabilityId,
    val doctorId: DoctorId,
    val facilityId: FacilityId,
    val serviceTypeId: ServiceTypeId,
    val timeSlot: TimeSlot,
    val status: AppointmentStatus,
    val createdAt: LocalDateTime = Clock.System.now().toLocalDateTime(TimeZone.UTC),
    val updatedAt: LocalDateTime = Clock.System.now().toLocalDateTime(TimeZone.UTC)
) {
    companion object {
        fun schedule(
            patientId: PatientId,
            availabilityId: AvailabilityId,
            doctorId: DoctorId,
            facilityId: FacilityId,
            serviceTypeId: ServiceTypeId,
            timeSlot: TimeSlot
        ): Appointment {
            return Appointment(
                id = AppointmentId.generate(),
                patientId = patientId,
                availabilityId = availabilityId,
                doctorId = doctorId,
                facilityId = facilityId,
                serviceTypeId = serviceTypeId,
                timeSlot = timeSlot,
                status = AppointmentStatus.SCHEDULED
            )
        }
    }

    fun complete(): Appointment {
        require(status.canTransitionTo(AppointmentStatus.COMPLETED)) {
            "Cannot complete appointment in status $status"
        }
        return copy(
            status = AppointmentStatus.COMPLETED,
            updatedAt = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        )
    }

    fun markNoShow(): Appointment {
        require(status.canTransitionTo(AppointmentStatus.NO_SHOW)) {
            "Cannot mark as no-show appointment in status $status"
        }
        return copy(
            status = AppointmentStatus.NO_SHOW,
            updatedAt = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        )
    }

    fun cancel(): Appointment {
        require(status.canTransitionTo(AppointmentStatus.CANCELLED)) {
            "Cannot cancel appointment in status $status"
        }
        return copy(
            status = AppointmentStatus.CANCELLED,
            updatedAt = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        )
    }

    fun reschedule(newTimeSlot: TimeSlot, newAvailabilityId: AvailabilityId): Appointment {
        require(status == AppointmentStatus.SCHEDULED) {
            "Can only reschedule appointments in SCHEDULED status"
        }
        return copy(
            availabilityId = newAvailabilityId,
            timeSlot = newTimeSlot,
            updatedAt = Clock.System.now().toLocalDateTime(TimeZone.UTC)
        )
    }
}
