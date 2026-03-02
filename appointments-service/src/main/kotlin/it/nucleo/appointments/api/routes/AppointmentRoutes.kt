package it.nucleo.appointments.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.api.dto.CreateAppointmentRequest
import it.nucleo.appointments.api.dto.ErrorResponse
import it.nucleo.appointments.api.dto.UpdateAppointmentRequest
import it.nucleo.appointments.api.respondEither
import it.nucleo.appointments.api.respondEitherNoContent
import it.nucleo.appointments.api.toDetailsResponse
import it.nucleo.appointments.api.toResponse
import it.nucleo.appointments.application.AppointmentService
import it.nucleo.appointments.domain.errors.map

fun Route.appointmentRoutes(service: AppointmentService) {
    route("/appointments") {
        // Create appointment
        post {
            val request = call.receive<CreateAppointmentRequest>()

            val command =
                AppointmentService.CreateAppointmentCommand(
                    patientId = request.patientId,
                    availabilityId = request.availabilityId
                )

            val result = service.createAppointment(command)
            call.respondEither(result, HttpStatusCode.Created) { it.toResponse() }
        }

        // Get appointment by ID
        get("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                    )

            val result = service.getAppointmentById(id).map { it.toResponse() }
            call.respondEither(result)
        }

        // Get appointment details by ID (with joined availability data)
        get("/{id}/details") {
            val id =
                call.parameters["id"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                    )

            val result = service.getAppointmentDetails(id).map { it.toDetailsResponse() }
            call.respondEither(result)
        }

        // Get all appointments (with filters)
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

        // Update appointment
        put("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@put call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                    )

            val request = call.receive<UpdateAppointmentRequest>()

            val command =
                AppointmentService.UpdateAppointmentCommand(
                    id = id,
                    status = request.status,
                    availabilityId = request.availabilityId
                )

            val result = service.updateAppointment(command).map { it.toResponse() }
            call.respondEither(result)
        }

        // Delete appointment
        delete("/{id}") {
            val id =
                call.parameters["id"]
                    ?: return@delete call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse(message = "Missing ID", code = "MISSING_ID")
                    )

            val result = service.deleteAppointment(id)
            call.respondEitherNoContent(result)
        }
    }
}
