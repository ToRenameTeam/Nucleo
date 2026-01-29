package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.*
import it.nucleo.appointments.api.toResponse
import it.nucleo.appointments.domain.Availability
import it.nucleo.appointments.domain.valueobjects.*
import it.nucleo.appointments.infrastructure.persistence.AvailabilityRepository
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("AvailabilityRoutes")

fun Route.availabilityRoutes(repository: AvailabilityRepository) {

    route("/availabilities") {

        // Create availability
        post {
            try {
                val request = call.receive<CreateAvailabilityRequest>()
                logger.info("Creating availability for doctor: ${request.doctorId}")
                
                val doctorId = DoctorId.fromString(request.doctorId)
                val facilityId = FacilityId.fromString(request.facilityId)
                val serviceTypeId = ServiceTypeId.fromString(request.serviceTypeId)
                
                // Check for overlaps
                val hasOverlap = repository.checkOverlap(doctorId, request.timeSlot)
                
                if (hasOverlap) {
                    logger.warn("Overlap detected for doctor: $doctorId in time slot: ${request.timeSlot}")
                    call.respond(
                        HttpStatusCode.Conflict,
                        ErrorResponse(
                            message = "The doctor already has an availability that overlaps with the requested time slot (${request.timeSlot.startDateTime} - ${request.timeSlot.endDateTime})",
                            code = "OVERLAP_ERROR"
                        )
                    )
                    return@post
                }
                
                val availability = Availability.create(
                    doctorId = doctorId,
                    facilityId = facilityId,
                    serviceTypeId = serviceTypeId,
                    timeSlot = request.timeSlot
                )
                
                val saved = repository.save(availability)
                logger.info("Availability created successfully with ID: ${saved.availabilityId}")
                call.respond(HttpStatusCode.Created, saved.toResponse())
                
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for creating availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(message = e.message ?: "Invalid request", code = "INVALID_REQUEST")
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
                val id = call.parameters["id"] ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                )
                logger.info("Fetching availability by ID: $id")

                val availability = repository.findById(AvailabilityId.fromString(id))

                if (availability == null) {
                    logger.warn("Availability not found with ID: $id")
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Availability not found", code = "NOT_FOUND")
                    )
                } else {
                    logger.info("Availability found with ID: $id")
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
                val doctorId = call.request.queryParameters["doctorId"]?.let { DoctorId.fromString(it) }
                val facilityId = call.request.queryParameters["facilityId"]?.let { FacilityId.fromString(it) }
                val serviceTypeId = call.request.queryParameters["serviceTypeId"]?.let { ServiceTypeId.fromString(it) }
                val status = call.request.queryParameters["status"]?.let { AvailabilityStatus.valueOf(it) }
                logger.info("Fetching availabilities with filters - doctorId: $doctorId, facilityId: $facilityId, serviceTypeId: $serviceTypeId, status: $status")

                val availabilities = repository.findByFilters(doctorId, facilityId, serviceTypeId, status)
                logger.info("Found ${availabilities.size} availabilities")

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
                val id = call.parameters["id"] ?: return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                )
                logger.info("Updating availability with ID: $id")

                val request = call.receive<UpdateAvailabilityRequest>()

                val availability = repository.findById(AvailabilityId.fromString(id))
                    ?: return@put call.respond(
                    HttpStatusCode.NotFound,
                    ErrorResponse(message = "Availability not found", code = "NOT_FOUND")
                )
                
                // Check for overlaps if time slot is being changed
                if (request.timeSlot != null) {
                    val hasOverlap = repository.checkOverlap(
                        availability.doctorId, 
                        request.timeSlot,
                        availability.availabilityId
                    )
                    
                    if (hasOverlap) {
                        logger.warn("Overlap detected when updating availability $id for doctor: ${availability.doctorId}")
                        call.respond(
                            HttpStatusCode.Conflict,
                            ErrorResponse(
                                message = "The doctor already has an availability that overlaps with the requested time slot (${request.timeSlot.startDateTime} - ${request.timeSlot.endDateTime})",
                                code = "OVERLAP_ERROR"
                            )
                        )
                        return@put
                    }
                }
                
                val updated = availability.update(
                    facilityId = request.facilityId?.let { FacilityId.fromString(it) },
                    serviceTypeId = request.serviceTypeId?.let { ServiceTypeId.fromString(it) },
                    timeSlot = request.timeSlot
                )

                val saved = repository.update(updated)

                if (saved == null) {
                    logger.warn("Availability not found when updating with ID: $id")
                    call.respond(
                        HttpStatusCode.NotFound,
                        ErrorResponse(message = "Availability not found", code = "NOT_FOUND")
                    )
                } else {
                    logger.info("Availability updated successfully with ID: $id")
                    call.respond(HttpStatusCode.OK, saved.toResponse())
                }

            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for updating availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(message = e.message ?: "Invalid request", code = "INVALID_REQUEST")
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
                val id = call.parameters["id"] ?: return@delete call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                )
                logger.info("Cancelling availability with ID: $id")
                
                val availability = repository.findById(AvailabilityId.fromString(id))
                    ?: return@delete call.respond(
                    HttpStatusCode.NotFound,
                    ErrorResponse(message = "Availability not found", code = "NOT_FOUND")
                )
                
                val cancelled = availability.cancel()
                
                repository.update(cancelled)
                logger.info("Availability cancelled successfully with ID: $id")
                
                call.respond(HttpStatusCode.NoContent)
                
            } catch (e: IllegalArgumentException) {
                logger.error("Invalid request for cancelling availability: ${e.message}", e)
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(message = e.message ?: "Invalid request", code = "INVALID_REQUEST")
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
