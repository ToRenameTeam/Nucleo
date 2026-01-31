package it.nucleo.appointments.domain.valueobjects

import kotlinx.serialization.Serializable

@Serializable
@JvmInline
value class FacilityId(val value: String) {
    init {
        require(value.isNotBlank()) { "FacilityId cannot be blank" }
        require(value.length <= 50) { "FacilityId cannot exceed 50 characters" }
    }

    companion object {
        fun fromString(value: String): FacilityId = FacilityId(value)
    }

    override fun toString(): String = value
}
