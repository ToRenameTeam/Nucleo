package it.nucleo.appointments.domain.valueobjects

import java.util.UUID
import kotlinx.serialization.Serializable

@Serializable
@JvmInline
value class AvailabilityId(val value: String) {
    init {
        require(value.isNotBlank()) { "AvailabilityId cannot be blank" }
        require(isValidUUID(value)) { "AvailabilityId must be a valid UUID" }
    }

    companion object {
        fun generate(): AvailabilityId = AvailabilityId(UUID.randomUUID().toString())

        fun fromString(value: String): AvailabilityId = AvailabilityId(value)

        private fun isValidUUID(value: String): Boolean {
            return try {
                UUID.fromString(value)
                true
            } catch (e: IllegalArgumentException) {
                false
            }
        }
    }

    override fun toString(): String = value
}
