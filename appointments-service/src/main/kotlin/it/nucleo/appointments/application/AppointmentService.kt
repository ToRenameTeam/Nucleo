package it.nucleo.appointments.application

import it.nucleo.appointments.domain.*
import it.nucleo.appointments.domain.errors.*
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

    data class AppointmentDetails(val appointment: Appointment, val availability: Availability)

    suspend fun createAppointment(
        command: CreateAppointmentCommand
    ): Either<DomainError, Appointment> {
        logger.info("Creating appointment for patient: ${command.patientId}")

        val patientId = PatientId.fromString(command.patientId)
        val availabilityId = AvailabilityId.fromString(command.availabilityId)

        val availability =
            availabilityRepository.findById(availabilityId)
                ?: return failure(AvailabilityError.NotFound(availabilityId.value))

        if (availability.status != AvailabilityStatus.AVAILABLE) {
            logger.warn("Availability is not available: ${availability.status}")
            return failure(AvailabilityError.NotAvailable(availabilityId.value))
        }

        val appointment =
            Appointment.schedule(patientId = patientId, availabilityId = availabilityId)
        val savedAppointment = appointmentRepository.save(appointment)

        val bookedAvailability =
            availability.book().getOrElse {
                return failure(it)
            }
        availabilityRepository.update(bookedAvailability)

        logger.info("Appointment created successfully with ID: ${savedAppointment.id}")
        return success(savedAppointment)
    }

    suspend fun getAppointmentById(id: String): Either<DomainError, Appointment> {
        logger.info("Fetching appointment by ID: $id")

        val appointment = appointmentRepository.findById(AppointmentId.fromString(id))

        if (appointment == null) {
            logger.warn("Appointment not found with ID: $id")
            return failure(AppointmentError.NotFound(id))
        }

        logger.info("Appointment found with ID: $id")
        return success(appointment)
    }

    suspend fun getAppointmentDetails(id: String): Either<DomainError, AppointmentDetails> {
        logger.info("Fetching appointment details by ID: $id")

        val appointment =
            appointmentRepository.findById(AppointmentId.fromString(id))
                ?: run {
                    logger.warn("Appointment not found with ID: $id")
                    return failure(AppointmentError.NotFound(id))
                }

        val availability =
            availabilityRepository.findById(appointment.availabilityId)
                ?: run {
                    logger.error(
                        "Availability not found for appointment ID: $id, availabilityId: ${appointment.availabilityId}"
                    )
                    return failure(AvailabilityError.NotFound(appointment.availabilityId.value))
                }

        logger.info("Appointment details found with ID: $id")
        return success(AppointmentDetails(appointment, availability))
    }

    suspend fun getAppointmentsByFilters(
        patientId: String?,
        doctorId: String?,
        status: String?
    ): Either<DomainError, List<Appointment>> {
        val patientIdValue = patientId?.let { PatientId.fromString(it) }
        val doctorIdValue = doctorId?.let { DoctorId.fromString(it) }
        val statusValue = status?.let { AppointmentStatus.valueOf(it) }

        logger.info(
            "Fetching appointments with filters - patientId: $patientIdValue, doctorId: $doctorIdValue, status: $statusValue"
        )

        val appointments =
            appointmentRepository.findByFilters(patientIdValue, doctorIdValue, statusValue)

        logger.info("Found ${appointments.size} appointments")
        return success(appointments)
    }

    suspend fun updateAppointment(
        command: UpdateAppointmentCommand
    ): Either<DomainError, Appointment> {
        logger.info("Updating appointment with ID: ${command.id}")

        val appointment =
            appointmentRepository.findById(AppointmentId.fromString(command.id))
                ?: return failure(AppointmentError.NotFound(command.id))

        val updated =
            when {
                command.status != null -> {
                    val newStatus = AppointmentStatus.valueOf(command.status)
                    when (newStatus) {
                        AppointmentStatus.COMPLETED -> appointment.complete()
                        AppointmentStatus.CANCELLED -> appointment.cancel()
                        AppointmentStatus.NO_SHOW -> appointment.markNoShow()
                        else ->
                            return failure(
                                AppointmentError.InvalidRequest(
                                    "Cannot update to status: $newStatus. Use appropriate endpoints."
                                )
                            )
                    }.getOrElse {
                        return failure(it)
                    }
                }
                command.availabilityId != null -> {
                    val newAvailabilityId = AvailabilityId.fromString(command.availabilityId)

                    val newAvailability =
                        availabilityRepository.findById(newAvailabilityId)
                            ?: return failure(AvailabilityError.NotFound(newAvailabilityId.value))

                    if (newAvailability.status != AvailabilityStatus.AVAILABLE) {
                        return failure(AvailabilityError.NotAvailable(newAvailabilityId.value))
                    }

                    // Free up the old availability (only if it's currently booked) and book the new
                    // one
                    val oldAvailability =
                        availabilityRepository.findById(appointment.availabilityId)
                    if (oldAvailability?.status == AvailabilityStatus.BOOKED) {
                        val freed =
                            oldAvailability.makeAvailable().getOrElse { err ->
                                return failure(err)
                            }
                        availabilityRepository.update(freed)
                    }
                    val booked =
                        newAvailability.book().getOrElse {
                            return failure(it)
                        }
                    availabilityRepository.update(booked)

                    appointment.reschedule(newAvailabilityId).getOrElse {
                        return failure(it)
                    }
                }
                else ->
                    return failure(
                        AppointmentError.InvalidRequest(
                            "Must provide either status or availabilityId"
                        )
                    )
            }

        val saved = appointmentRepository.update(updated)

        if (saved == null) {
            logger.warn("Appointment not found when updating with ID: ${command.id}")
            return failure(AppointmentError.NotFound(command.id))
        }

        logger.info("Appointment updated successfully with ID: ${command.id}")
        return success(saved)
    }

    suspend fun deleteAppointment(id: String): Either<DomainError, Unit> {
        logger.info("Deleting appointment with ID: $id")

        val appointmentId = AppointmentId.fromString(id)
        val appointment =
            appointmentRepository.findById(appointmentId)
                ?: run {
                    logger.warn("Appointment not found with ID: $id")
                    return failure(AppointmentError.NotFound(id))
                }

        val cancelled =
            appointment.cancel().getOrElse {
                return failure(it)
            }
        appointmentRepository.update(cancelled)

        // Free up the availability if it was booked
        val availability = availabilityRepository.findById(appointment.availabilityId)
        if (availability?.status == AvailabilityStatus.BOOKED) {
            val freed =
                availability.makeAvailable().getOrElse {
                    return failure(it)
                }
            availabilityRepository.update(freed)
        }

        logger.info("Appointment deleted successfully with ID: $id")
        return success(Unit)
    }
}
