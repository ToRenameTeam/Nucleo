package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.valueobjects.*
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

    fun book(): Availability {
        require(status == AvailabilityStatus.AVAILABLE) {
            "Cannot book availability that is not AVAILABLE"
        }
        return copy(status = AvailabilityStatus.BOOKED)
    }

    fun cancel(): Availability {
        require(status != AvailabilityStatus.BOOKED) {
            "Cannot cancel availability that is already BOOKED"
        }
        return copy(status = AvailabilityStatus.CANCELLED)
    }

    fun update(
        facilityId: FacilityId? = null,
        serviceTypeId: ServiceTypeId? = null,
        timeSlot: TimeSlot? = null
    ): Availability {
        require(status != AvailabilityStatus.BOOKED) {
            "Cannot modify availability that is already BOOKED"
        }
        return copy(
            facilityId = facilityId ?: this.facilityId,
            serviceTypeId = serviceTypeId ?: this.serviceTypeId,
            timeSlot = timeSlot ?: this.timeSlot
        )
    }
}
