package it.nucleo.domain.implementation

import it.nucleo.domain.Document
import it.nucleo.domain.DocumentId
import it.nucleo.domain.MedicalRecord
import it.nucleo.domain.MedicalRecordId
import it.nucleo.domain.PatientId

private class MedicalRecordImpl(
    override val id: MedicalRecordId,
    override val patientId: PatientId
) : MedicalRecord {

    private val _documents = mutableListOf<Document>()

    override val documents: List<Document>
        get() = _documents.toList()

    override fun addDocument(document: Document) {
        _documents.add(document)
    }

    override fun deleteDocument(document: Document) {
        _documents.remove(document)
    }

    override fun getDocumentById(id: DocumentId): Document {
        return _documents.first { it.id == id }
    }
}
