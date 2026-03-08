package it.nucleo.documents.fixtures

import it.nucleo.commons.errors.*
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.errors.*
import it.nucleo.documents.domain.report.Report

/**
 * In-memory fake implementation of [DocumentRepository] for unit testing. Stores documents keyed by
 * patientId → documentId.
 */
class FakeDocumentRepository : DocumentRepository {

    private val store = mutableMapOf<String, MutableMap<String, Document>>()

    override suspend fun addDocument(
        patientId: PatientId,
        document: Document,
    ): Either<DomainError, Unit> {
        store.getOrPut(patientId.id) { mutableMapOf() }[document.id.id] = document
        return success(Unit)
    }

    override suspend fun deleteDocument(
        patientId: PatientId,
        documentId: DocumentId,
    ): Either<DomainError, Unit> {
        val patientDocs =
            store[patientId.id]
                ?: return failure(DocumentError.NotFound(patientId.id, documentId.id))
        patientDocs.remove(documentId.id)
            ?: return failure(DocumentError.NotFound(patientId.id, documentId.id))
        return success(Unit)
    }

    override suspend fun findAllDocumentsByPatient(
        patientId: PatientId,
    ): Either<DomainError, List<Document>> {
        return success(store[patientId.id]?.values?.toList() ?: emptyList())
    }

    override suspend fun findDocumentById(
        patientId: PatientId,
        documentId: DocumentId,
    ): Either<DomainError, Document> {
        val doc =
            store[patientId.id]?.get(documentId.id)
                ?: return failure(DocumentError.NotFound(patientId.id, documentId.id))
        return success(doc)
    }

    override suspend fun findAllDocumentsByDoctor(
        doctorId: DoctorId,
    ): Either<DomainError, List<Document>> {
        val docs =
            store.values.flatMap { patientDocs ->
                patientDocs.values.filter { it.doctorId == doctorId }
            }
        return success(docs)
    }

    override suspend fun updateReport(
        patientId: PatientId,
        report: Report,
    ): Either<DomainError, Unit> {
        val patientDocs =
            store[patientId.id]
                ?: return failure(DocumentError.NotFound(patientId.id, report.id.id))
        if (!patientDocs.containsKey(report.id.id)) {
            return failure(DocumentError.NotFound(patientId.id, report.id.id))
        }
        patientDocs[report.id.id] = report
        return success(Unit)
    }
}
