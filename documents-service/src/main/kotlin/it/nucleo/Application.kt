package it.nucleo

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.commons.ktor.configureCors
import it.nucleo.commons.logging.logger
import it.nucleo.documents.api.routes.documentRoutes
import it.nucleo.documents.api.routes.downloadRoutes
import it.nucleo.documents.api.routes.uploadRoutes
import it.nucleo.documents.application.DocumentDownloadService
import it.nucleo.documents.application.DocumentPdfGenerator
import it.nucleo.documents.application.DocumentService
import it.nucleo.documents.application.DocumentUploadService
import it.nucleo.documents.infrastructure.ai.AiServiceClient
import it.nucleo.documents.infrastructure.persistence.minio.MinioClientFactory
import it.nucleo.documents.infrastructure.persistence.minio.MinioFileStorageRepository
import it.nucleo.documents.infrastructure.persistence.mongodb.MongoDbFactory
import it.nucleo.documents.infrastructure.persistence.mongodb.MongoDocumentRepository
import kotlinx.serialization.json.Json

private const val DEFAULT_SERVER_PORT = 8080
private val logger = logger("it.nucleo.Application")

fun main() {
    val port = Environment.serverPort
    logger.info("Starting Documents Service on port $port")
    embeddedServer(Netty, port = port, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    configureSerialization()
    configureStatusPages()
    configureCors()
    configureRouting()
    logger.info("Application initialized successfully")
}

internal fun Application.configureSerialization() {
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

internal fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<BadRequestException> { call, cause ->
            logger.warn("Bad request: ${cause.message}")
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(
                    error = "bad_request",
                    message = "Invalid request body",
                    details = cause.message
                )
            )
        }

        exception<IllegalArgumentException> { call, cause ->
            logger.warn("Invalid request: ${cause.message}")
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(
                    error = "bad_request",
                    message = "Invalid request",
                    details = cause.message
                )
            )
        }

        exception<Throwable> { call, cause ->
            logger.error("Unexpected error: ${cause.message}", cause)
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(
                    error = "internal_error",
                    message = "An unexpected error occurred",
                    details = cause.message
                )
            )
        }

        status(HttpStatusCode.NotFound) { call, status ->
            call.respond(
                status,
                ErrorResponse(error = "not_found", message = "The requested resource was not found")
            )
        }

        status(HttpStatusCode.MethodNotAllowed) { call, status ->
            call.respond(
                status,
                ErrorResponse(
                    error = "method_not_allowed",
                    message = "The HTTP method is not allowed for this resource"
                )
            )
        }
    }
}

private fun Application.configureRouting() {
    logger.info("Initializing MongoDB connection")
    val database =
        MongoDbFactory.createDatabase(
            connectionUri = Environment.mongoConnectionUri,
            databaseName = Environment.mongoDatabaseName
        )
    val documentRepository = MongoDocumentRepository(database)

    logger.info("Initializing MinIO connection")
    val minioClient =
        MinioClientFactory.createClient(
            endpoint = Environment.minioEndpoint,
            accessKey = Environment.minioAccessKey,
            secretKey = Environment.minioSecretKey
        )
    val fileStorageRepository = MinioFileStorageRepository(minioClient, Environment.minioBucketName)

    logger.info("Initializing AI Service client")
    val aiServiceClient = createAiServiceClient()

    val pdfGenerator = DocumentPdfGenerator()
    val documentService =
        DocumentService(
            repository = documentRepository,
            fileStorageRepository = fileStorageRepository,
            pdfGenerator = pdfGenerator,
            aiServiceClient = aiServiceClient
        )
    val uploadService =
        DocumentUploadService(
            fileStorageRepository = fileStorageRepository,
            documentRepository = documentRepository,
            aiServiceClient = aiServiceClient
        )
    val downloadService = DocumentDownloadService(fileStorageRepository)

    installRoutes(documentService, uploadService, downloadService)
}

private fun Application.installRoutes(
    documentService: DocumentService,
    uploadService: DocumentUploadService,
    downloadService: DocumentDownloadService
) {
    routing {
        get("/health") { call.respondText("OK") }

        route("/api") {
            documentRoutes(documentService)
            uploadRoutes(uploadService)
            downloadRoutes(downloadService)
        }
    }
}

private object Environment {
    val serverPort: Int
        get() = System.getenv("SERVER_PORT")?.toIntOrNull() ?: DEFAULT_SERVER_PORT

    val mongoConnectionUri: String
        get() = System.getenv("MONGO_CONNECTION_URI") ?: MongoDbFactory.Defaults.CONNECTION_URI

    val mongoDatabaseName: String
        get() = System.getenv("MONGO_DATABASE_NAME") ?: MongoDbFactory.Defaults.DATABASE_NAME

    val minioEndpoint: String
        get() = System.getenv("MINIO_ENDPOINT") ?: MinioClientFactory.Defaults.ENDPOINT

    val minioAccessKey: String
        get() = System.getenv("MINIO_ACCESS_KEY") ?: MinioClientFactory.Defaults.ACCESS_KEY

    val minioSecretKey: String
        get() = System.getenv("MINIO_SECRET_KEY") ?: MinioClientFactory.Defaults.SECRET_KEY

    val minioBucketName: String
        get() = System.getenv("MINIO_BUCKET_NAME") ?: MinioClientFactory.Defaults.BUCKET_NAME

    val aiServiceHost: String
        get() = System.getenv("AI_SERVICE_HOST") ?: AiServiceClient.Companion.Defaults.HOST

    val aiServicePort: Int
        get() =
            System.getenv("AI_SERVICE_PORT")?.toIntOrNull()
                ?: AiServiceClient.Companion.Defaults.PORT
}

private fun createAiServiceClient(): AiServiceClient {
    val host = Environment.aiServiceHost
    val port = Environment.aiServicePort
    logger.info("Connecting to AI Service at $host:$port")
    return AiServiceClient(host = host, port = port)
}
