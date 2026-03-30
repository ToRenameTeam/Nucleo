package it.nucleo.documents.infrastructure.persistence.mongodb

import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.client.model.UpdateOptions
import com.mongodb.client.model.Updates
import com.mongodb.kotlin.client.coroutine.MongoDatabase
import it.nucleo.commons.errors.*
import it.nucleo.commons.logging.logger
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.errors.*
import it.nucleo.documents.domain.report.Report
import it.nucleo.documents.infrastructure.persistence.mongodb.dto.DocumentDto
import it.nucleo.documents.infrastructure.persistence.mongodb.dto.MedicalRecordDocument
import it.nucleo.documents.infrastructure.persistence.mongodb.dto.toDomain
import it.nucleo.documents.infrastructure.persistence.mongodb.dto.toDto
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.serialization.json.Json
import org.bson.BsonDocument

class MongoDocumentRepository(database: MongoDatabase) : DocumentRepository {

    private val logger = logger()
    private val collection = database.getCollection<MedicalRecordDocument>(COLLECTION_NAME)
    private val json = Json {
        classDiscriminator = "_t"
        encodeDefaults = true
    }

    override suspend fun addDocument(
        patientId: PatientId,
        document: Document
    ): Either<DomainError, Unit> {
        logger.debug("Adding document for patient: ${patientId.id}, documentId: ${document.id.id}")
        return try {
            val documentDto = document.toDto()
            val jsonString = json.encodeToString(DocumentDto.serializer(), documentDto)
            val bsonDoc = BsonDocument.parse(jsonString)

            collection.updateOne(
                Filters.eq(MedicalRecordDocument::patientId.name, patientId.id),
                Updates.push(MedicalRecordDocument::documents.name, bsonDoc),
                UpdateOptions().upsert(true)
            )
            logger.info(
                "Document added successfully for patient: ${patientId.id}, documentId: ${document.id.id}"
            )
            success(Unit)
        } catch (e: MongoException) {
            logger.error("Failed to add document for patient: ${patientId.id}", e)
            failure(
                RepositoryError.OperationFailed(
                    "Failed to add document for patient '${patientId.id}'",
                    e
                )
            )
        }
    }

