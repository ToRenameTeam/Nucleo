package it.nucleo.commons.api

import kotlinx.serialization.Serializable

/**
 * Unified error response returned by all kotlin microservices.
 *
 * [error] – machine-readable code (e.g. "NOT_FOUND", "VALIDATION_ERROR"). [message] –
 * human-readable explanation. [details] – optional extra information (stack hint, field name, …).
 */
@Serializable
data class ErrorResponse(
    val error: String,
    val message: String,
    val details: String? = null,
)
