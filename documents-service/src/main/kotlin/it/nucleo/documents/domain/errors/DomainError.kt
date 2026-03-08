package it.nucleo.documents.domain.errors

import io.ktor.http.*
import it.nucleo.commons.errors.DomainError

sealed interface DocumentError : DomainError {

    data class NotFound(val patientId: String, val documentId: String) : DocumentError {
        override val message = "Document with ID '$documentId' not found for patient '$patientId'"
        override val errorCode = "not_found"
    }

    data class InvalidType(val expected: String, val actual: String) : DocumentError {
        override val message = "Expected document type '$expected', but got '$actual'"
        override val errorCode = "bad_request"
    }

    data class InvalidRequest(val reason: String) : DocumentError {
        override val message = reason
        override val errorCode = "bad_request"
    }
}

sealed interface StorageError : DomainError {

    data class FileNotFound(val documentId: String) : StorageError {
        override val message = "Document not found: $documentId"
        override val errorCode = "not_found"
    }

    data class OperationFailed(val reason: String, val cause: Throwable? = null) : StorageError {
        override val message = reason
        override val errorCode = "internal_error"
    }
}

sealed interface RepositoryError : DomainError {

    data class OperationFailed(val reason: String, val cause: Throwable? = null) : RepositoryError {
        override val message = reason
        override val errorCode = "internal_error"
    }
}

fun DomainError.toHttpStatusCode(): HttpStatusCode =
    when (this) {
        is DocumentError.NotFound -> HttpStatusCode.NotFound
        is DocumentError.InvalidType -> HttpStatusCode.BadRequest
        is DocumentError.InvalidRequest -> HttpStatusCode.BadRequest
        is StorageError.FileNotFound -> HttpStatusCode.NotFound
        is StorageError.OperationFailed -> HttpStatusCode.InternalServerError
        is RepositoryError.OperationFailed -> HttpStatusCode.InternalServerError
        is it.nucleo.commons.errors.ValidationError -> HttpStatusCode.BadRequest
        is it.nucleo.commons.errors.InternalError -> HttpStatusCode.InternalServerError
        else -> HttpStatusCode.InternalServerError
    }
