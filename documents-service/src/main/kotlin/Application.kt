package it.nucleo

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import it.nucleo.api.plugins.configureRouting
import it.nucleo.api.plugins.configureSerialization
import it.nucleo.api.plugins.configureStatusPages
import it.nucleo.infrastructure.logging.logger
import it.nucleo.infrastructure.persistence.mongodb.MongoDbFactory
import it.nucleo.infrastructure.persistence.mongodb.MongoMedicalRecordRepository

private val logger = logger("it.nucleo.Application")

fun main() {
    val port = getServerPort()
    logger.info("Starting Documents Service on port $port")
    embeddedServer(Netty, port = port, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    logger.info("Configuring application plugins")
    configureSerialization()
    configureStatusPages()

    logger.info("Initializing MongoDB connection")
    val database =
        MongoDbFactory.createDatabase(
            connectionUri = getMongoConnectionUri(),
            databaseName = getMongoDatabaseName()
        )
    val repository = MongoMedicalRecordRepository(database)

    logger.info("Configuring routes")
    configureRouting(repository)
    logger.info("Application initialized successfully")
}

private fun getServerPort(): Int = System.getenv("SERVER_PORT")?.toIntOrNull() ?: 8080

private fun getMongoConnectionUri(): String =
    System.getenv("MONGO_CONNECTION_URI") ?: MongoDbFactory.Defaults.CONNECTION_URI

private fun getMongoDatabaseName(): String =
    System.getenv("MONGO_DATABASE_NAME") ?: MongoDbFactory.Defaults.DATABASE_NAME
