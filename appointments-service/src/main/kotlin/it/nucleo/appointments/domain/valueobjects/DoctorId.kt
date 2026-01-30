package it.nucleo.appointments.domain.valueobjects

import kotlinx.serialization.Serializable

@Serializable
@JvmInline
value class DoctorId(val value: String) {
    init {
        require(value.isNotBlank()) { "DoctorId cannot be blank" }
        require(value.length <= 50) { "DoctorId cannot exceed 50 characters" }
    }

    companion object {
        fun fromString(value: String): DoctorId = DoctorId(value)
    }

    override fun toString(): String = value
}
