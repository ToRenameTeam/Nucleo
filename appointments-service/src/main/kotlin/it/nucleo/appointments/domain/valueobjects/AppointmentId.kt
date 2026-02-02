package it.nucleo.appointments.domain.valueobjects

import java.util.UUID

@JvmInline
value class AppointmentId(val value: String) {
    companion object {
        fun generate(): AppointmentId = AppointmentId(UUID.randomUUID().toString())

        fun fromString(value: String): AppointmentId = AppointmentId(value)
    }

    override fun toString(): String = value
}
