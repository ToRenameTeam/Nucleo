package it.nucleo.domain.repository

import it.nucleo.domain.Document
import it.nucleo.domain.DocumentId
import it.nucleo.domain.PatientId
import it.nucleo.domain.report.Report

interface MedicalRecordRepository {

    suspend fun addDocument(patientId: PatientId, document: Document)

    suspend fun deleteDocument(patientId: PatientId, documentId: DocumentId)

    suspend fun findAllDocumentsByPatient(patientId: PatientId): Iterable<Document>

    suspend fun findDocumentById(patientId: PatientId, documentId: DocumentId): Document

    suspend fun updateReport(patientId: PatientId, report: Report)
}

class DocumentNotFoundException(val patientId: PatientId, val documentId: DocumentId) :
    RuntimeException("Document with ID '${documentId.id}' not found for patient '${patientId.id}'")

class RepositoryException(message: String, cause: Throwable? = null) :
    RuntimeException(message, cause)
