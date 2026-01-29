package it.nucleo.domain

interface MedicalRecord {

    val id: MedicalRecordId

    val patientId: PatientId

    val documents: List<Document>

    fun addDocument(document: Document)

    fun deleteDocument(document: Document)

    fun getDocumentById(id: DocumentId): Document
}

@JvmInline
value class MedicalRecordId(val id: String)