package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.*
import it.nucleo.api.respondEitherJson
import it.nucleo.api.respondEitherStatus
import it.nucleo.application.DocumentService
import it.nucleo.domain.*
import it.nucleo.domain.errors.map
import it.nucleo.infrastructure.logging.logger
import kotlinx.serialization.builtins.ListSerializer

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

        val result =
            documentService.getAllDocumentsByPatient(PatientId(patientId)).map { documents ->
                documents.map { it.toResponse() }
            }

        call.respondEitherJson(result, ListSerializer(DocumentResponse.serializer()))
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

        val result =
            documentService.getAllDocumentsByDoctor(DoctorId(doctorId)).map { documents ->
                documents.map { it.toResponse() }
            }

        call.respondEitherJson(result, ListSerializer(DocumentResponse.serializer()))
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

        val result =
            documentService.getDocumentById(PatientId(patientId), DocumentId(documentId)).map {
                it.toResponse()
            }

        call.respondEitherJson(result, DocumentResponse.serializer())
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

        val result =
            documentService.createDocument(PatientId(patientId), request).map { it.toResponse() }

        call.respondEitherJson(result, DocumentResponse.serializer(), HttpStatusCode.Created)
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

        val result = documentService.deleteDocument(PatientId(patientId), DocumentId(documentId))

        call.respondEitherStatus(
            result,
            HttpStatusCode.OK,
            DeleteResponse("Document deleted successfully")
        )
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

        val result =
            documentService
                .updateReport(PatientId(patientId), DocumentId(documentId), request)
                .map { it.toResponse() }

        call.respondEitherJson(result, DocumentResponse.serializer())
    }
}
