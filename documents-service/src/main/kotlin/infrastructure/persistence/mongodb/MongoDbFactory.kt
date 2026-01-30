package it.nucleo.infrastructure.persistence.mongodb

import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.kotlin.client.coroutine.MongoDatabase
import it.nucleo.infrastructure.logging.logger

object MongoDbFactory {

    private val logger = logger()

    fun createDatabase(connectionUri: String, databaseName: String): MongoDatabase {
        logger.info("Creating MongoDB client connection to database: $databaseName")
        logger.debug("MongoDB connection URI: $connectionUri")
        val client = MongoClient.create(connectionUri)
        val database = client.getDatabase(databaseName)
        logger.info("MongoDB connection established successfully")
        return database
    }

    object Defaults {
        const val CONNECTION_URI = "mongodb://localhost:27017"
        const val DATABASE_NAME = "nucleo_documents"
    }
}
