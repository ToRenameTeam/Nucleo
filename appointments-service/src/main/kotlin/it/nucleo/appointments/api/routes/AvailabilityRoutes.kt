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

        // Get all availabilities
        get {
            try {
                val availabilities = repository.findAll()

                call.respond(HttpStatusCode.OK, availabilities.map { it.toResponse() })
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse(message = "Internal server error", code = "INTERNAL_ERROR")
                )
            }
        }
    }
}
