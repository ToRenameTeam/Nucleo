package it.nucleo.infrastructure.persistence.mongodb

import com.mongodb.client.model.Filters
import com.mongodb.client.model.UpdateOptions
import com.mongodb.client.model.Updates
import com.mongodb.kotlin.client.coroutine.MongoDatabase
import it.nucleo.domain.Document
import it.nucleo.domain.DocumentId
import it.nucleo.domain.PatientId
import it.nucleo.domain.report.Report
import it.nucleo.domain.repository.DocumentNotFoundException
import it.nucleo.domain.repository.MedicalRecordRepository
import it.nucleo.domain.repository.RepositoryException
import it.nucleo.infrastructure.persistence.mongodb.model.DocumentDto
import it.nucleo.infrastructure.persistence.mongodb.model.MedicalRecordDocument
import it.nucleo.infrastructure.persistence.mongodb.model.toDomain
import it.nucleo.infrastructure.persistence.mongodb.model.toDto
import kotlinx.coroutines.flow.firstOrNull

class MongoMedicalRecordRepository(database: MongoDatabase) : MedicalRecordRepository {

    private val collection = database.getCollection<MedicalRecordDocument>(COLLECTION_NAME)

    override suspend fun addDocument(patientId: PatientId, document: Document) {
        try {
            val documentDto = document.toDto()

            collection.updateOne(
                Filters.eq(MedicalRecordDocument::patientId.name, patientId.id),
                Updates.push(MedicalRecordDocument::documents.name, documentDto),
                UpdateOptions().upsert(true)
            )
        } catch (e: Exception) {
            throw RepositoryException("Failed to add document for patient '${patientId.id}'", e)
        }
    }

    override suspend fun deleteDocument(patientId: PatientId, documentId: DocumentId) {
        try {
            findDocumentById(patientId, documentId)

            val result =
                collection.updateOne(
                    Filters.eq(MedicalRecordDocument::patientId.name, patientId.id),
                    Updates.pull(
                        MedicalRecordDocument::documents.name,
                        Filters.eq(DocumentDto::id.name, documentId.id)
                    )
                )

            if (result.modifiedCount == 0L) {
                throw DocumentNotFoundException(patientId, documentId)
            }
        } catch (e: DocumentNotFoundException) {
            throw e
        } catch (e: Exception) {
            throw RepositoryException(
                "Failed to delete document '${documentId.id}' for patient '${patientId.id}'",
                e
            )
        }
    }

    override suspend fun findAllDocumentsByPatient(patientId: PatientId): Iterable<Document> {
        try {
            val record =
                collection
                    .find(Filters.eq(MedicalRecordDocument::patientId.name, patientId.id))
                    .firstOrNull()

            return record?.documents?.map { it.toDomain() } ?: emptyList()
        } catch (e: Exception) {
            throw RepositoryException("Failed to find documents for patient '${patientId.id}'", e)
        }
    }

    override suspend fun findDocumentById(patientId: PatientId, documentId: DocumentId): Document {
        try {
            val record =
                collection
                    .find(Filters.eq(MedicalRecordDocument::patientId.name, patientId.id))
                    .firstOrNull()

            val documentDto =
                record?.documents?.find { it.id == documentId.id }
                    ?: throw DocumentNotFoundException(patientId, documentId)

            return documentDto.toDomain()
        } catch (e: DocumentNotFoundException) {
            throw e
        } catch (e: Exception) {
            throw RepositoryException(
                "Failed to find document '${documentId.id}' for patient '${patientId.id}'",
                e
            )
        }
    }

    override suspend fun updateReport(patientId: PatientId, report: Report) {
        try {
            val existingDocument = findDocumentById(patientId, report.id)
            if (existingDocument !is Report) {
                throw RepositoryException(
                    "Document '${report.id.id}' is not a report and cannot be updated"
                )
            }

            val reportDto = report.toDto()

            val result =
                collection.updateOne(
                    Filters.and(
                        Filters.eq(MedicalRecordDocument::patientId.name, patientId.id),
                        Filters.elemMatch(
                            MedicalRecordDocument::documents.name,
                            Filters.eq(DocumentDto::id.name, report.id.id)
                        )
                    ),
                    Updates.set("${MedicalRecordDocument::documents.name}.$", reportDto)
                )

            if (result.modifiedCount == 0L) {
                throw DocumentNotFoundException(patientId, report.id)
            }
        } catch (e: DocumentNotFoundException) {
            throw e
        } catch (e: RepositoryException) {
            throw e
        } catch (e: Exception) {
            throw RepositoryException(
                "Failed to update report '${report.id.id}' for patient '${patientId.id}'",
                e
            )
        }
    }

    companion object {
        private const val COLLECTION_NAME = "medical_records"
    }
}
