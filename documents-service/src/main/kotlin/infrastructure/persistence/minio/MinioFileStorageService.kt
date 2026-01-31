package it.nucleo.infrastructure.persistence.minio

import io.minio.BucketExistsArgs
import io.minio.GetObjectArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.StatObjectArgs
import io.minio.errors.ErrorResponseException
import it.nucleo.domain.FileNotFoundException
import it.nucleo.domain.FileStorageException
import it.nucleo.domain.FileStorageRepository
import it.nucleo.domain.PatientId
import it.nucleo.domain.StoredFile
import it.nucleo.infrastructure.logging.logger
import java.io.InputStream
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

class MinioFileStorageRepository(
    private val minioClient: MinioClient,
    private val bucketName: String
) : FileStorageRepository {

    private val logger = logger()

    private val timestampFormatter =
        DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmssSSS").withZone(ZoneOffset.UTC)

    init {
        ensureBucketExists()
    }

    override fun store(
        patientId: PatientId,
        filename: String,
        inputStream: InputStream,
        contentLength: Long,
        contentType: String
    ) {
        val objectKey = generateObjectKey(patientId, filename)
        logger.debug("Storing document with key: $objectKey")

        try {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(objectKey)
                    .stream(inputStream, contentLength, -1)
                    .contentType(contentType)
                    .build()
            )
            logger.info("Document stored successfully: $objectKey")
        } catch (e: Exception) {
            logger.error("Failed to store document: $objectKey", e)
            throw FileStorageException("Failed to store document: ${e.message}", e)
        }
    }

    override fun retrieve(patientId: PatientId, fileKey: String): StoredFile {
        val objectKey = "patients/${patientId.id}/$fileKey"
        logger.debug("Retrieving document with key: $objectKey")

        try {
            val stat =
                minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucketName).`object`(objectKey).build()
                )

            val inputStream =
                minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucketName).`object`(objectKey).build()
                )

            logger.info("Document retrieval initiated: $objectKey")
            return StoredFile(
                inputStream = inputStream,
                contentType = stat.contentType() ?: "application/pdf",
                contentLength = stat.size(),
                filename = extractFilename(fileKey)
            )
        } catch (e: ErrorResponseException) {
            val errorCode = e.errorResponse().code()
            val httpStatusCode = e.response().code
            logger.debug("MinIO error - HTTP status: $httpStatusCode, error code: $errorCode")

            if (httpStatusCode == 404 || errorCode == "NoSuchKey" || errorCode == "NoSuchObject") {
                logger.warn("Document not found: $objectKey")
                throw FileNotFoundException("Document not found: $fileKey")
            }
            logger.error("Failed to retrieve document: $objectKey", e)
            throw FileStorageException("Failed to retrieve document: ${e.message}", e)
        } catch (e: Exception) {
            logger.error("Failed to retrieve document: $objectKey", e)
            throw FileStorageException("Failed to retrieve document: ${e.message}", e)
        }
    }

    private fun extractFilename(documentKey: String): String {
        val underscoreIndex = documentKey.indexOf('_')
        return if (underscoreIndex != -1 && underscoreIndex < documentKey.length - 1) {
            documentKey.substring(underscoreIndex + 1)
        } else {
            documentKey
        }
    }

    private fun generateObjectKey(patientId: PatientId, filename: String): String {
        val timestamp = timestampFormatter.format(Instant.now())
        val sanitizedFilename = sanitizeFilename(filename)
        return "patients/${patientId.id}/${timestamp}_$sanitizedFilename"
    }

    private fun sanitizeFilename(filename: String): String {
        return filename.replace(Regex("[^a-zA-Z0-9._-]"), "_").replace(Regex("_+"), "_").take(255)
    }

    private fun ensureBucketExists() {
        try {
            val exists =
                minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())
            if (!exists) {
                logger.info("Bucket '$bucketName' does not exist, creating...")
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build())
                logger.info("Bucket '$bucketName' created successfully")
            } else {
                logger.debug("Bucket '$bucketName' already exists")
            }
        } catch (e: Exception) {
            logger.error("Failed to check/create bucket '$bucketName'", e)
            throw FileStorageException("Failed to initialize storage bucket: ${e.message}", e)
        }
    }
}
