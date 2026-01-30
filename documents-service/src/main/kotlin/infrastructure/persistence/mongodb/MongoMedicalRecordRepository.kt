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
import it.nucleo.infrastructure.logging.logger
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.serialization.json.Json
import org.bson.BsonDocument

class MongoMedicalRecordRepository(database: MongoDatabase) : MedicalRecordRepository {

    private val logger = logger()
    private val collection = database.getCollection<MedicalRecordDocument>(COLLECTION_NAME)
    private val json = Json {
        classDiscriminator = "_t"
        encodeDefaults = true
    }

    override suspend fun addDocument(patientId: PatientId, document: Document) {
        logger.debug("Adding document for patient: ${patientId.id}, documentId: ${document.id.id}")
        try {
            val documentDto = document.toDto()

            // Serialize to JSON and then parse as BsonDocument to ensure discriminator is included
            val jsonString = json.encodeToString(DocumentDto.serializer(), documentDto)
            val bsonDoc = BsonDocument.parse(jsonString)

            collection.updateOne(
                Filters.eq(MedicalRecordDocument::patientId.name, patientId.id),
                Updates.push(MedicalRecordDocument::documents.name, bsonDoc),
                UpdateOptions().upsert(true)
            )
            logger.info("Document added successfully for patient: ${patientId.id}, documentId: ${document.id.id}")
        } catch (e: Exception) {
            logger.error("Failed to add document for patient: ${patientId.id}", e)
            throw RepositoryException("Failed to add document for patient '${patientId.id}'", e)
        }
    }

    override suspend fun deleteDocument(patientId: PatientId, documentId: DocumentId) {
        logger.debug("Deleting document: ${documentId.id} for patient: ${patientId.id}")
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
                logger.warn("Document not found for deletion: ${documentId.id}")
                throw DocumentNotFoundException(patientId, documentId)
            }
            logger.info("Document deleted successfully: ${documentId.id} for patient: ${patientId.id}")
        } catch (e: DocumentNotFoundException) {
            throw e
        } catch (e: Exception) {
            logger.error("Failed to delete document: ${documentId.id} for patient: ${patientId.id}", e)
            throw RepositoryException(
                "Failed to delete document '${documentId.id}' for patient '${patientId.id}'",
                e
            )
        }
    }

    override suspend fun findAllDocumentsByPatient(patientId: PatientId): Iterable<Document> {
        logger.debug("Finding all documents for patient: ${patientId.id}")
        try {
            val record =
                collection
                    .find(Filters.eq(MedicalRecordDocument::patientId.name, patientId.id))
                    .firstOrNull()

            val documents = record?.documents?.map { it.toDomain() } ?: emptyList()
            logger.debug("Found ${documents.size} documents for patient: ${patientId.id}")
            return documents
        } catch (e: Exception) {
            logger.error("Failed to find documents for patient: ${patientId.id}", e)
            throw RepositoryException("Failed to find documents for patient '${patientId.id}'", e)
        }
    }

    override suspend fun findDocumentById(patientId: PatientId, documentId: DocumentId): Document {
        logger.debug("Finding document: ${documentId.id} for patient: ${patientId.id}")
        try {
            val record =
                collection
                    .find(Filters.eq(MedicalRecordDocument::patientId.name, patientId.id))
                    .firstOrNull()

            val documentDto =
                record?.documents?.find { it.id == documentId.id }
                    ?: throw DocumentNotFoundException(patientId, documentId)

            logger.debug("Document found: ${documentId.id} for patient: ${patientId.id}")
            return documentDto.toDomain()
        } catch (e: DocumentNotFoundException) {
            logger.warn("Document not found: ${documentId.id} for patient: ${patientId.id}")
            throw e
        } catch (e: Exception) {
            logger.error("Failed to find document: ${documentId.id} for patient: ${patientId.id}", e)
            throw RepositoryException(
                "Failed to find document '${documentId.id}' for patient '${patientId.id}'",
                e
            )
        }
    }

    override suspend fun updateReport(patientId: PatientId, report: Report) {
        logger.debug("Updating report: ${report.id.id} for patient: ${patientId.id}")
        try {
            val existingDocument = findDocumentById(patientId, report.id)
            if (existingDocument !is Report) {
                logger.warn("Document is not a report: ${report.id.id}")
                throw RepositoryException(
                    "Document '${report.id.id}' is not a report and cannot be updated"
                )
            }

            val reportDto = report.toDto()

            // Serialize to JSON and then parse as BsonDocument to ensure discriminator is included
            val jsonString = json.encodeToString(DocumentDto.serializer(), reportDto)
            val bsonDoc = BsonDocument.parse(jsonString)

            val result =
                collection.updateOne(
                    Filters.and(
                        Filters.eq(MedicalRecordDocument::patientId.name, patientId.id),
                        Filters.elemMatch(
                            MedicalRecordDocument::documents.name,
                            Filters.eq(DocumentDto::id.name, report.id.id)
                        )
                    ),
                    Updates.set("${MedicalRecordDocument::documents.name}.$", bsonDoc)
                )

            if (result.modifiedCount == 0L) {
                logger.warn("Report not found for update: ${report.id.id}")
                throw DocumentNotFoundException(patientId, report.id)
            }
            logger.info("Report updated successfully: ${report.id.id} for patient: ${patientId.id}")
        } catch (e: DocumentNotFoundException) {
            throw e
        } catch (e: RepositoryException) {
            throw e
        } catch (e: Exception) {
            logger.error("Failed to update report: ${report.id.id} for patient: ${patientId.id}", e)
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
