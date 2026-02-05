package it.nucleo.infrastructure.logging

import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * Creates a logger instance for the class that calls this function. Uses reified type parameter to
 * automatically infer the class name.
 *
 * Usage in a class:
 * ```
 * class MyService {
 *     private val logger = logger()
 * }
 * ```
 *
 * Usage in an object:
 * ```
 * object MyFactory {
 *     private val logger = logger()
 * }
 * ```
 */
inline fun <reified T> T.logger(): Logger = LoggerFactory.getLogger(T::class.java)

/**
 * Creates a logger instance with a custom name. Useful for top-level functions or when a specific
 * logger name is needed.
 *
 * Usage:
 * ```
 * private val logger = logger("it.nucleo.api.routes.DocumentRoutes")
 * ```
 */
fun logger(name: String): Logger = LoggerFactory.getLogger(name)
