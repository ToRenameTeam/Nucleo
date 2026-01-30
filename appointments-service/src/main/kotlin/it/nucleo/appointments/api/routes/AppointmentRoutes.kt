package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.CreateAppointmentRequest
import it.nucleo.appointments.api.dto.ErrorResponse
import it.nucleo.appointments.api.dto.UpdateAppointmentRequest
import it.nucleo.appointments.api.toResponse
import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.AppointmentRepository
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.AppointmentId
import it.nucleo.appointments.domain.valueobjects.AppointmentStatus
import it.nucleo.appointments.domain.valueobjects.AvailabilityId
import it.nucleo.appointments.domain.valueobjects.AvailabilityStatus
import it.nucleo.appointments.domain.valueobjects.DoctorId
import it.nucleo.appointments.domain.valueobjects.FacilityId
import it.nucleo.appointments.domain.valueobjects.PatientId
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("AppointmentRoutes")

fun Route.appointmentRoutes(
    appointmentRepository: AppointmentRepository,
    availabilityRepository: AvailabilityRepository
) {
    route("/appointments") {
        // Create appointment
        post {
            try {
                val request = call.receive<CreateAppointmentRequest>()
                logger.info("Creating appointment for patient: ${request.patientId}")

                val patientId = PatientId.fromString(request.patientId)
                val availabilityId = AvailabilityId.fromString(request.availabilityId)

                val availability = availabilityRepository.findById(availabilityId)

                if (availability == null) {
                    logger.warn("Availability not found: $availabilityId")
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(
                            message = "Availability not found",
                            code = "AVAILABILITY_NOT_FOUND"
                        )
                    )
                    return@post
                }

                if (availability.status != AvailabilityStatus.AVAILABLE) {
                    logger.warn("Availability is not available: ${availability.status}")
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(
                            message = "Availability is not available",
                            code = "AVAILABILITY_NOT_AVAILABLE"
                        )
                    )
                    return@post
                }

                val appointment =
                    Appointment.schedule(
                        patientId = patientId,
                        availabilityId = availabilityId,
                        doctorId = availability.doctorId,
                        facilityId = availability.facilityId,
                        serviceTypeId = availability.serviceTypeId,
                        timeSlot = availability.timeSlot
                    )

                val savedAppointment = appointmentRepository.save(appointment)

                val bookedAvailability = availability.book()
                availabilityRepository.update(bookedAvailability)

                logger.info("Appointment created successfully with ID: ${savedAppointment.id}")
                call.respond(HttpStatusCode.Created, savedAppointment.toResponse())
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for creating appointment: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid request",
                        code = "INVALID_REQUEST"
                    )
                )
            } catch (e: Exception) {
                logger.error("Error creating appointment: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }

        // Get appointment by ID
        get("/{id}") {
            try {
                val id =
                    call.parameters["id"]
                        ?: return@get call.respond(
                            HttpStatusCode.BadRequest,
                            ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                        )
                logger.info("Fetching appointment by ID: $id")

                val appointment = appointmentRepository.findById(
                    AppointmentId.fromString(id)
                )

                if (appointment == null) {
                    logger.warn("Appointment not found with ID: $id")
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Appointment not found", code = "NOT_FOUND")
                    )
                } else {
                    logger.info("Appointment found with ID: $id")
                    call.respond(HttpStatusCode.OK, appointment.toResponse())
                }
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid appointment ID: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid ID",
                        code = "INVALID_ID"
                    )
                )
            } catch (e: Exception) {
                logger.error("Error fetching appointment by ID: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }

        // Get all appointments (with filters)
        get {
            try {
                val patientId =
                    call.request.queryParameters["patientId"]?.let { PatientId.fromString(it) }
                val doctorId =
                    call.request.queryParameters["doctorId"]?.let {
                        DoctorId.fromString(it)
                    }
                val facilityId =
                    call.request.queryParameters["facilityId"]?.let {
                        FacilityId.fromString(it)
                    }
                val status =
                    call.request.queryParameters["status"]?.let {
                        AppointmentStatus.valueOf(it)
                    }
                val startDate =
                    call.request.queryParameters["startDate"]?.let {
                        kotlinx.datetime.LocalDateTime.parse(it)
                    }
                val endDate =
                    call.request.queryParameters["endDate"]?.let {
                        kotlinx.datetime.LocalDateTime.parse(it)
                    }

                logger.info(
                    "Fetching appointments with filters - patientId: $patientId, doctorId: $doctorId, facilityId: $facilityId, status: $status, startDate: $startDate, endDate: $endDate"
                )

                val appointments =
                    appointmentRepository.findByFilters(
                        patientId,
                        doctorId,
                        facilityId,
                        status,
                        startDate,
                        endDate
                    )

                logger.info("Found ${appointments.size} appointments")
                call.respond(HttpStatusCode.OK, appointments.map { it.toResponse() })
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid query parameters: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid query parameters",
                        code = "INVALID_QUERY_PARAMETERS"
                    )
                )
            } catch (e: Exception) {
                logger.error("Error fetching appointments: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }

        // Update appointment
        put("/{id}") {
            try {
                val id =
                    call.parameters["id"]
                        ?: return@put call.respond(
                            HttpStatusCode.BadRequest,
                            ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                        )
                logger.info("Updating appointment with ID: $id")

                val request = call.receive<UpdateAppointmentRequest>()

                val appointment =
                    appointmentRepository.findById(
                        AppointmentId.fromString(id)
                    )
                        ?: return@put call.respond(
                            HttpStatusCode.NotFound,
                            ErrorResponse(message = "Appointment not found", code = "NOT_FOUND")
                        )

                val updated = when {
                    request.status != null -> {
                        val newStatus = AppointmentStatus.valueOf(request.status)
                        when (newStatus) {
                            AppointmentStatus.COMPLETED -> appointment.complete()
                            AppointmentStatus.CANCELLED -> appointment.cancel()
                            AppointmentStatus.NO_SHOW -> appointment.markNoShow()
                            else -> throw IllegalArgumentException(
                                "Cannot update to status: $newStatus. Use appropriate endpoints."
                            )
                        }
                    }
                    request.availabilityId != null -> {
                        val newAvailabilityId = AvailabilityId.fromString(request.availabilityId)
                        
                        // Validate new availability
                        val newAvailability = availabilityRepository.findById(newAvailabilityId)
                        if (newAvailability == null) {
                            return@put call.respond(
                                HttpStatusCode.NotFound,
                                ErrorResponse(
                                    message = "New availability not found",
                                    code = "AVAILABILITY_NOT_FOUND"
                                )
                            )
                        }

                        if (newAvailability.status != AvailabilityStatus.AVAILABLE) {
                            return@put call.respond(
                                HttpStatusCode.BadRequest,
                                ErrorResponse(
                                    message = "New availability is not available",
                                    code = "AVAILABILITY_NOT_AVAILABLE"
                                )
                            )
                        }

                        // Use the timeSlot from the availability
                        appointment.reschedule(newAvailability.timeSlot, newAvailabilityId)
                    }
                    else -> throw IllegalArgumentException(
                        "Must provide either status or availabilityId"
                    )
                }

                val saved = appointmentRepository.update(updated)

                if (saved == null) {
                    logger.warn("Appointment not found when updating with ID: $id")
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Appointment not found", code = "NOT_FOUND")
                    )
                } else {
                    logger.info("Appointment updated successfully with ID: $id")
                    call.respond(HttpStatusCode.OK, saved.toResponse())
                }
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for updating appointment: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid request",
                        code = "INVALID_REQUEST"
                    )
                )
            } catch (e: Exception) {
                logger.error("Error updating appointment: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }
    }
}
