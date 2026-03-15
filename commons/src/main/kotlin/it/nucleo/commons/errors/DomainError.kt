package it.nucleo.commons.errors

interface DomainError {
    val message: String
    val errorCode: String
}

data class ValidationError(override val message: String) : DomainError {
    override val errorCode = "VALIDATION_ERROR"
}

data class InternalError(
    override val message: String,
    val cause: Throwable? = null,
) : DomainError {
    override val errorCode = "INTERNAL_ERROR"
}
