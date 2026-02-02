package it.nucleo.appointments.domain.valueobjects

import java.time.Duration
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.toJavaLocalDateTime
import kotlinx.datetime.toKotlinLocalDateTime
import kotlinx.serialization.Serializable

@Serializable
data class TimeSlot(val startDateTime: LocalDateTime, val durationMinutes: Int) {
    init {
        require(durationMinutes > 0) { "Duration must be positive" }
        require(durationMinutes <= 1440) { "Duration cannot exceed 24 hours (1440 minutes)" }
    }

    val endDateTime: LocalDateTime
        get() =
            startDateTime
                .toJavaLocalDateTime()
                .plus(Duration.ofMinutes(durationMinutes.toLong()))
                .toKotlinLocalDateTime()

    fun overlaps(other: TimeSlot): Boolean {
        return startDateTime < other.endDateTime && other.startDateTime < endDateTime
    }
}
