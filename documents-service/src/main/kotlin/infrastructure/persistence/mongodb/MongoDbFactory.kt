package it.nucleo.infrastructure.persistence.mongodb

import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.kotlin.client.coroutine.MongoDatabase

object MongoDbFactory {

    fun createDatabase(connectionUri: String, databaseName: String): MongoDatabase {
        val client = MongoClient.create(connectionUri)
        return client.getDatabase(databaseName)
    }

    object Defaults {
        const val CONNECTION_URI = "mongodb://localhost:27017"
        const val DATABASE_NAME = "nucleo_documents"
    }
}
