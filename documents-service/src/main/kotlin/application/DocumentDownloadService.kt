package it.nucleo.application

import it.nucleo.domain.DocumentId
import it.nucleo.domain.FileNotFoundException
import it.nucleo.domain.FileStorageException
import it.nucleo.domain.FileStorageRepository
import it.nucleo.domain.PatientId
import it.nucleo.domain.StoredFile
import it.nucleo.infrastructure.logging.logger

data class DownloadDocumentQuery(val patientId: PatientId, val documentId: DocumentId)

sealed class DownloadResult {
    data class Success(val file: StoredFile) : DownloadResult()

    data class NotFound(val message: String) : DownloadResult()

    data class StorageError(val message: String) : DownloadResult()
}

class DocumentDownloadService(private val fileStorageRepository: FileStorageRepository) {

    private val logger = logger()

    fun download(query: DownloadDocumentQuery): DownloadResult {
        logger.debug(
            "Processing download for patient: ${query.patientId.id}, document: ${query.documentId.id}"
        )

        return try {
            val storedFile = fileStorageRepository.retrieve(query.patientId, query.documentId)
            logger.info("Document download successful for document: ${query.documentId.id}")
            DownloadResult.Success(storedFile)
        } catch (e: FileNotFoundException) {
            logger.warn("Document PDF not found: ${query.documentId.id}")
            DownloadResult.NotFound(e.message ?: "Document not found")
        } catch (e: FileStorageException) {
            logger.error("Failed to download document: ${query.documentId.id}", e)
            DownloadResult.StorageError(e.message ?: "Unknown storage error")
        }
    }
}
