package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.CreateAppointmentRequest
import it.nucleo.appointments.api.dto.UpdateAppointmentRequest
import it.nucleo.appointments.api.dto.toDetailsResponse
import it.nucleo.appointments.api.dto.toResponse
import it.nucleo.appointments.api.respondEither
import it.nucleo.appointments.api.respondEitherNoContent
import it.nucleo.appointments.application.AppointmentService
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.commons.errors.map

/**
 * Registers all appointment-related routes under `/api/appointments`.
 * - `POST /api/appointments` – book a new appointment
 * - `GET /api/appointments` – list appointments (filterable by patientId, doctorId, status)
 * - `GET /api/appointments/{id}` – retrieve an appointment by ID
 * - `GET /api/appointments/{id}/details` – retrieve an appointment with full availability data
 * - `PUT /api/appointments/{id}` – update an appointment's status or availability slot
 * - `DELETE /api/appointments/{id}` – cancel an appointment
 */
fun Route.appointmentRoutes(service: AppointmentService) {
    route("/appointments") {

        // POST /api/appointments
        // Books a new appointment by linking a patient to an available slot.
        post {
            val request =
                try {
                    call.receive<CreateAppointmentRequest>()
                } catch (_: Exception) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(error = "INVALID_BODY", message = "Invalid request body")
                    )
                }

            val result =
                service.createAppointment(
                    patientId = request.patientId,
                    availabilityId = request.availabilityId,
                )
            call.respondEither(result, HttpStatusCode.Created) { it.toResponse() }
        }

        // GET /api/appointments?patientId=&doctorId=&status=
        // Returns all appointments, optionally filtered by patient, doctor, and/or status.
        get {
            val patientId = call.request.queryParameters["patientId"]
            val doctorId = call.request.queryParameters["doctorId"]
            val status = call.request.queryParameters["status"]

            val result =
                service
                    .getAppointmentsByFilters(
                        patientId = patientId,
                        doctorId = doctorId,
                        status = status
                    )
                    .map { appointments -> appointments.map { it.toResponse() } }

            call.respondEither(result)
        }

        // GET /api/appointments/{id}
        // Retrieves an appointment by its ID.
        get("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(error = "MISSING_ID", message = "Appointment ID is required")
                    )

            val result = service.getAppointmentById(id).map { it.toResponse() }
            call.respondEither(result)
        }

        // GET /api/appointments/{id}/details
        // Retrieves an appointment enriched with the joined availability data (doctor, facility,
        // slot).
        get("/{id}/details") {
            val id =
                call.parameters["id"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(error = "MISSING_ID", message = "Appointment ID is required")
                    )

            val result = service.getAppointmentDetails(id).map { it.toDetailsResponse() }
            call.respondEither(result)
        }

        // PUT /api/appointments/{id}
        // Updates an appointment's status and/or reassigns it to a different availability slot.
        put("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@put call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(error = "MISSING_ID", message = "Appointment ID is required")
                    )

            val request =
                try {
                    call.receive<UpdateAppointmentRequest>()
                } catch (_: Exception) {
                    return@put call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(error = "INVALID_BODY", message = "Invalid request body")
                    )
                }

            val result =
                service
                    .updateAppointment(
                        id = id,
                        status = request.status,
                        availabilityId = request.availabilityId,
                        updatedBy = request.updatedBy,
                    )
                    .map { it.toResponse() }
            call.respondEither(result)
        }

        // DELETE /api/appointments/{id}
        // Cancels an appointment. Responds with 204 No Content on success.
        delete("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@delete call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(error = "MISSING_ID", message = "Appointment ID is required")
                    )

            val result = service.deleteAppointment(id)
            call.respondEitherNoContent(result)
        }
    }
}
