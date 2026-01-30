package it.nucleo.api.plugins

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.httpMethod
import io.ktor.server.request.uri
import io.ktor.server.response.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.domain.DocumentNotFoundException
import it.nucleo.domain.RepositoryException
import it.nucleo.infrastructure.logging.logger
import kotlinx.serialization.json.Json

private val logger = logger("it.nucleo.api.plugins.StatusPages")

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
                encodeDefaults = true
                classDiscriminator = "_t"
            }
        )
    }
}

fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<DocumentNotFoundException> { call, cause ->
            logger.warn("Document not found: ${cause.message}")
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
            logger.error("Repository operation failed: ${cause.message}", cause)
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
            logger.warn("Invalid request: ${cause.message}")
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
            logger.error("Unexpected error occurred: ${cause.message}", cause)
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
            logger.debug("Resource not found: ${call.request.uri}")
            call.respond(
                status,
                ErrorResponse(error = "not_found", message = "The requested resource was not found")
            )
        }

        status(HttpStatusCode.MethodNotAllowed) { call, status ->
            logger.debug("Method not allowed: ${call.request.httpMethod.value} ${call.request.uri}")
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
