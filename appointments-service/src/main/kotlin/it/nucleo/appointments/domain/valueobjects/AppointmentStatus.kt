package it.nucleo.appointments.domain.valueobjects

enum class AppointmentStatus {
    SCHEDULED,
    COMPLETED,
    NO_SHOW,
    CANCELLED;

    fun canTransitionTo(newStatus: AppointmentStatus): Boolean {
        return when (this) {
            SCHEDULED -> newStatus in setOf(COMPLETED, NO_SHOW, CANCELLED)
            COMPLETED,
            NO_SHOW,
            CANCELLED -> false // Stati terminali
        }
    }
}
