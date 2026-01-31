package it.nucleo

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import it.nucleo.api.plugins.configureRouting
import it.nucleo.api.plugins.configureSerialization
import it.nucleo.api.plugins.configureStatusPages
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

    logger.info("Configuring routes")
    configureRouting(documentRepository, fileStorageRepository)
    logger.info("Application initialized successfully")
}

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
