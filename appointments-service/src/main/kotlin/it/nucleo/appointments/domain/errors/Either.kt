package it.nucleo.appointments.domain.errors

sealed interface Either<out E : DomainError, out T> {
    data class Left<out E : DomainError>(val error: E) : Either<E, Nothing>

    data class Right<out T>(val value: T) : Either<Nothing, T>
}

fun <T> success(value: T): Either<Nothing, T> = Either.Right(value)

fun <E : DomainError> failure(error: E): Either<E, Nothing> = Either.Left(error)

inline fun <E : DomainError, T, R> Either<E, T>.map(transform: (T) -> R): Either<E, R> =
    when (this) {
        is Either.Left -> this
        is Either.Right -> Either.Right(transform(value))
    }

inline fun <E : DomainError, T, R> Either<E, T>.flatMap(
    transform: (T) -> Either<E, R>
): Either<E, R> =
    when (this) {
        is Either.Left -> this
        is Either.Right -> transform(value)
    }

inline fun <E : DomainError, T, F : DomainError> Either<E, T>.mapError(
    transform: (E) -> F
): Either<F, T> =
    when (this) {
        is Either.Left -> Either.Left(transform(error))
        is Either.Right -> this
    }

inline fun <E : DomainError, T, R> Either<E, T>.fold(onLeft: (E) -> R, onRight: (T) -> R): R =
    when (this) {
        is Either.Left -> onLeft(error)
        is Either.Right -> onRight(value)
    }

inline fun <E : DomainError, T> Either<E, T>.getOrElse(default: (E) -> T): T =
    when (this) {
        is Either.Left -> default(error)
        is Either.Right -> value
    }

inline fun <E : DomainError, T> Either<E, T>.onSuccess(action: (T) -> Unit): Either<E, T> {
    if (this is Either.Right) action(value)
    return this
}

inline fun <E : DomainError, T> Either<E, T>.onFailure(action: (E) -> Unit): Either<E, T> {
    if (this is Either.Left) action(error)
    return this
}

inline fun <T, E : DomainError> Result<T>.toEither(onError: (Throwable) -> E): Either<E, T> =
    fold(onSuccess = { success(it) }, onFailure = { failure(onError(it)) })

inline fun <T, E : DomainError> catch(onError: (Throwable) -> E, block: () -> T): Either<E, T> =
    try {
        success(block())
    } catch (e: Throwable) {
        failure(onError(e))
    }
