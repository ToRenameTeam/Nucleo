package it.nucleo.documents.fixtures

import it.nucleo.commons.errors.*
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.errors.*
import java.io.ByteArrayInputStream
import java.io.InputStream

/**
 * In-memory fake implementation of [FileStorageRepository] for unit testing. Stores file content
 * keyed by "patientId/documentId".
 */
class FakeFileStorageRepository : FileStorageRepository {

    private class StoredEntry(
        val content: ByteArray,
        val filename: String,
        val contentType: String,
    )

    private val store = mutableMapOf<String, StoredEntry>()

    private fun key(patientId: PatientId, documentId: DocumentId) =
        "${patientId.id}/${documentId.id}"

    override fun store(
        patientId: PatientId,
        documentId: DocumentId,
        filename: String,
        inputStream: InputStream,
        contentLength: Long,
        contentType: String,
    ): Either<StorageError, Unit> {
        val bytes = inputStream.readBytes()
        store[key(patientId, documentId)] = StoredEntry(bytes, filename, contentType)
        return success(Unit)
    }

    override fun retrieve(
        patientId: PatientId,
        documentId: DocumentId,
    ): Either<StorageError, StoredFile> {
        val entry =
            store[key(patientId, documentId)]
                ?: return failure(StorageError.FileNotFound(documentId.id))
        return success(
            StoredFile(
                inputStream = ByteArrayInputStream(entry.content),
                contentType = entry.contentType,
                contentLength = entry.content.size.toLong(),
                filename = entry.filename,
            )
        )
    }

    override fun delete(
        patientId: PatientId,
        documentId: DocumentId,
    ): Either<StorageError, Unit> {
        store.remove(key(patientId, documentId))
        return success(Unit)
    }
}
