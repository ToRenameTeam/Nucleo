package it.nucleo.application

import it.nucleo.domain.DocumentId
import it.nucleo.domain.FileStorageRepository
import it.nucleo.domain.PatientId
import it.nucleo.domain.StoredFile
import it.nucleo.domain.errors.*
import it.nucleo.infrastructure.logging.logger

data class DownloadDocumentQuery(val patientId: PatientId, val documentId: DocumentId)

class DocumentDownloadService(private val fileStorageRepository: FileStorageRepository) {

    private val logger = logger()

    fun download(query: DownloadDocumentQuery): Either<DomainError, StoredFile> {
        logger.debug(
            "Processing download for patient: ${query.patientId.id}, document: ${query.documentId.id}"
        )

        return fileStorageRepository
            .retrieve(query.patientId, query.documentId)
            .onSuccess {
                logger.info("Document download successful for document: ${query.documentId.id}")
            }
            .onFailure {
                logger.warn(
                    "Document download failed for document: ${query.documentId.id}: ${it.message}"
                )
            }
    }
}
