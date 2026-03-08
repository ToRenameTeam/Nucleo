package it.nucleo.appointments.application

import it.nucleo.appointments.domain.*
import it.nucleo.appointments.domain.errors.*
import it.nucleo.commons.errors.*
import org.slf4j.LoggerFactory

class AvailabilityService(private val repository: AvailabilityRepository) {

    private val logger = LoggerFactory.getLogger(AvailabilityService::class.java)

    suspend fun createAvailability(
        doctorId: String,
        facilityId: String,
        serviceTypeId: String,
        timeSlot: TimeSlot,
    ): Either<DomainError, Availability> {
        logger.info("Creating availability for doctor: $doctorId")

        val doctorId = DoctorId.fromString(doctorId)
        val facilityId = FacilityId.fromString(facilityId)
        val serviceTypeId = ServiceTypeId.fromString(serviceTypeId)

        val hasOverlap = repository.checkOverlap(doctorId, timeSlot)

        if (hasOverlap) {
            logger.warn("Overlap detected for doctor: $doctorId in time slot: $timeSlot")
            return failure(
                AvailabilityError.OverlapDetected(
                    doctorId = doctorId.value,
                    timeSlotDescription = "${timeSlot.startDateTime} - ${timeSlot.endDateTime}"
                )
            )
        }

        val availability =
            Availability.create(
                doctorId = doctorId,
                facilityId = facilityId,
                serviceTypeId = serviceTypeId,
                timeSlot = timeSlot
            )

        val saved = repository.save(availability)
        logger.info("Availability created successfully with ID: ${saved.availabilityId}")
        return success(saved)
    }

    suspend fun getAvailabilityById(id: String): Either<DomainError, Availability> {
        logger.info("Fetching availability by ID: $id")

        val availability = repository.findById(AvailabilityId.fromString(id))

        if (availability == null) {
            logger.warn("Availability not found with ID: $id")
            return failure(AvailabilityError.NotFound(id))
        }

        logger.info("Availability found with ID: $id")
        return success(availability)
    }

    suspend fun getAvailabilitiesByFilters(
        doctorId: String?,
        facilityId: String?,
        serviceTypeId: String?,
        status: String?
    ): Either<DomainError, List<Availability>> {
        val doctorIdValue = doctorId?.let { DoctorId.fromString(it) }
        val facilityIdValue = facilityId?.let { FacilityId.fromString(it) }
        val serviceTypeIdValue = serviceTypeId?.let { ServiceTypeId.fromString(it) }
        val statusValue = status?.let { AvailabilityStatus.valueOf(it) }

        logger.info(
            "Fetching availabilities with filters - " +
                "doctorId: $doctorIdValue, " +
                "facilityId: $facilityIdValue, " +
                "serviceTypeId: $serviceTypeIdValue, " +
                "status: $statusValue"
        )

        val availabilities =
            repository.findByFilters(
                doctorIdValue,
                facilityIdValue,
                serviceTypeIdValue,
                statusValue
            )
        logger.info("Found ${availabilities.size} availabilities")

        return success(availabilities)
    }

    suspend fun updateAvailability(
        id: String,
        facilityId: String?,
        serviceTypeId: String?,
        timeSlot: TimeSlot?,
    ): Either<DomainError, Availability> {
        logger.info("Updating availability with ID: $id")

        val availability =
            repository.findById(AvailabilityId.fromString(id))
                ?: return failure(AvailabilityError.NotFound(id))

        // Check for overlaps if time slot is being changed
        if (timeSlot != null) {
            val hasOverlap =
                repository.checkOverlap(
                    availability.doctorId,
                    timeSlot,
                    availability.availabilityId
                )

            if (hasOverlap) {
                logger.warn(
                    "Overlap detected when updating availability $id for doctor: ${availability.doctorId}"
                )
                return failure(
                    AvailabilityError.OverlapDetected(
                        doctorId = availability.doctorId.value,
                        timeSlotDescription = "${timeSlot.startDateTime} - ${timeSlot.endDateTime}"
                    )
                )
            }
        }

        val updated =
            availability
                .update(
                    facilityId = facilityId?.let { FacilityId.fromString(it) },
                    serviceTypeId = serviceTypeId?.let { ServiceTypeId.fromString(it) },
                    timeSlot = timeSlot
                )
                .getOrElse {
                    return failure(it)
                }

        val saved = repository.update(updated)

        if (saved == null) {
            logger.warn("Availability not found when updating with ID: $id")
            return failure(AvailabilityError.NotFound(id))
        }

        logger.info("Availability updated successfully with ID: $id")
        return success(saved)
    }

    suspend fun cancelAvailability(id: String): Either<DomainError, Unit> {
        logger.info("Cancelling availability with ID: $id")

        val availability =
            repository.findById(AvailabilityId.fromString(id))
                ?: return failure(AvailabilityError.NotFound(id))

        val cancelled =
            availability.cancel().getOrElse {
                return failure(it)
            }
        repository.update(cancelled)

        logger.info("Availability cancelled successfully with ID: $id")
        return success(Unit)
    }
}
