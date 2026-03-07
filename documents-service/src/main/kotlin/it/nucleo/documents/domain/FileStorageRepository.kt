package it.nucleo.documents.domain

import it.nucleo.documents.domain.errors.*
import java.io.InputStream

interface FileStorageRepository {

    fun store(
        patientId: PatientId,
        documentId: DocumentId,
        filename: String,
        inputStream: InputStream,
        contentLength: Long,
        contentType: String
    ): Either<StorageError, Unit>

    fun retrieve(patientId: PatientId, documentId: DocumentId): Either<StorageError, StoredFile>

    fun delete(patientId: PatientId, documentId: DocumentId): Either<StorageError, Unit>
}

data class StoredFile(
    val inputStream: InputStream,
    val contentType: String,
    val contentLength: Long,
    val filename: String
)
