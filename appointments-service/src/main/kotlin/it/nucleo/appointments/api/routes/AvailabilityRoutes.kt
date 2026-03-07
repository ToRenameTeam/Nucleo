package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.*
import it.nucleo.appointments.api.respondEither
import it.nucleo.appointments.api.respondEitherNoContent
import it.nucleo.appointments.application.AvailabilityService
import it.nucleo.appointments.domain.errors.map

/**
 * Registers all availability-related routes under `/availabilities`.
 * - `POST /availabilities` – create a new availability slot for a doctor
 * - `GET /availabilities` – list availability slots (filterable by doctorId, facilityId,
 *   serviceTypeId, status)
 * - `GET /availabilities/{id}` – retrieve an availability slot by ID
 * - `PUT /availabilities/{id}` – update an availability slot
 * - `DELETE /availabilities/{id}` – cancel an availability slot
 */
fun Route.availabilityRoutes(service: AvailabilityService) {
    route("/availabilities") {

        // POST /availabilities
        // Creates a new availability slot and assigns it to the given doctor and facility.
        post {
            val request =
                try {
                    call.receive<CreateAvailabilityRequest>()
                } catch (_: Exception) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Invalid request body", code = "INVALID_BODY")
                    )
                }

            val result =
                service.createAvailability(
                    doctorId = request.doctorId,
                    facilityId = request.facilityId,
                    serviceTypeId = request.serviceTypeId,
                    timeSlot = request.timeSlot,
                )
            call.respondEither(result, HttpStatusCode.Created) { it.toResponse() }
        }

        // GET /availabilities?doctorId=&facilityId=&serviceTypeId=&status=
        // Returns all availability slots, optionally filtered by doctor, facility, service type,
        // and/or status.
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

        // GET /availabilities/{id}
        // Retrieves an availability slot by its ID.
        get("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Availability ID is required", code = "MISSING_ID")
                    )

            val result = service.getAvailabilityById(id).map { it.toResponse() }
            call.respondEither(result)
        }

        // PUT /availabilities/{id}
        // Updates the facility, service type, and/or time slot of an existing availability.
        put("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@put call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Availability ID is required", code = "MISSING_ID")
                    )

            val request =
                try {
                    call.receive<UpdateAvailabilityRequest>()
                } catch (_: Exception) {
                    return@put call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Invalid request body", code = "INVALID_BODY")
                    )
                }

            val result =
                service
                    .updateAvailability(
                        id = id,
                        facilityId = request.facilityId,
                        serviceTypeId = request.serviceTypeId,
                        timeSlot = request.timeSlot,
                    )
                    .map { it.toResponse() }
            call.respondEither(result)
        }

        // DELETE /availabilities/{id}
        // Cancels an availability slot. Responds with 204 No Content on success.
        delete("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@delete call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Availability ID is required", code = "MISSING_ID")
                    )

            val result = service.cancelAvailability(id)
            call.respondEitherNoContent(result)
        }
    }
}
