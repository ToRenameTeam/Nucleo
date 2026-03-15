package it.nucleo.commons.logging

import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * Creates a [Logger] whose name is the fully-qualified class name of [T].
 *
 * ```kotlin
 * class MyService {
 *     private val logger = logger()
 * }
 * ```
 */
inline fun <reified T> T.logger(): Logger = LoggerFactory.getLogger(T::class.java)

/**
 * Creates a [Logger] with the given [name]. Useful for top-level functions or when a custom logger
 * name is needed.
 *
 * ```kotlin
 * private val logger = logger("it.nucleo.api.routes.DocumentRoutes")
 * ```
 */
fun logger(name: String): Logger = LoggerFactory.getLogger(name)
