package it.nucleo

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.*
import it.nucleo.api.plugins.configureRouting
import it.nucleo.api.plugins.configureSerialization
import it.nucleo.api.plugins.configureStatusPages
import it.nucleo.infrastructure.ai.AiServiceClient
import it.nucleo.infrastructure.logging.logger
import it.nucleo.infrastructure.persistence.minio.MinioClientFactory
import it.nucleo.infrastructure.persistence.minio.MinioFileStorageRepository
import it.nucleo.infrastructure.persistence.mongodb.MongoDbFactory
import it.nucleo.infrastructure.persistence.mongodb.MongoDocumentRepository

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
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader("X-Requested-With")
        anyHost() // @TODO: Don't do this in production if possible. Try to limit it.
    }

    logger.info("Initializing MongoDB connection")
    val database =
        MongoDbFactory.createDatabase(
            connectionUri = getMongoConnectionUri(),
            databaseName = getMongoDatabaseName()
        )
    val documentRepository = MongoDocumentRepository(database)

    logger.info("Initializing MinIO connection")
    val minioClient =
        MinioClientFactory.createClient(
            endpoint = getMinioEndpoint(),
            accessKey = getMinioAccessKey(),
            secretKey = getMinioSecretKey()
        )
    val fileStorageRepository = MinioFileStorageRepository(minioClient, getMinioBucketName())

    logger.info("Initializing AI Service client")
    val aiServiceClient = createAiServiceClient()

    logger.info("Configuring routes")
    configureRouting(documentRepository, fileStorageRepository, aiServiceClient)
    logger.info("Application initialized successfully")
}

// TODO: refactor 😅

private fun getServerPort(): Int = System.getenv("SERVER_PORT")?.toIntOrNull() ?: 8080

private fun getMongoConnectionUri(): String =
    System.getenv("MONGO_CONNECTION_URI") ?: MongoDbFactory.Defaults.CONNECTION_URI

private fun getMongoDatabaseName(): String =
    System.getenv("MONGO_DATABASE_NAME") ?: MongoDbFactory.Defaults.DATABASE_NAME

private fun getMinioEndpoint(): String =
    System.getenv("MINIO_ENDPOINT") ?: MinioClientFactory.Defaults.ENDPOINT

private fun getMinioAccessKey(): String =
    System.getenv("MINIO_ACCESS_KEY") ?: MinioClientFactory.Defaults.ACCESS_KEY

private fun getMinioSecretKey(): String =
    System.getenv("MINIO_SECRET_KEY") ?: MinioClientFactory.Defaults.SECRET_KEY

private fun getMinioBucketName(): String =
    System.getenv("MINIO_BUCKET_NAME") ?: MinioClientFactory.Defaults.BUCKET_NAME

private fun getAiServiceHost(): String =
    System.getenv("AI_SERVICE_HOST") ?: AiServiceClient.Companion.Defaults.HOST

private fun getAiServicePort(): Int =
    System.getenv("AI_SERVICE_PORT")?.toIntOrNull() ?: AiServiceClient.Companion.Defaults.PORT

private fun createAiServiceClient(): AiServiceClient? {
    val host = getAiServiceHost()
    val port = getAiServicePort()

    return try {
        logger.info("Connecting to AI Service at $host:$port")
        AiServiceClient(host = host, port = port)
    } catch (e: Exception) {
        logger.warn(
            "Failed to initialize AI Service client: ${e.message}. AI analysis will be disabled."
        )
        null
    }
}
