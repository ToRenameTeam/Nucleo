package it.nucleo.domain.prescription

import it.nucleo.domain.Document
import java.time.LocalDate

interface Prescription : Document {
    val validity: Validity
}

sealed interface Validity {
    fun isExpired(on: LocalDate = LocalDate.now()): Boolean

    data class UntilDate(val date: LocalDate) : Validity {
        override fun isExpired(on: LocalDate): Boolean = on.isAfter(date)
    }

    data object UntilExecution : Validity {
        override fun isExpired(on: LocalDate): Boolean = false
    }
}
