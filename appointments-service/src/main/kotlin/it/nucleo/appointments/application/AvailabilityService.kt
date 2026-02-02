package it.nucleo.appointments.application

import it.nucleo.appointments.domain.Availability
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.*
import org.slf4j.LoggerFactory

class AvailabilityService(private val repository: AvailabilityRepository) {

    private val logger = LoggerFactory.getLogger(AvailabilityService::class.java)

    data class CreateAvailabilityCommand(
        val doctorId: String,
        val facilityId: String,
        val serviceTypeId: String,
        val timeSlot: TimeSlot
    )

    data class UpdateAvailabilityCommand(
        val id: String,
        val facilityId: String?,
        val serviceTypeId: String?,
        val timeSlot: TimeSlot?
    )

    suspend fun createAvailability(command: CreateAvailabilityCommand): Availability {
        logger.info("Creating availability for doctor: ${command.doctorId}")

        val doctorId = DoctorId.fromString(command.doctorId)
        val facilityId = FacilityId.fromString(command.facilityId)
        val serviceTypeId = ServiceTypeId.fromString(command.serviceTypeId)

        // Check for overlaps
        val hasOverlap = repository.checkOverlap(doctorId, command.timeSlot)

        if (hasOverlap) {
            logger.warn("Overlap detected for doctor: $doctorId in time slot: ${command.timeSlot}")
            throw AvailabilityOverlapException(
                "The doctor already has an availability that overlaps with the requested time slot (${command.timeSlot.startDateTime} - ${command.timeSlot.endDateTime})"
            )
        }

        val availability =
            Availability.create(
                doctorId = doctorId,
                facilityId = facilityId,
                serviceTypeId = serviceTypeId,
                timeSlot = command.timeSlot
            )

        val saved = repository.save(availability)
        logger.info("Availability created successfully with ID: ${saved.availabilityId}")
        return saved
    }

    suspend fun getAvailabilityById(id: String): Availability? {
        logger.info("Fetching availability by ID: $id")
        val availability = repository.findById(AvailabilityId.fromString(id))

        if (availability == null) {
            logger.warn("Availability not found with ID: $id")
        } else {
            logger.info("Availability found with ID: $id")
        }

        return availability
    }

    suspend fun getAvailabilitiesByFilters(
        doctorId: String?,
        facilityId: String?,
        serviceTypeId: String?,
        status: String?
    ): List<Availability> {
        val doctorIdValue = doctorId?.let { DoctorId.fromString(it) }
        val facilityIdValue = facilityId?.let { FacilityId.fromString(it) }
        val serviceTypeIdValue = serviceTypeId?.let { ServiceTypeId.fromString(it) }
        val statusValue = status?.let { AvailabilityStatus.valueOf(it) }

        logger.info(
            "Fetching availabilities with filters - doctorId: $doctorIdValue, facilityId: $facilityIdValue, serviceTypeId: $serviceTypeIdValue, status: $statusValue"
        )

        val availabilities =
            repository.findByFilters(
                doctorIdValue,
                facilityIdValue,
                serviceTypeIdValue,
                statusValue
            )
        logger.info("Found ${availabilities.size} availabilities")

        return availabilities
    }

    suspend fun updateAvailability(command: UpdateAvailabilityCommand): Availability? {
        logger.info("Updating availability with ID: ${command.id}")

        val availability = repository.findById(AvailabilityId.fromString(command.id)) ?: return null

        // Check for overlaps if time slot is being changed
        if (command.timeSlot != null) {
            val hasOverlap =
                repository.checkOverlap(
                    availability.doctorId,
                    command.timeSlot,
                    availability.availabilityId
                )

            if (hasOverlap) {
                logger.warn(
                    "Overlap detected when updating availability ${command.id} for doctor: ${availability.doctorId}"
                )
                throw AvailabilityOverlapException(
                    "The doctor already has an availability that overlaps with the requested time slot (${command.timeSlot.startDateTime} - ${command.timeSlot.endDateTime})"
                )
            }
        }

        val updated =
            availability.update(
                facilityId = command.facilityId?.let { FacilityId.fromString(it) },
                serviceTypeId = command.serviceTypeId?.let { ServiceTypeId.fromString(it) },
                timeSlot = command.timeSlot
            )

        val saved = repository.update(updated)

        if (saved == null) {
            logger.warn("Availability not found when updating with ID: ${command.id}")
        } else {
            logger.info("Availability updated successfully with ID: ${command.id}")
        }

        return saved
    }

    suspend fun cancelAvailability(id: String): Boolean {
        logger.info("Cancelling availability with ID: $id")

        val availability = repository.findById(AvailabilityId.fromString(id)) ?: return false

        val cancelled = availability.cancel()
        repository.update(cancelled)

        logger.info("Availability cancelled successfully with ID: $id")
        return true
    }
}

class AvailabilityOverlapException(message: String) : Exception(message)
