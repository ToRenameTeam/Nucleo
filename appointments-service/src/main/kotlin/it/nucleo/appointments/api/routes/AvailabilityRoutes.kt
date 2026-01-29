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

                val doctorId = DoctorId.fromString(request.doctorId)
                val facilityId = FacilityId.fromString(request.facilityId)
                val serviceTypeId = ServiceTypeId.fromString(request.serviceTypeId)
                val availability =
                    Availability.create(
                        doctorId = doctorId,
                        facilityId = facilityId,
                        serviceTypeId = serviceTypeId,
                        timeSlot = request.timeSlot
                    )

                val saved = repository.save(availability)
                call.respond(HttpStatusCode.Created, saved.toResponse())
            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse(
                        message = e.message ?: "Invalid request",
                        code = "INVALID_REQUEST"
                    )
                )
            } catch (e: Exception) {
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
    }
}
