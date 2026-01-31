package it.nucleo.infrastructure.persistence.minio

import io.minio.BucketExistsArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import it.nucleo.domain.PatientId
import it.nucleo.infrastructure.logging.logger
import java.io.InputStream
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

class FileStorageException(message: String, cause: Throwable? = null) : Exception(message, cause)

class MinioFileStorageService(
    private val minioClient: MinioClient,
    private val bucketName: String
) {
    private val logger = logger()

    private val timestampFormatter = DateTimeFormatter
        .ofPattern("yyyyMMdd'T'HHmmssSSS")
        .withZone(ZoneOffset.UTC)

    init {
        ensureBucketExists()
    }

    /**
     * Uploads a PDF file to MinIO storage.
     *
     * The file is stored with a unique key that includes:
     * - Patient ID for organization
     * - Original filename
     * - Timestamp to prevent overwrites
     *
     * Key format: patients/{patientId}/{timestamp}_{originalFilename}
     *
     * @param patientId The ID of the patient the document belongs to
     * @param filename The original filename of the document
     * @param inputStream The input stream containing the file data
     * @param contentLength The size of the file in bytes
     * @param contentType The MIME type of the file (should be application/pdf)
     * @throws FileStorageException if the upload fails
     */
    fun uploadDocument(
        patientId: PatientId,
        filename: String,
        inputStream: InputStream,
        contentLength: Long,
        contentType: String
    ) {
        val objectKey = generateObjectKey(patientId, filename)
        logger.debug("Uploading document with key: $objectKey")

        try {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(objectKey)
                    .stream(inputStream, contentLength, -1)
                    .contentType(contentType)
                    .build()
            )
            logger.info("Document uploaded successfully: $objectKey")
        } catch (e: Exception) {
            logger.error("Failed to upload document: $objectKey", e)
            throw FileStorageException("Failed to upload document: ${e.message}", e)
        }
    }

    /**
     * Generates a unique object key for the document.
     * Includes timestamp to handle duplicate filenames.
     *
     * @param patientId The patient ID for directory organization
     * @param filename The original filename
     * @return A unique object key for MinIO storage
     */
    private fun generateObjectKey(patientId: PatientId, filename: String): String {
        val timestamp = timestampFormatter.format(Instant.now())
        val sanitizedFilename = sanitizeFilename(filename)
        return "patients/${patientId.id}/${timestamp}_$sanitizedFilename"
    }

    /**
     * Sanitizes the filename to ensure it's safe for storage.
     * Removes or replaces potentially problematic characters.
     *
     * @param filename The original filename
     * @return A sanitized filename safe for storage
     */
    private fun sanitizeFilename(filename: String): String {
        return filename
            .replace(Regex("[^a-zA-Z0-9._-]"), "_")
            .replace(Regex("_+"), "_")
            .take(255) // Limit filename length
    }

    /**
     * Ensures the storage bucket exists, creating it if necessary.
     */
    private fun ensureBucketExists() {
        try {
            val exists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build()
            )
            if (!exists) {
                logger.info("Bucket '$bucketName' does not exist, creating...")
                minioClient.makeBucket(
                    MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build()
                )
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
