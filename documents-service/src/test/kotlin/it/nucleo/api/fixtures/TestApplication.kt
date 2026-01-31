package it.nucleo.api.fixtures

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import it.nucleo.api.plugins.configureRouting
import it.nucleo.api.plugins.configureSerialization
import it.nucleo.api.plugins.configureStatusPages
import it.nucleo.infrastructure.persistence.minio.MinioClientFactory
import it.nucleo.infrastructure.persistence.minio.MinioFileStorageRepository
import it.nucleo.infrastructure.persistence.mongodb.MongoDbFactory
import it.nucleo.infrastructure.persistence.mongodb.MongoDocumentRepository
import kotlinx.serialization.json.Json

object TestMongoConfig {
    const val CONNECTION_URI = "mongodb://admin:password@localhost:27017"
    const val DATABASE_NAME = "nucleo_documents_test"
}

object TestMinioConfig {
    const val ENDPOINT = "http://localhost:9000"
    const val ACCESS_KEY = "minioadmin"
    const val SECRET_KEY = "minioadmin"
    const val BUCKET_NAME = "documents-test"
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
        val documentRepository = MongoDocumentRepository(database)

        val minioClient =
            MinioClientFactory.createClient(
                endpoint = TestMinioConfig.ENDPOINT,
                accessKey = TestMinioConfig.ACCESS_KEY,
                secretKey = TestMinioConfig.SECRET_KEY
            )
        val fileStorageRepository =
            MinioFileStorageRepository(minioClient, TestMinioConfig.BUCKET_NAME)

        configureRouting(documentRepository, fileStorageRepository)
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

/** Loads the test PDF file from resources. */
fun loadTestPdf(): ByteArray {
    return object {}.javaClass.getResourceAsStream("/test.pdf")?.readBytes()
        ?: throw IllegalStateException("test.pdf not found in resources")
}
