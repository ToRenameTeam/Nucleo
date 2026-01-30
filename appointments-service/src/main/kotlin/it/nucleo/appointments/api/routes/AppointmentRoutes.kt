package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.CreateAppointmentRequest
import it.nucleo.appointments.api.dto.ErrorResponse
import it.nucleo.appointments.api.toResponse
import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.AppointmentRepository
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.AvailabilityId
import it.nucleo.appointments.domain.valueobjects.AvailabilityStatus
import it.nucleo.appointments.domain.valueobjects.PatientId
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("AppointmentRoutes")

fun Route.appointmentRoutes(
    appointmentRepository: AppointmentRepository,
    availabilityRepository: AvailabilityRepository
) {
    route("/appointments") {
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

        get {
            try {
                logger.info("Fetching all appointments")
                val appointments = appointmentRepository.findAll()
                logger.info("Found ${appointments.size} appointments")
                call.respond(HttpStatusCode.OK, appointments.map { it.toResponse() })
            } catch (e: Exception) {
                logger.error("Error fetching appointments: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }
    }
}
