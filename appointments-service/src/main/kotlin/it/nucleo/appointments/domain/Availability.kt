package it.nucleo.appointments.domain

import it.nucleo.appointments.domain.errors.*
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
