package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.CreateAppointmentRequest
import it.nucleo.appointments.api.dto.ErrorResponse
import it.nucleo.appointments.api.dto.UpdateAppointmentRequest
import it.nucleo.appointments.api.toResponse
import it.nucleo.appointments.application.AppointmentService
import it.nucleo.appointments.application.AvailabilityNotFoundException
import it.nucleo.appointments.application.AvailabilityNotAvailableException
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("AppointmentRoutes")

fun Route.appointmentRoutes(service: AppointmentService) {
    route("/appointments") {
        // Create appointment
        post {
            try {
                val request = call.receive<CreateAppointmentRequest>()
                
                val command = AppointmentService.CreateAppointmentCommand(
                    patientId = request.patientId,
                    availabilityId = request.availabilityId
                )
                
                val appointment = service.createAppointment(command)
                call.respond(HttpStatusCode.Created, appointment.toResponse())
            } catch (e: AvailabilityNotFoundException) {
                logger.warn("Availability not found: ${e.message}", e)
                call.respond(
                    HttpStatusCode.NotFound,
                    ErrorResponse(
                        message = e.message ?: "Availability not found",
                        code = "AVAILABILITY_NOT_FOUND"
                    )
                )
            } catch (e: AvailabilityNotAvailableException) {
                logger.warn("Availability not available: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Availability is not available",
                        code = "AVAILABILITY_NOT_AVAILABLE"
                    )
                )
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

                val appointment = service.getAppointmentById(id)

                if (appointment == null) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Appointment not found", code = "NOT_FOUND")
                    )
                } else {
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
                val patientId = call.request.queryParameters["patientId"]
                val doctorId = call.request.queryParameters["doctorId"]
                val facilityId = call.request.queryParameters["facilityId"]
                val status = call.request.queryParameters["status"]
                val startDate = call.request.queryParameters["startDate"]
                val endDate = call.request.queryParameters["endDate"]

                val appointments = service.getAppointmentsByFilters(
                    patientId = patientId,
                    doctorId = doctorId,
                    facilityId = facilityId,
                    status = status,
                    startDate = startDate,
                    endDate = endDate
                )

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

                val request = call.receive<UpdateAppointmentRequest>()

                val command = AppointmentService.UpdateAppointmentCommand(
                    id = id,
                    status = request.status,
                    availabilityId = request.availabilityId
                )

                val updated = service.updateAppointment(command)

                if (updated == null) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Appointment not found", code = "NOT_FOUND")
                    )
                } else {
                    call.respond(HttpStatusCode.OK, updated.toResponse())
                }
            } catch (e: AvailabilityNotFoundException) {
                logger.warn("Availability not found: ${e.message}", e)
                call.respond(
                    HttpStatusCode.NotFound,
                    ErrorResponse(
                        message = e.message ?: "New availability not found",
                        code = "AVAILABILITY_NOT_FOUND"
                    )
                )
            } catch (e: AvailabilityNotAvailableException) {
                logger.warn("Availability not available: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "New availability is not available",
                        code = "AVAILABILITY_NOT_AVAILABLE"
                    )
                )
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
