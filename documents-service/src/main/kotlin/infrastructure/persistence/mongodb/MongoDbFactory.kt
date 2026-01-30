package it.nucleo.infrastructure.persistence.mongodb

import com.mongodb.MongoClientSettings
import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.kotlin.client.coroutine.MongoDatabase
import it.nucleo.infrastructure.logging.logger
import it.nucleo.infrastructure.persistence.mongodb.dto.*
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass
import org.bson.codecs.configuration.CodecRegistries
import org.bson.codecs.configuration.CodecRegistry
import org.bson.codecs.kotlinx.BsonConfiguration
import org.bson.codecs.kotlinx.KotlinSerializerCodecProvider

object MongoDbFactory {

    private val logger = logger()

    fun createDatabase(connectionUri: String, databaseName: String): MongoDatabase {
        logger.info("Creating MongoDB client connection to database: $databaseName")
        logger.debug("MongoDB connection URI: $connectionUri")

        // Configure BSON to use "_t" as class discriminator to match MongoDB's default
        val bsonConfiguration = BsonConfiguration(classDiscriminator = "_t")

        // Create SerializersModule with polymorphic configuration for DocumentDto
        val serializersModule = SerializersModule {
            polymorphic(DocumentDto::class) {
                subclass(MedicinePrescriptionDto::class)
                subclass(ServicePrescriptionDto::class)
                subclass(ReportDto::class)
            }
            polymorphic(ValidityDto::class) {
                subclass(ValidityDto.UntilDate::class)
                subclass(ValidityDto.UntilExecution::class)
            }
        }

        // Create custom codec registry with the BSON configuration and serializers module
        val codecRegistry: CodecRegistry = CodecRegistries.fromRegistries(
            MongoClientSettings.getDefaultCodecRegistry(),
            CodecRegistries.fromProviders(
                KotlinSerializerCodecProvider(serializersModule, bsonConfiguration)
            )
        )

        // Build MongoDB client with custom codec registry
        val settings = MongoClientSettings.builder()
            .applyConnectionString(com.mongodb.ConnectionString(connectionUri))
            .codecRegistry(codecRegistry)
            .build()

        val client = MongoClient.create(settings)
        val database = client.getDatabase(databaseName)
        logger.info("MongoDB connection established successfully")
        return database
    }

    object Defaults {
        const val CONNECTION_URI = "mongodb://localhost:27017"
        const val DATABASE_NAME = "nucleo_documents"
    }
}
