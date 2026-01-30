package it.nucleo

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import it.nucleo.api.plugins.configureRouting
import it.nucleo.api.plugins.configureSerialization
import it.nucleo.api.plugins.configureStatusPages
import it.nucleo.infrastructure.persistence.mongodb.MongoDbFactory
import it.nucleo.infrastructure.persistence.mongodb.MongoMedicalRecordRepository

fun main() {
    embeddedServer(Netty, port = getServerPort(), host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    configureSerialization()
    configureStatusPages()

    val database =
        MongoDbFactory.createDatabase(
            connectionUri = getMongoConnectionUri(),
            databaseName = getMongoDatabaseName()
        )
    val repository = MongoMedicalRecordRepository(database)

    configureRouting(repository)
}

private fun getServerPort(): Int = System.getenv("SERVER_PORT")?.toIntOrNull() ?: 8080

private fun getMongoConnectionUri(): String =
    System.getenv("MONGO_CONNECTION_URI") ?: MongoDbFactory.Defaults.CONNECTION_URI

private fun getMongoDatabaseName(): String =
    System.getenv("MONGO_DATABASE_NAME") ?: MongoDbFactory.Defaults.DATABASE_NAME
