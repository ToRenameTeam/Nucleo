package it.nucleo.api.plugins

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.domain.repository.DocumentNotFoundException
import it.nucleo.domain.repository.RepositoryException
import kotlinx.serialization.json.Json

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
                encodeDefaults = true
                classDiscriminator = "type"
            }
        )
    }
}

fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<DocumentNotFoundException> { call, cause ->
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse(
                    error = "not_found",
                    message = "Document not found",
                    details = cause.message
                )
            )
        }

        exception<RepositoryException> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(
                    error = "internal_error",
                    message = "Repository operation failed",
                    details = cause.message
                )
            )
        }

        exception<IllegalArgumentException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(
                    error = "bad_request",
                    message = "Invalid request",
                    details = cause.message
                )
            )
        }

        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(
                    error = "internal_error",
                    message = "An unexpected error occurred",
                    details = cause.message
                )
            )
        }

        status(HttpStatusCode.NotFound) { call, status ->
            call.respond(
                status,
                ErrorResponse(error = "not_found", message = "The requested resource was not found")
            )
        }

        status(HttpStatusCode.MethodNotAllowed) { call, status ->
            call.respond(
                status,
                ErrorResponse(
                    error = "method_not_allowed",
                    message = "The HTTP method is not allowed for this resource"
                )
            )
        }
    }
}
