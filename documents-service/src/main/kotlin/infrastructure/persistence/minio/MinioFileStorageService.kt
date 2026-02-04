package it.nucleo.infrastructure.persistence.minio

import io.minio.BucketExistsArgs
import io.minio.GetObjectArgs
import io.minio.ListObjectsArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.RemoveObjectArgs
import io.minio.StatObjectArgs
import io.minio.errors.ErrorResponseException
import it.nucleo.domain.DocumentId
import it.nucleo.domain.FileNotFoundException
import it.nucleo.domain.FileStorageException
import it.nucleo.domain.FileStorageRepository
import it.nucleo.domain.PatientId
import it.nucleo.domain.StoredFile
import it.nucleo.infrastructure.logging.logger
import java.io.InputStream

// Storage structure: patients/{patientId}/documents/{documentId}/{filename}

class MinioFileStorageRepository(
    private val minioClient: MinioClient,
    private val bucketName: String
) : FileStorageRepository {

    private val logger = logger()

    init {
        ensureBucketExists()
    }

    override fun store(
        patientId: PatientId,
        documentId: DocumentId,
        filename: String,
        inputStream: InputStream,
        contentLength: Long,
        contentType: String
    ) {
        val sanitizedFilename = sanitizeFilename(filename)
        val objectKey = generateObjectKey(patientId, documentId, sanitizedFilename)
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
            logger.info("Document stored successfully: $objectKey (documentId: ${documentId.id})")
        } catch (e: Exception) {
            logger.error("Failed to store document: $objectKey", e)
            throw FileStorageException("Failed to store document: ${e.message}", e)
        }
    }

    override fun retrieve(patientId: PatientId, documentId: DocumentId): StoredFile {
        val prefix = "patients/${patientId.id}/documents/${documentId.id}/"
        logger.debug("Retrieving document with prefix: $prefix")

        try {
            // List objects in the document folder to find the file
            val objects =
                minioClient.listObjects(
                    ListObjectsArgs.builder().bucket(bucketName).prefix(prefix).build()
                )

            val objectKey =
                objects.firstOrNull()?.get()?.objectName()
                    ?: throw FileNotFoundException("Document not found: ${documentId.id}")

            val stat =
                minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucketName).`object`(objectKey).build()
                )

            val inputStream =
                minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucketName).`object`(objectKey).build()
                )

            // Extract filename from the object key
            val filename = objectKey.substringAfterLast('/')

            logger.info("Document retrieval initiated: $objectKey")
            return StoredFile(
                inputStream = inputStream,
                contentType = stat.contentType() ?: "application/pdf",
                contentLength = stat.size(),
                filename = filename
            )
        } catch (e: FileNotFoundException) {
            throw e
        } catch (e: ErrorResponseException) {
            val errorCode = e.errorResponse().code()
            val httpStatusCode = e.response().code
            logger.debug("MinIO error - HTTP status: $httpStatusCode, error code: $errorCode")

            if (httpStatusCode == 404 || errorCode == "NoSuchKey" || errorCode == "NoSuchObject") {
                logger.warn("Document not found: ${documentId.id}")
                throw FileNotFoundException("Document not found: ${documentId.id}")
            }
            logger.error("Failed to retrieve document: ${documentId.id}", e)
            throw FileStorageException("Failed to retrieve document: ${e.message}", e)
        } catch (e: Exception) {
            logger.error("Failed to retrieve document: ${documentId.id}", e)
            throw FileStorageException("Failed to retrieve document: ${e.message}", e)
        }
    }

    override fun delete(patientId: PatientId, documentId: DocumentId) {
        val prefix = "patients/${patientId.id}/documents/${documentId.id}/"
        logger.debug("Deleting document with prefix: $prefix")

        try {
            // List all objects in the document folder
            val objects =
                minioClient.listObjects(
                    ListObjectsArgs.builder().bucket(bucketName).prefix(prefix).build()
                )

            var deletedCount = 0
            for (result in objects) {
                val objectKey = result.get().objectName()
                minioClient.removeObject(
                    RemoveObjectArgs.builder().bucket(bucketName).`object`(objectKey).build()
                )
                deletedCount++
                logger.debug("Deleted object: $objectKey")
            }

            if (deletedCount > 0) {
                logger.info(
                    "Document deleted successfully: ${documentId.id} ($deletedCount file(s) removed)"
                )
            } else {
                logger.warn("No files found to delete for document: ${documentId.id}")
            }
        } catch (e: Exception) {
            logger.error("Failed to delete document: ${documentId.id}", e)
            throw FileStorageException("Failed to delete document: ${e.message}", e)
        }
    }

    private fun generateObjectKey(
        patientId: PatientId,
        documentId: DocumentId,
        filename: String
    ): String {
        return "patients/${patientId.id}/documents/${documentId.id}/$filename"
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
