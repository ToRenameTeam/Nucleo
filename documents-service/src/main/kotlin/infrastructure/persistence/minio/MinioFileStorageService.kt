package it.nucleo.infrastructure.persistence.minio

import io.minio.BucketExistsArgs
import io.minio.GetObjectArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.StatObjectArgs
import io.minio.errors.ErrorResponseException
import it.nucleo.domain.PatientId
import it.nucleo.infrastructure.logging.logger
import java.io.InputStream
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

class FileStorageException(message: String, cause: Throwable? = null) : Exception(message, cause)

class DocumentNotFoundException(message: String) : Exception(message)

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
     * Downloads a document from MinIO storage.
     *
     * @param patientId The ID of the patient the document belongs to
     * @param documentKey The document key (filename with timestamp prefix)
     * @return DocumentDownload containing the input stream, content type, and size
     * @throws DocumentNotFoundException if the document does not exist
     * @throws FileStorageException if the download fails
     */
    fun downloadDocument(patientId: PatientId, documentKey: String): DocumentDownload {
        val objectKey = "patients/${patientId.id}/$documentKey"
        logger.debug("Downloading document with key: $objectKey")

        try {
            val stat = minioClient.statObject(
                StatObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(objectKey)
                    .build()
            )

            val inputStream = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(objectKey)
                    .build()
            )

            logger.info("Document download initiated: $objectKey")
            return DocumentDownload(
                inputStream = inputStream,
                contentType = stat.contentType() ?: "application/pdf",
                contentLength = stat.size(),
                filename = extractFilename(documentKey)
            )
        } catch (e: ErrorResponseException) {
            val errorCode = e.errorResponse().code()
            val httpStatusCode = e.response().code
            logger.debug("MinIO error - HTTP status: $httpStatusCode, error code: $errorCode")

            if (httpStatusCode == 404 || errorCode == "NoSuchKey" || errorCode == "NoSuchObject") {
                logger.warn("Document not found: $objectKey")
                throw DocumentNotFoundException("Document not found: $documentKey")
            }
            logger.error("Failed to download document: $objectKey", e)
            throw FileStorageException("Failed to download document: ${e.message}", e)
        } catch (e: Exception) {
            logger.error("Failed to download document: $objectKey", e)
            throw FileStorageException("Failed to download document: ${e.message}", e)
        }
    }

    /**
     * Extracts the original filename from the document key.
     * The key format is: {timestamp}_{filename}
     *
     * @param documentKey The document key with timestamp prefix
     * @return The original filename
     */
    private fun extractFilename(documentKey: String): String {
        val underscoreIndex = documentKey.indexOf('_')
        return if (underscoreIndex != -1 && underscoreIndex < documentKey.length - 1) {
            documentKey.substring(underscoreIndex + 1)
        } else {
            documentKey
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

/**
 * Represents a document download from MinIO storage.
 *
 * @property inputStream The input stream to read the document content
 * @property contentType The MIME type of the document
 * @property contentLength The size of the document in bytes
 * @property filename The original filename of the document
 */
data class DocumentDownload(
    val inputStream: InputStream,
    val contentType: String,
    val contentLength: Long,
    val filename: String
)

