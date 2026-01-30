package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.*
import it.nucleo.appointments.api.toResponse
import it.nucleo.appointments.application.AvailabilityService
import it.nucleo.appointments.application.AvailabilityOverlapException
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("AvailabilityRoutes")

fun Route.availabilityRoutes(service: AvailabilityService) {

    route("/availabilities") {

        // Create availability
        post {
            try {
                val request = call.receive<CreateAvailabilityRequest>()
                
                val command = AvailabilityService.CreateAvailabilityCommand(
                    doctorId = request.doctorId,
                    facilityId = request.facilityId,
                    serviceTypeId = request.serviceTypeId,
                    timeSlot = request.timeSlot
                )
                
                val availability = service.createAvailability(command)
                call.respond(HttpStatusCode.Created, availability.toResponse())
            } catch (e: AvailabilityOverlapException) {
                logger.warn("Overlap error: ${e.message}", e)
                call.respond(
                    HttpStatusCode.Conflict,
                    ErrorResponse(
                        message = e.message ?: "Overlap error",
                        code = "OVERLAP_ERROR"
                    )
                )
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for creating availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid request",
                        code = "INVALID_REQUEST"
                    )
                )
            } catch (e: Exception) {
                logger.error("Error creating availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }

        // Get availability by ID
        get("/{id}") {
            try {
                val id =
                    call.parameters["id"]
                        ?: return@get call.respond(
                            HttpStatusCode.BadRequest,
                            ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                        )

                val availability = service.getAvailabilityById(id)

                if (availability == null) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Availability not found", code = "NOT_FOUND")
                    )
                } else {
                    call.respond(HttpStatusCode.OK, availability.toResponse())
                }
            } catch (e: Exception) {
                logger.error("Error fetching availability by ID: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }

        // Get all availabilities (with filters)
        get {
            try {
                val doctorId = call.request.queryParameters["doctorId"]
                val facilityId = call.request.queryParameters["facilityId"]
                val serviceTypeId = call.request.queryParameters["serviceTypeId"]
                val status = call.request.queryParameters["status"]

                val availabilities = service.getAvailabilitiesByFilters(
                    doctorId = doctorId,
                    facilityId = facilityId,
                    serviceTypeId = serviceTypeId,
                    status = status
                )

                call.respond(HttpStatusCode.OK, availabilities.map { it.toResponse() })
            } catch (e: Exception) {
                logger.error("Error fetching availabilities: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }

        // Update availability
        put("/{id}") {
            try {
                val id =
                    call.parameters["id"]
                        ?: return@put call.respond(
                            HttpStatusCode.BadRequest,
                            ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                        )

                val request = call.receive<UpdateAvailabilityRequest>()

                val command = AvailabilityService.UpdateAvailabilityCommand(
                    id = id,
                    facilityId = request.facilityId,
                    serviceTypeId = request.serviceTypeId,
                    timeSlot = request.timeSlot
                )

                val updated = service.updateAvailability(command)

                if (updated == null) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Availability not found", code = "NOT_FOUND")
                    )
                } else {
                    call.respond(HttpStatusCode.OK, updated.toResponse())
                }
            } catch (e: AvailabilityOverlapException) {
                logger.warn("Overlap error: ${e.message}", e)
                call.respond(
                    HttpStatusCode.Conflict,
                    ErrorResponse(
                        message = e.message ?: "Overlap error",
                        code = "OVERLAP_ERROR"
                    )
                )
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for updating availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid request",
                        code = "INVALID_REQUEST"
                    )
                )
            } catch (e: Exception) {
                logger.error("Error updating availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }

        // Delete availability
        delete("/{id}") {
            try {
                val id =
                    call.parameters["id"]
                        ?: return@delete call.respond(
                            HttpStatusCode.BadRequest,
                            ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                        )

                val cancelled = service.cancelAvailability(id)

                if (!cancelled) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Availability not found", code = "NOT_FOUND")
                    )
                } else {
                    call.respond(HttpStatusCode.NoContent)
                }
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for cancelling availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid request",
                        code = "INVALID_REQUEST"
                    )
                )
            } catch (e: Exception) {
                logger.error("Error cancelling availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }
    }
}
