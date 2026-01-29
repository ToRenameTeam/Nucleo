package it.nucleo.appointments.domain.valueobjects

@JvmInline
value class PatientId(val value: String) {
    companion object {
        fun fromString(value: String): PatientId = PatientId(value)
    }

    override fun toString(): String = value
}
