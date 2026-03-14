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

        val doctorId =
            DoctorId(doctorId).getOrElse {
                return failure(it)
            }
        val facilityId =
            FacilityId(facilityId).getOrElse {
                return failure(it)
            }
        val serviceTypeId =
            ServiceTypeId(serviceTypeId).getOrElse {
                return failure(it)
            }

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

        val availabilityId =
            AvailabilityId(id).getOrElse {
                return failure(it)
            }
        val availability = repository.findById(availabilityId)

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
        val doctorIdValue =
            doctorId?.let {
                DoctorId(it).getOrElse { error ->
                    return failure(error)
                }
            }
        val facilityIdValue =
            facilityId?.let {
                FacilityId(it).getOrElse { error ->
                    return failure(error)
                }
            }
        val serviceTypeIdValue =
            serviceTypeId?.let {
                ServiceTypeId(it).getOrElse { error ->
                    return failure(error)
                }
            }
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

        val availabilityId =
            AvailabilityId(id).getOrElse {
                return failure(it)
            }
        val availability =
            repository.findById(availabilityId) ?: return failure(AvailabilityError.NotFound(id))

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
                    facilityId =
                        facilityId?.let {
                            FacilityId(it).getOrElse { err ->
                                return failure(err)
                            }
                        },
                    serviceTypeId =
                        serviceTypeId?.let {
                            ServiceTypeId(it).getOrElse { err ->
                                return failure(err)
                            }
                        },
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

        val availabilityId =
            AvailabilityId(id).getOrElse {
                return failure(it)
            }
        val availability =
            repository.findById(availabilityId) ?: return failure(AvailabilityError.NotFound(id))

        val cancelled =
            availability.cancel().getOrElse {
                return failure(it)
            }
        repository.update(cancelled)

        logger.info("Availability cancelled successfully with ID: $id")
        return success(Unit)
    }
}
