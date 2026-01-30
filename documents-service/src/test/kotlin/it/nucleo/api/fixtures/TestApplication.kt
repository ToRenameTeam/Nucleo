package it.nucleo.api.fixtures

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import it.nucleo.api.plugins.configureRouting
import it.nucleo.api.plugins.configureSerialization
import it.nucleo.api.plugins.configureStatusPages
import it.nucleo.infrastructure.persistence.mongodb.MongoDbFactory
import it.nucleo.infrastructure.persistence.mongodb.MongoMedicalRecordRepository
import kotlinx.serialization.json.Json

object TestMongoConfig {
    const val CONNECTION_URI = "mongodb://admin:password@localhost:27017"
    const val DATABASE_NAME = "nucleo_documents_test"
}

fun configuredTestApplication(block: suspend (HttpClient) -> Unit) = testApplication {
    application {
        configureSerialization()
        configureStatusPages()

        val database =
            MongoDbFactory.createDatabase(
                connectionUri = TestMongoConfig.CONNECTION_URI,
                databaseName = TestMongoConfig.DATABASE_NAME
            )
        val repository = MongoMedicalRecordRepository(database)

        configureRouting(repository)
    }

    val client = createClient {
        install(ContentNegotiation) {
            json(
                Json {
                    prettyPrint = true
                    isLenient = true
                    ignoreUnknownKeys = true
                    encodeDefaults = true
                    classDiscriminator = "_t"
                }
            )
        }
    }

    block(client)
}
