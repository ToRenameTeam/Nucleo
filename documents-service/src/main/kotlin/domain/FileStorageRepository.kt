package it.nucleo.domain

import java.io.InputStream

interface FileStorageRepository {

    fun store(
        patientId: PatientId,
        documentId: DocumentId,
        filename: String,
        inputStream: InputStream,
        contentLength: Long,
        contentType: String
    )

    fun retrieve(patientId: PatientId, documentId: DocumentId): StoredFile
}

data class StoredFile(
    val inputStream: InputStream,
    val contentType: String,
    val contentLength: Long,
    val filename: String
)

class FileStorageException(message: String, cause: Throwable? = null) :
    RuntimeException(message, cause)

class FileNotFoundException(message: String) : RuntimeException(message)
