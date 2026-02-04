package it.nucleo.infrastructure.persistence.minio

import io.minio.MinioClient
import it.nucleo.infrastructure.logging.logger

object MinioClientFactory {

    private val logger = logger()

    /**
     * Creates a MinIO client with the specified configuration.
     *
     * @param endpoint The MinIO server endpoint URL
     * @param accessKey The access key for authentication
     * @param secretKey The secret key for authentication
     * @return A configured MinioClient instance
     */
    fun createClient(endpoint: String, accessKey: String, secretKey: String): MinioClient {
        logger.info("Creating MinIO client connection to endpoint: $endpoint")

        val client =
            MinioClient.builder().endpoint(endpoint).credentials(accessKey, secretKey).build()

        logger.info("MinIO client created successfully")
        return client
    }

    object Defaults {
        const val ENDPOINT = "http://localhost:9000"
        const val ACCESS_KEY = "minioadmin"
        const val SECRET_KEY = "minioadmin"
        const val BUCKET_NAME = "documents"
    }
}
