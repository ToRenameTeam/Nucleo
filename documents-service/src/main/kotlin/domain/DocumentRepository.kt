package it.nucleo.domain

import it.nucleo.domain.errors.*
import it.nucleo.domain.report.Report

interface DocumentRepository {

    suspend fun addDocument(patientId: PatientId, document: Document): Either<DomainError, Unit>

    suspend fun deleteDocument(
        patientId: PatientId,
        documentId: DocumentId
    ): Either<DomainError, Unit>

    suspend fun findAllDocumentsByPatient(patientId: PatientId): Either<DomainError, List<Document>>

    suspend fun findDocumentById(
        patientId: PatientId,
        documentId: DocumentId
    ): Either<DomainError, Document>

    suspend fun findAllDocumentsByDoctor(doctorId: DoctorId): Either<DomainError, List<Document>>

    suspend fun updateReport(patientId: PatientId, report: Report): Either<DomainError, Unit>
}
