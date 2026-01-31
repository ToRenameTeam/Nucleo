package it.nucleo.appointments.domain.valueobjects

import kotlinx.serialization.Serializable

@Serializable
@JvmInline
value class ServiceTypeId(val value: String) {
    init {
        require(value.isNotBlank()) { "ServiceTypeId cannot be blank" }
        require(value.length <= 50) { "ServiceTypeId cannot exceed 50 characters" }
    }

    companion object {
        fun fromString(value: String): ServiceTypeId = ServiceTypeId(value)
    }

    override fun toString(): String = value
}