    override suspend fun deleteDocument(
        patientId: PatientId,
        documentId: DocumentId
    ): Either<DomainError, Unit> {
        logger.debug("Deleting document: ${documentId.id} for patient: ${patientId.id}")

        // First check document exists
        val findResult = findDocumentById(patientId, documentId)
        if (findResult is Either.Left) return findResult

        return try {
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
                failure(DocumentError.NotFound(patientId.id, documentId.id))
            } else {
                logger.info(
                    "Document deleted successfully: ${documentId.id} for patient: ${patientId.id}"
                )
                success(Unit)
            }
        } catch (e: MongoException) {
            logger.error(
                "Failed to delete document: ${documentId.id} for patient: ${patientId.id}",
                e
            )
            failure(
                RepositoryError.OperationFailed(
                    "Failed to delete document '${documentId.id}' for patient '${patientId.id}'",
                    e
                )
            )
        }
    }

    override suspend fun findAllDocumentsByPatient(
        patientId: PatientId
    ): Either<DomainError, List<Document>> {
        logger.debug("Finding all documents for patient: ${patientId.id}")
        return try {
            val record =
                collection
                    .find(Filters.eq(MedicalRecordDocument::patientId.name, patientId.id))
                    .firstOrNull()

            val documents = record?.documents?.map { it.toDomain() } ?: emptyList()
            logger.debug("Found ${documents.size} documents for patient: ${patientId.id}")
            success(documents)
        } catch (e: MongoException) {
            logger.error("Failed to find documents for patient: ${patientId.id}", e)
            failure(
                RepositoryError.OperationFailed(
                    "Failed to find documents for patient '${patientId.id}'",
                    e
                )
            )
        }
    }

    override suspend fun findAllDocumentsByDoctor(
        doctorId: DoctorId
    ): Either<DomainError, List<Document>> {
        logger.debug("Finding all documents for doctor: ${doctorId.id}")
        return try {
            val allDocuments = mutableListOf<Document>()

            collection.find().collect { record ->
                record.documents.forEach { documentDto ->
                    if (documentDto.doctorId == doctorId.id) {
                        allDocuments.add(documentDto.toDomain())
                    }
                }
            }

            logger.debug("Found ${allDocuments.size} documents for doctor: ${doctorId.id}")
            success(allDocuments)
        } catch (e: MongoException) {
            logger.error("Failed to find documents for doctor: ${doctorId.id}", e)
            failure(
                RepositoryError.OperationFailed(
                    "Failed to find documents for doctor '${doctorId.id}'",
                    e
                )
            )
        }
    }

    override suspend fun findDocumentById(
        patientId: PatientId,
        documentId: DocumentId
    ): Either<DomainError, Document> {
        logger.debug("Finding document: ${documentId.id} for patient: ${patientId.id}")
        return try {
            val record =
                collection
                    .find(Filters.eq(MedicalRecordDocument::patientId.name, patientId.id))
                    .firstOrNull()

            val documentDto = record?.documents?.find { it.id == documentId.id }

            if (documentDto == null) {
                logger.warn("Document not found: ${documentId.id} for patient: ${patientId.id}")
                failure(DocumentError.NotFound(patientId.id, documentId.id))
            } else {
                logger.debug("Document found: ${documentId.id} for patient: ${patientId.id}")
                success(documentDto.toDomain())
            }
        } catch (e: MongoException) {
            logger.error(
                "Failed to find document: ${documentId.id} for patient: ${patientId.id}",
                e
            )
            failure(
                RepositoryError.OperationFailed(
                    "Failed to find document '${documentId.id}' for patient '${patientId.id}'",
                    e
                )
            )
        }
    }

    override suspend fun updateReport(
        patientId: PatientId,
        report: Report
    ): Either<DomainError, Unit> {
        logger.debug("Updating report: ${report.id.id} for patient: ${patientId.id}")

        val existingDocument =
            when (val findResult = findDocumentById(patientId, report.id)) {
                is Either.Left -> return findResult
                is Either.Right -> findResult.value
            }

        if (existingDocument !is Report) {
            logger.warn("Document is not a report: ${report.id.id}")
            return failure(
                DocumentError.InvalidType("Report", existingDocument::class.simpleName ?: "Unknown")
            )
        }

        return try {
            val reportDto = report.toDto()
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
                failure(DocumentError.NotFound(patientId.id, report.id.id))
            } else {
                logger.info(
                    "Report updated successfully: ${report.id.id} for patient: ${patientId.id}"
                )
                success(Unit)
            }
        } catch (e: MongoException) {
            logger.error("Failed to update report: ${report.id.id} for patient: ${patientId.id}", e)
            failure(
                RepositoryError.OperationFailed(
                    "Failed to update report '${report.id.id}' for patient '${patientId.id}'",
                    e
                )
            )
        }
    }

    suspend fun cleanupByDeletedUser(userId: String): Either<DomainError, Unit> {
        logger.debug("Cleaning up documents for deleted user: $userId")

        return try {
            collection.deleteOne(Filters.eq(MedicalRecordDocument::patientId.name, userId))

            collection.updateMany(
                Filters.exists(MedicalRecordDocument::documents.name),
                Updates.pull(MedicalRecordDocument::documents.name, Filters.eq("doctorId", userId))
            )

            logger.info("Cleanup completed for deleted user: $userId")
            success(Unit)
        } catch (e: MongoException) {
            logger.error("Failed user cleanup for $userId", e)
            failure(
                RepositoryError.OperationFailed("Failed cleanup for deleted user '$userId'", e)
            )
        }
    }

    suspend fun cleanupByDeletedMedicine(medicineId: String): Either<DomainError, Unit> {
        logger.debug("Cleaning up medicine references for deleted medicine: $medicineId")

        return try {
            collection.updateMany(
                Filters.exists(MedicalRecordDocument::documents.name),
                Updates.pull(
                    MedicalRecordDocument::documents.name,
                    Filters.and(
                        Filters.eq("_t", "medicine_prescription"),
                        Filters.eq("dosage.medicineId", medicineId)
                    )
                )
            )

            logger.info("Cleanup completed for deleted medicine: $medicineId")
            success(Unit)
        } catch (e: MongoException) {
            logger.error("Failed medicine cleanup for $medicineId", e)
            failure(
                RepositoryError.OperationFailed(
                    "Failed cleanup for deleted medicine '$medicineId'",
                    e
                )
            )
        }
    }

    suspend fun cleanupByDeletedServiceType(serviceTypeId: String): Either<DomainError, Unit> {
        logger.debug("Cleaning up service type references for deleted service type: $serviceTypeId")

        return try {
            collection.updateMany(
                Filters.exists(MedicalRecordDocument::documents.name),
                Updates.pull(
                    MedicalRecordDocument::documents.name,
                    Filters.or(
                        Filters.and(
                            Filters.eq("_t", "service_prescription"),
                            Filters.eq("serviceId", serviceTypeId)
                        ),
                        Filters.and(
                            Filters.eq("_t", "report"),
                            Filters.eq("servicePrescription.serviceId", serviceTypeId)
                        )
                    )
                )
            )

            logger.info("Cleanup completed for deleted service type: $serviceTypeId")
            success(Unit)
        } catch (e: MongoException) {
            logger.error("Failed service type cleanup for $serviceTypeId", e)
            failure(
                RepositoryError.OperationFailed(
                    "Failed cleanup for deleted service type '$serviceTypeId'",
                    e
                )
            )
        }
    }

    companion object {
        private const val COLLECTION_NAME = "medical_records"
    }
}
