package it.nucleo.documents.api

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.commons.errors.*
import it.nucleo.documents.domain.errors.*
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory

private const val INTERNAL_SERVER_ERROR_THRESHOLD = 500
private val logger = LoggerFactory.getLogger("ErrorMapping")

private val json = Json {
    prettyPrint = true
    isLenient = true
    ignoreUnknownKeys = true
    encodeDefaults = true
    classDiscriminator = "_t"
}

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

/**
 * Responds with the result of a domain operation, using an explicit [KSerializer] for the success
 * value. This is required when the response contains polymorphic types (e.g. a list of sealed class
 * subtypes) because Ktor's `guessSerializer` cannot infer the correct serializer at runtime.
 */
suspend fun <T> RoutingCall.respondEitherJson(
    result: Either<DomainError, T>,
    serializer: KSerializer<T>,
    successStatus: HttpStatusCode = HttpStatusCode.OK
) {
    when (result) {
        is Either.Right -> {
            val jsonText = json.encodeToString(serializer, result.value)
            respond(successStatus, TextContent(jsonText, ContentType.Application.Json))
        }
        is Either.Left -> respondError(result.error)
    }
}

private suspend fun RoutingCall.respondError(error: DomainError) {
    val status = error.toHttpStatusCode()
    if (status.value >= INTERNAL_SERVER_ERROR_THRESHOLD) {
        logger.error("Internal error: ${error.message}")
    } else {
        logger.warn("Domain error: ${error.message}")
    }
    respond(status, ErrorResponse(error = error.errorCode, message = error.message))
}

/**
 * Responds with the given [successStatus] and [successBody] on success, or maps the error on
 * failure.
 */
suspend fun RoutingCall.respondEitherStatus(
    result: Either<DomainError, *>,
    successStatus: HttpStatusCode,
    successBody: Any
) {
    when (result) {
        is Either.Right -> respond(successStatus, successBody)
        is Either.Left -> respondError(result.error)
    }
}
