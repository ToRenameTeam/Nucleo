package it.nucleo.appointments.api.dto

import kotlinx.serialization.Serializable

@Serializable data class ErrorResponse(val message: String, val code: String)
