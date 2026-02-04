package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.*
import it.nucleo.application.DocumentService
import it.nucleo.domain.*
import it.nucleo.infrastructure.logging.logger

private val logger = logger("it.nucleo.api.routes.DocumentRoutes")

fun Route.documentRoutes(documentService: DocumentService) {
    route("/patients/{patientId}/documents") {
        getAllDocuments(documentService)
        getDocumentById(documentService)
        addDocument(documentService)
        deleteDocument(documentService)
        updateReport(documentService)
    }

    route("/documents") { getDocumentsByDoctor(documentService) }
}

/** GET /patients/{patientId}/documents Retrieves all documents for a specific patient. */
private fun Route.getAllDocuments(documentService: DocumentService) {
    get {
        val patientId =
            call.parameters["patientId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Patient ID is required")
                )

        logger.debug("GET /patients/$patientId/documents - Retrieving all documents")
        try {
            val documents = documentService.getAllDocumentsByPatient(PatientId(patientId))
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

/** GET /documents?doctorId={doctorId} Retrieves all documents issued by a specific doctor. */
private fun Route.getDocumentsByDoctor(documentService: DocumentService) {
    get {
        val doctorId =
            call.request.queryParameters["doctorId"]
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("bad_request", "Doctor ID is required")
                )

        logger.debug("GET /documents?doctorId=$doctorId - Retrieving all documents for doctor")
        try {
            val documents = documentService.getAllDocumentsByDoctor(DoctorId(doctorId))
            val response = documents.map { it.toResponse() }
            logger.info("GET /documents?doctorId=$doctorId - Retrieved ${response.size} documents")
            call.respond(HttpStatusCode.OK, response)
        } catch (e: RepositoryException) {
            logger.error("GET /documents?doctorId=$doctorId - Failed to retrieve documents", e)
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "Failed to retrieve documents", e.message)
            )
        }
    }
}

/** GET /patients/{patientId}/documents/{documentId} Retrieves a single document by its ID. */
private fun Route.getDocumentById(documentService: DocumentService) {
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
            val document =
                documentService.getDocumentById(PatientId(patientId), DocumentId(documentId))
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
private fun Route.addDocument(documentService: DocumentService) {
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
            val document = documentService.createDocument(PatientId(patientId), request)
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
private fun Route.deleteDocument(documentService: DocumentService) {
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
            documentService.deleteDocument(PatientId(patientId), DocumentId(documentId))
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
private fun Route.updateReport(documentService: DocumentService) {
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
            val updatedReport =
                documentService.updateReport(PatientId(patientId), DocumentId(documentId), request)

            logger.info(
                "PUT /patients/$patientId/documents/$documentId/report - Report updated successfully"
            )
            call.respond(HttpStatusCode.OK, updatedReport.toResponse())
        } catch (e: DocumentNotFoundException) {
            logger.warn(
                "PUT /patients/$patientId/documents/$documentId/report - Document not found"
            )
            call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse("not_found", "Document not found", e.message)
            )
        } catch (e: IllegalArgumentException) {
            logger.warn("PUT /patients/$patientId/documents/$documentId/report - ${e.message}", e)
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", e.message ?: "Invalid request")
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
