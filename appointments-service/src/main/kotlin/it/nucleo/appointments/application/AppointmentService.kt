package it.nucleo.appointments.application

import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.AppointmentRepository
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.*
import org.slf4j.LoggerFactory

class AppointmentService(
    private val appointmentRepository: AppointmentRepository,
    private val availabilityRepository: AvailabilityRepository
) {

    private val logger = LoggerFactory.getLogger(AppointmentService::class.java)

    data class CreateAppointmentCommand(val patientId: String, val availabilityId: String)

    data class UpdateAppointmentCommand(
        val id: String,
        val status: String?,
        val availabilityId: String?
    )

    suspend fun createAppointment(command: CreateAppointmentCommand): Appointment {
        logger.info("Creating appointment for patient: ${command.patientId}")

        val patientId = PatientId.fromString(command.patientId)
        val availabilityId = AvailabilityId.fromString(command.availabilityId)

        val availability =
            availabilityRepository.findById(availabilityId)
                ?: throw AvailabilityNotFoundException("Availability not found: $availabilityId")

        if (availability.status != AvailabilityStatus.AVAILABLE) {
            logger.warn("Availability is not available: ${availability.status}")
            throw AvailabilityNotAvailableException("Availability is not available")
        }

        val appointment =
            Appointment.schedule(patientId = patientId, availabilityId = availabilityId)

        val savedAppointment = appointmentRepository.save(appointment)

        val bookedAvailability = availability.book()
        availabilityRepository.update(bookedAvailability)

        logger.info("Appointment created successfully with ID: ${savedAppointment.id}")
        return savedAppointment
    }

    suspend fun getAppointmentById(id: String): Appointment? {
        logger.info("Fetching appointment by ID: $id")
        val appointment = appointmentRepository.findById(AppointmentId.fromString(id))

        if (appointment == null) {
            logger.warn("Appointment not found with ID: $id")
        } else {
            logger.info("Appointment found with ID: $id")
        }

        return appointment
    }

    suspend fun getAppointmentsByFilters(patientId: String?, status: String?): List<Appointment> {
        val patientIdValue = patientId?.let { PatientId.fromString(it) }
        val statusValue = status?.let { AppointmentStatus.valueOf(it) }

        logger.info(
            "Fetching appointments with filters - patientId: $patientIdValue, status: $statusValue"
        )

        val appointments = appointmentRepository.findByFilters(patientIdValue, statusValue)

        logger.info("Found ${appointments.size} appointments")
        return appointments
    }

    suspend fun updateAppointment(command: UpdateAppointmentCommand): Appointment? {
        logger.info("Updating appointment with ID: ${command.id}")

        val appointment =
            appointmentRepository.findById(AppointmentId.fromString(command.id)) ?: return null

        val updated =
            when {
                command.status != null -> {
                    val newStatus = AppointmentStatus.valueOf(command.status)
                    when (newStatus) {
                        AppointmentStatus.COMPLETED -> appointment.complete()
                        AppointmentStatus.CANCELLED -> appointment.cancel()
                        AppointmentStatus.NO_SHOW -> appointment.markNoShow()
                        else ->
                            throw IllegalArgumentException(
                                "Cannot update to status: $newStatus. Use appropriate endpoints."
                            )
                    }
                }
                command.availabilityId != null -> {
                    val newAvailabilityId = AvailabilityId.fromString(command.availabilityId)

                    // Validate new availability
                    val newAvailability =
                        availabilityRepository.findById(newAvailabilityId)
                            ?: throw AvailabilityNotFoundException("New availability not found")

                    if (newAvailability.status != AvailabilityStatus.AVAILABLE) {
                        throw AvailabilityNotAvailableException("New availability is not available")
                    }

                    // Free up the old availability and book the new one
                    val oldAvailability =
                        availabilityRepository.findById(appointment.availabilityId)
                    oldAvailability?.let { availabilityRepository.update(it.makeAvailable()) }
                    availabilityRepository.update(newAvailability.book())

                    appointment.reschedule(newAvailabilityId)
                }
                else ->
                    throw IllegalArgumentException("Must provide either status or availabilityId")
            }

        val saved = appointmentRepository.update(updated)

        if (saved == null) {
            logger.warn("Appointment not found when updating with ID: ${command.id}")
        } else {
            logger.info("Appointment updated successfully with ID: ${command.id}")
        }

        return saved
    }

    suspend fun deleteAppointment(id: String): Boolean {
        logger.info("Deleting appointment with ID: $id")

        val appointmentId = AppointmentId.fromString(id)
        val appointment = appointmentRepository.findById(appointmentId)

        if (appointment == null) {
            logger.warn("Appointment not found with ID: $id")
            return false
        }

        // Update appointment status to CANCELLED
        val cancelled = appointment.cancel()
        appointmentRepository.update(cancelled)

        // Free up the availability
        val availability = availabilityRepository.findById(appointment.availabilityId)
        if (availability != null) {
            val freedAvailability = availability.makeAvailable()
            availabilityRepository.update(freedAvailability)
        }

        logger.info("Appointment deleted successfully with ID: $id")
        return true
    }
}

class AvailabilityNotFoundException(message: String) : Exception(message)

class AvailabilityNotAvailableException(message: String) : Exception(message)
