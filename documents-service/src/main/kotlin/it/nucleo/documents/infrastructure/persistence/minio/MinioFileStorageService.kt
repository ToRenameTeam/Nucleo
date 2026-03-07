package it.nucleo.documents.infrastructure.persistence.minio

import io.minio.BucketExistsArgs
import io.minio.GetObjectArgs
import io.minio.ListObjectsArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.RemoveObjectArgs
import io.minio.StatObjectArgs
import io.minio.errors.ErrorResponseException
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.FileStorageRepository
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.StoredFile
import it.nucleo.documents.domain.errors.*
import it.nucleo.documents.infrastructure.logging.logger
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
    ): Either<StorageError, Unit> {
        val sanitizedFilename = sanitizeFilename(filename)
        val objectKey = generateObjectKey(patientId, documentId, sanitizedFilename)
        logger.debug("Storing document with key: $objectKey")

        return try {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .`object`(objectKey)
                    .stream(inputStream, contentLength, -1)
                    .contentType(contentType)
                    .build()
            )
            logger.info("Document stored successfully: $objectKey (documentId: ${documentId.id})")
            success(Unit)
        } catch (e: Exception) {
            logger.error("Failed to store document: $objectKey", e)
            failure(StorageError.OperationFailed("Failed to store document: ${e.message}", e))
        }
    }

    override fun retrieve(
        patientId: PatientId,
        documentId: DocumentId
    ): Either<StorageError, StoredFile> {
        val prefix = "patients/${patientId.id}/documents/${documentId.id}/"
        logger.debug("Retrieving document with prefix: $prefix")

        return try {
            val objects =
                minioClient.listObjects(
                    ListObjectsArgs.builder().bucket(bucketName).prefix(prefix).build()
                )

            val objectKey =
                objects.firstOrNull()?.get()?.objectName()
                    ?: return failure(StorageError.FileNotFound(documentId.id))

            val stat =
                minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucketName).`object`(objectKey).build()
                )

            val inputStream =
                minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucketName).`object`(objectKey).build()
                )

            val filename = objectKey.substringAfterLast('/')

            logger.info("Document retrieval initiated: $objectKey")
            success(
                StoredFile(
                    inputStream = inputStream,
                    contentType = stat.contentType() ?: "application/pdf",
                    contentLength = stat.size(),
                    filename = filename
                )
            )
        } catch (e: ErrorResponseException) {
            val errorCode = e.errorResponse().code()
            val httpStatusCode = e.response().code
            logger.debug("MinIO error - HTTP status: $httpStatusCode, error code: $errorCode")

            if (httpStatusCode == 404 || errorCode == "NoSuchKey" || errorCode == "NoSuchObject") {
                logger.warn("Document not found: ${documentId.id}")
                failure(StorageError.FileNotFound(documentId.id))
            } else {
                logger.error("Failed to retrieve document: ${documentId.id}", e)
                failure(
                    StorageError.OperationFailed("Failed to retrieve document: ${e.message}", e)
                )
            }
        } catch (e: Exception) {
            logger.error("Failed to retrieve document: ${documentId.id}", e)
            failure(StorageError.OperationFailed("Failed to retrieve document: ${e.message}", e))
        }
    }

    override fun delete(patientId: PatientId, documentId: DocumentId): Either<StorageError, Unit> {
        val prefix = "patients/${patientId.id}/documents/${documentId.id}/"
        logger.debug("Deleting document with prefix: $prefix")

        return try {
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
            success(Unit)
        } catch (e: Exception) {
            logger.error("Failed to delete document: ${documentId.id}", e)
            failure(StorageError.OperationFailed("Failed to delete document: ${e.message}", e))
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
            throw RuntimeException("Failed to initialize storage bucket: ${e.message}", e)
        }
    }
}
