package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.*
import it.nucleo.appointments.api.respondEither
import it.nucleo.appointments.api.respondEitherNoContent
import it.nucleo.appointments.api.toResponse
import it.nucleo.appointments.application.AvailabilityService
import it.nucleo.appointments.domain.errors.map

fun Route.availabilityRoutes(service: AvailabilityService) {

    route("/availabilities") {

        // Create availability
        post {
            val request = call.receive<CreateAvailabilityRequest>()

            val command =
                AvailabilityService.CreateAvailabilityCommand(
                    doctorId = request.doctorId,
                    facilityId = request.facilityId,
                    serviceTypeId = request.serviceTypeId,
                    timeSlot = request.timeSlot
                )

            val result = service.createAvailability(command)
            call.respondEither(result, HttpStatusCode.Created) { it.toResponse() }
        }

        // Get availability by ID
        get("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                    )

            val result = service.getAvailabilityById(id).map { it.toResponse() }
            call.respondEither(result)
        }

        // Get all availabilities (with filters)
        get {
            val doctorId = call.request.queryParameters["doctorId"]
            val facilityId = call.request.queryParameters["facilityId"]
            val serviceTypeId = call.request.queryParameters["serviceTypeId"]
            val status = call.request.queryParameters["status"]

            val result =
                service
                    .getAvailabilitiesByFilters(
                        doctorId = doctorId,
                        facilityId = facilityId,
                        serviceTypeId = serviceTypeId,
                        status = status
                    )
                    .map { availabilities -> availabilities.map { it.toResponse() } }

            call.respondEither(result)
        }

        // Update availability
        put("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@put call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                    )

            val request = call.receive<UpdateAvailabilityRequest>()

            val command =
                AvailabilityService.UpdateAvailabilityCommand(
                    id = id,
                    facilityId = request.facilityId,
                    serviceTypeId = request.serviceTypeId,
                    timeSlot = request.timeSlot
                )

            val result = service.updateAvailability(command).map { it.toResponse() }
            call.respondEither(result)
        }

        // Delete availability
        delete("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@delete call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                    )

            val result = service.cancelAvailability(id)
            call.respondEitherNoContent(result)
        }
    }
}
