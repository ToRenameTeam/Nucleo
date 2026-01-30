package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.*
import it.nucleo.domain.*
import it.nucleo.domain.DocumentFactory
import it.nucleo.domain.DocumentNotFoundException
import it.nucleo.domain.DocumentRepository
import it.nucleo.domain.RepositoryException
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
import it.nucleo.infrastructure.logging.logger
import java.time.LocalDate

private val logger = logger("it.nucleo.api.routes.DocumentRoutes")

fun Route.documentRoutes(repository: DocumentRepository) {
    route("/patients/{patientId}/documents") {
        getAllDocuments(repository)
        getDocumentById(repository)
        addDocument(repository)
        deleteDocument(repository)
        updateReport(repository)
    }
}

/** GET /patients/{patientId}/documents Retrieves all documents for a specific patient. */
private fun Route.getAllDocuments(repository: DocumentRepository) {
    get {
        val patientId =
            call.parameters["patientId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        logger.debug("GET /patients/$patientId/documents - Retrieving all documents")
        try {
            val documents = repository.findAllDocumentsByPatient(PatientId(patientId))
            val response = documents.map { it.toResponse() }
            logger.info("GET /patients/$patientId/documents - Retrieved ${response.size} documents")
            call.respond(HttpStatusCode.OK, response)
        } catch (e: RepositoryException) {
            logger.error("GET /patients/$patientId/documents - Failed to retrieve documents", e)
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to retrieve documents", e.message)
            )
        }
    }
}

/** GET /patients/{patientId}/documents/{documentId} Retrieves a single document by its ID. */
private fun Route.getDocumentById(repository: DocumentRepository) {
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

        logger.debug("GET /patients/$patientId/documents/$documentId - Retrieving document")
        try {
            val document = repository.findDocumentById(PatientId(patientId), DocumentId(documentId))
            logger.info(
                "GET /patients/$patientId/documents/$documentId - Document retrieved successfully"
            )
            call.respond(HttpStatusCode.OK, document.toResponse())
        } catch (e: DocumentNotFoundException) {
            logger.warn("GET /patients/$patientId/documents/$documentId - Document not found")
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Document not found", e.message)
            )
        } catch (e: RepositoryException) {
            logger.error(
                "GET /patients/$patientId/documents/$documentId - Failed to retrieve document",
                e
            )
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to retrieve document", e.message)
            )
        }
    }
}

/** POST /patients/{patientId}/documents Adds a new document to a patient's medical record. */
private fun Route.addDocument(repository: DocumentRepository) {
    post {
        val patientId =
            call.parameters["patientId"]
                ?: return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        logger.debug("POST /patients/$patientId/documents - Adding new document")
        val request =
            try {
                call.receive<CreateDocumentRequest>()
            } catch (e: Exception) {
                logger.warn("POST /patients/$patientId/documents - Invalid request body", e)
                return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Invalid request body", e.message)
                )
            }

        try {
            val document = createDocumentFromRequest(PatientId(patientId), request, repository)
            repository.addDocument(PatientId(patientId), document)
            logger.info(
                "POST /patients/$patientId/documents - Document created successfully with id: ${document.id.id}"
            )
            call.respond(HttpStatusCode.Created, document.toResponse())
        } catch (e: DocumentNotFoundException) {
            logger.warn("POST /patients/$patientId/documents - Referenced document not found", e)
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Referenced document not found", e.message)
            )
        } catch (e: RepositoryException) {
            logger.error("POST /patients/$patientId/documents - Failed to add document", e)
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to add document", e.message)
            )
        } catch (e: IllegalArgumentException) {
            logger.warn("POST /patients/$patientId/documents - Invalid document data", e)
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", e.message ?: "Invalid document data")
            )
        }
    }
}

/**
 * DELETE /patients/{patientId}/documents/{documentId} Deletes a document from a patient's medical
 * record.
 */
private fun Route.deleteDocument(repository: DocumentRepository) {
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

        logger.debug("DELETE /patients/$patientId/documents/$documentId - Deleting document")
        try {
            repository.deleteDocument(PatientId(patientId), DocumentId(documentId))
            logger.info(
                "DELETE /patients/$patientId/documents/$documentId - Document deleted successfully"
            )
            call.respond(HttpStatusCode.OK, DeleteResponse("Document deleted successfully"))
        } catch (e: DocumentNotFoundException) {
            logger.warn("DELETE /patients/$patientId/documents/$documentId - Document not found")
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Document not found", e.message)
            )
        } catch (e: RepositoryException) {
            logger.error(
                "DELETE /patients/$patientId/documents/$documentId - Failed to delete document",
                e
            )
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
private fun Route.updateReport(repository: DocumentRepository) {
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

        logger.debug("PUT /patients/$patientId/documents/$documentId/report - Updating report")
        val request =
            try {
                call.receive<UpdateReportRequest>()
            } catch (e: Exception) {
                logger.warn(
                    "PUT /patients/$patientId/documents/$documentId/report - Invalid request body",
                    e
                )
                return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Invalid request body", e.message)
                )
            }

        try {
            val existingDocument =
                repository.findDocumentById(PatientId(patientId), DocumentId(documentId))

            if (existingDocument !is Report) {
                logger.warn(
                    "PUT /patients/$patientId/documents/$documentId/report - Document is not a report"
                )
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

            logger.info(
                "PUT /patients/$patientId/documents/$documentId/report - Report updated successfully"
            )
            call.respond(HttpStatusCode.OK, existingDocument.toResponse())
        } catch (e: DocumentNotFoundException) {
            logger.warn(
                "PUT /patients/$patientId/documents/$documentId/report - Document not found"
            )
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Document not found", e.message)
            )
        } catch (e: RepositoryException) {
            logger.error(
                "PUT /patients/$patientId/documents/$documentId/report - Failed to update report",
                e
            )
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
    repository: DocumentRepository
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
