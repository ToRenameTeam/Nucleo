package it.nucleo.appointments.api

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.appointments.domain.errors.toHttpStatusCode
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.commons.errors.DomainError
import it.nucleo.commons.errors.Either
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("ErrorMapping")

/**
 * Responds with the result of a domain operation.
 *
 * On success, applies [transform] to the value and responds with [successStatus]. On failure, maps
 * the [DomainError] to the appropriate HTTP status and error response.
 */
suspend fun <T> RoutingCall.respondEither(
    result: Either<DomainError, T>,
    successStatus: HttpStatusCode = HttpStatusCode.OK,
    transform: (T) -> Any = { it as Any }
) {
    when (result) {
        is Either.Right -> respond(successStatus, transform(result.value))
        is Either.Left -> respondError(result.error)
    }
}

/** Responds with 204 No Content on success, or maps the error on failure. */
suspend fun RoutingCall.respondEitherNoContent(result: Either<DomainError, Unit>) {
    when (result) {
        is Either.Right -> respond(HttpStatusCode.NoContent)
        is Either.Left -> respondError(result.error)
    }
}

private suspend fun RoutingCall.respondError(error: DomainError) {
    val status = error.toHttpStatusCode()
    if (status.value >= 500) {
        logger.error("Internal error: ${error.message}")
    } else {
        logger.warn("Domain error: ${error.message}")
    }
    respond(status, ErrorResponse(error = error.errorCode, message = error.message))
}
