package it.nucleo.documents.integration.support

import com.mongodb.kotlin.client.coroutine.MongoDatabase
import io.minio.BucketExistsArgs
import io.minio.ListObjectsArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.RemoveObjectArgs
import it.nucleo.documents.infrastructure.persistence.minio.MinioClientFactory
import it.nucleo.documents.infrastructure.persistence.mongodb.MongoDbFactory
import org.bson.Document
import org.testcontainers.containers.MinIOContainer
import org.testcontainers.mongodb.MongoDBContainer
import org.testcontainers.utility.DockerImageName

private const val DATABASE_NAME = "nucleo_documents_integration"
private const val BUCKET_NAME = "documents-integration"
private const val MEDICAL_RECORDS_COLLECTION = "medical_records"

object DocumentsContainersSupport {
    private val mongoContainer = MongoDBContainer(DockerImageName.parse("mongo:7.0"))

    private val minioContainer =
        MinIOContainer(DockerImageName.parse("minio/minio:RELEASE.2025-02-18T16-25-55Z"))
            .withUserName("minioadmin")
            .withPassword("minioadmin")

    @Volatile private var started = false

    lateinit var mongoDatabase: MongoDatabase
        private set

    lateinit var minioClient: MinioClient
        private set

    fun start() {
        if (started) {
            return
        }

        mongoContainer.start()
        minioContainer.start()

        mongoDatabase =
            MongoDbFactory.createDatabase(
                connectionUri = mongoContainer.replicaSetUrl,
                databaseName = DATABASE_NAME
            )

        minioClient =
            MinioClientFactory.createClient(
                endpoint = minioContainer.s3URL,
                accessKey = minioContainer.userName,
                secretKey = minioContainer.password
            )

        ensureBucketExists()
        started = true
    }

    suspend fun resetState() {
        mongoDatabase.getCollection<Document>(MEDICAL_RECORDS_COLLECTION).deleteMany(Document())

        ensureBucketExists()
        val objects =
            minioClient.listObjects(
                ListObjectsArgs.builder().bucket(BUCKET_NAME).recursive(true).build()
            )

        for (result in objects) {
            val objectName = result.get().objectName()
            minioClient.removeObject(
                RemoveObjectArgs.builder().bucket(BUCKET_NAME).`object`(objectName).build()
            )
        }
    }

    fun stop() {
        if (!started) {
            return
        }
        minioContainer.stop()
        mongoContainer.stop()
        started = false
    }

    fun bucketName(): String = BUCKET_NAME

    private fun ensureBucketExists() {
        val exists =
            minioClient.bucketExists(BucketExistsArgs.builder().bucket(BUCKET_NAME).build())
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(BUCKET_NAME).build())
        }
    }
}
