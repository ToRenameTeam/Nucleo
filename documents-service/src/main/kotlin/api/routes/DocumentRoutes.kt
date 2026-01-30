package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.*
import it.nucleo.domain.*
import it.nucleo.domain.factory.DocumentFactory
import it.nucleo.domain.prescription.implementation.FacilityId
import it.nucleo.domain.prescription.implementation.Priority
import it.nucleo.domain.prescription.implementation.ServiceId
import it.nucleo.domain.prescription.implementation.ServicePrescription
import it.nucleo.domain.report.ClinicalQuestion
import it.nucleo.domain.report.Conclusion
import it.nucleo.domain.report.ExecutionDate
import it.nucleo.domain.report.Findings
import it.nucleo.domain.report.Recommendations
import it.nucleo.domain.report.Report
import it.nucleo.domain.repository.DocumentNotFoundException
import it.nucleo.domain.repository.MedicalRecordRepository
import it.nucleo.domain.repository.RepositoryException
import java.time.LocalDate

fun Route.documentRoutes(repository: MedicalRecordRepository) {
    route("/patients/{patientId}/documents") {
        getAllDocuments(repository)
        getDocumentById(repository)
        addDocument(repository)
        deleteDocument(repository)
        updateReport(repository)
    }
}

/** GET /patients/{patientId}/documents Retrieves all documents for a specific patient. */
private fun Route.getAllDocuments(repository: MedicalRecordRepository) {
    get {
        val patientId =
            call.parameters["patientId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        try {
            val documents = repository.findAllDocumentsByPatient(PatientId(patientId))
            val response = documents.map { it.toResponse() }
            call.respond(HttpStatusCode.OK, response)
        } catch (e: RepositoryException) {
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to retrieve documents", e.message)
            )
        }
    }
}

/** GET /patients/{patientId}/documents/{documentId} Retrieves a single document by its ID. */
private fun Route.getDocumentById(repository: MedicalRecordRepository) {
    get("/{documentId}") {
        val patientId =
            call.parameters["patientId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        val documentId =
            call.parameters["documentId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Document ID is required")
                )

        try {
            val document = repository.findDocumentById(PatientId(patientId), DocumentId(documentId))
            call.respond(HttpStatusCode.OK, document.toResponse())
        } catch (e: DocumentNotFoundException) {
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Document not found", e.message)
            )
        } catch (e: RepositoryException) {
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to retrieve document", e.message)
            )
        }
    }
}

/** POST /patients/{patientId}/documents Adds a new document to a patient's medical record. */
private fun Route.addDocument(repository: MedicalRecordRepository) {
    post {
        val patientId =
            call.parameters["patientId"]
                ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        val request =
            try {
                call.receive<CreateDocumentRequest>()
            } catch (e: Exception) {
                return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Invalid request body", e.message)
                )
            }

        try {
            val document = createDocumentFromRequest(PatientId(patientId), request, repository)
            repository.addDocument(PatientId(patientId), document)
            call.respond(HttpStatusCode.Created, document.toResponse())
        } catch (e: DocumentNotFoundException) {
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Referenced document not found", e.message)
            )
        } catch (e: RepositoryException) {
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to add document", e.message)
            )
        } catch (e: IllegalArgumentException) {
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", "Invalid document data", e.message)
            )
        }
    }
}

/**
 * DELETE /patients/{patientId}/documents/{documentId} Deletes a document from a patient's medical
 * record.
 */
private fun Route.deleteDocument(repository: MedicalRecordRepository) {
    delete("/{documentId}") {
        val patientId =
            call.parameters["patientId"]
                ?: return@delete call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        val documentId =
            call.parameters["documentId"]
                ?: return@delete call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Document ID is required")
                )

        try {
            repository.deleteDocument(PatientId(patientId), DocumentId(documentId))
            call.respond(HttpStatusCode.OK, DeleteResponse("Document deleted successfully"))
        } catch (e: DocumentNotFoundException) {
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Document not found", e.message)
            )
        } catch (e: RepositoryException) {
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to delete document", e.message)
            )
        }
    }
}

/**
 * PUT /patients/{patientId}/documents/{documentId}/report Updates an existing report. Only reports
 * can be updated.
 */
private fun Route.updateReport(repository: MedicalRecordRepository) {
    put("/{documentId}/report") {
        val patientId =
            call.parameters["patientId"]
                ?: return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        val documentId =
            call.parameters["documentId"]
                ?: return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Document ID is required")
                )

        val request =
            try {
                call.receive<UpdateReportRequest>()
            } catch (e: Exception) {
                return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Invalid request body", e.message)
                )
            }

        try {
            val existingDocument =
                repository.findDocumentById(PatientId(patientId), DocumentId(documentId))

            if (existingDocument !is Report) {
                return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Only reports can be updated")
                )
            }

            request.findings?.let { existingDocument.updateFindings(Findings(it)) }
            request.clinicalQuestion?.let {
                existingDocument.setClinicalQuestion(ClinicalQuestion(it))
            }
            request.conclusion?.let { existingDocument.setConclusion(Conclusion(it)) }
            request.recommendations?.let {
                existingDocument.setRecommendations(Recommendations(it))
            }

            repository.updateReport(PatientId(patientId), existingDocument)

            call.respond(HttpStatusCode.OK, existingDocument.toResponse())
        } catch (e: DocumentNotFoundException) {
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Document not found", e.message)
            )
        } catch (e: RepositoryException) {
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to update report", e.message)
            )
        }
    }
}

/** Helper function to create a domain document from a request DTO. */
private suspend fun createDocumentFromRequest(
    patientId: PatientId,
    request: CreateDocumentRequest,
    repository: MedicalRecordRepository
): Document {
    val doctorId = DoctorId(request.doctorId)
    val metadata = request.metadata.toDomain()

    return when (request) {
        is CreateMedicinePrescriptionRequest -> {
            DocumentFactory.createMedicinePrescription(
                doctorId = doctorId,
                patientId = patientId,
                metadata = metadata,
                validity = request.validity.toDomain(),
                dosage = request.dosage.toDomain()
            )
        }
        is CreateServicePrescriptionRequest -> {
            DocumentFactory.createServicePrescription(
                doctorId = doctorId,
                patientId = patientId,
                metadata = metadata,
                validity = request.validity.toDomain(),
                serviceId = ServiceId(request.serviceId),
                facilityId = FacilityId(request.facilityId),
                priority = Priority.valueOf(request.priority)
            )
        }
        is CreateReportRequest -> {
            val servicePrescriptionDoc =
                repository.findDocumentById(patientId, DocumentId(request.servicePrescriptionId))

            if (servicePrescriptionDoc !is ServicePrescription) {
                throw IllegalArgumentException(
                    "Document '${request.servicePrescriptionId}' is not a service prescription"
                )
            }

            DocumentFactory.createReport(
                doctorId = doctorId,
                patientId = patientId,
                metadata = metadata,
                servicePrescription = servicePrescriptionDoc,
                executionDate = ExecutionDate(LocalDate.parse(request.executionDate)),
                findings = Findings(request.findings),
                clinicalQuestion = request.clinicalQuestion?.let { ClinicalQuestion(it) },
                conclusion = request.conclusion?.let { Conclusion(it) },
                recommendations = request.recommendations?.let { Recommendations(it) }
            )
        }
    }
}
