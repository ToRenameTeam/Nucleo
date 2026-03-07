package it.nucleo.api.routes

import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.api.dto.*
import it.nucleo.api.respondEitherJson
import it.nucleo.api.respondEitherStatus
import it.nucleo.application.DocumentService
import it.nucleo.application.UpdateReportCommand
import it.nucleo.domain.*
import it.nucleo.domain.errors.failure
import it.nucleo.domain.errors.getOrElse
import it.nucleo.domain.errors.map
import it.nucleo.domain.report.ClinicalQuestion
import it.nucleo.domain.report.Conclusion
import it.nucleo.domain.report.Findings
import it.nucleo.domain.report.Recommendations
import java.util.UUID
import kotlinx.serialization.builtins.ListSerializer

/**
 * Registers all document-related routes.
 *
 * Patient-scoped endpoints (`/patients/{patientId}/documents`):
 * - `GET /patients/{patientId}/documents` – list all documents for a patient
 * - `POST /patients/{patientId}/documents` – create a new document
 * - `GET /patients/{patientId}/documents/{documentId}` – retrieve a document by ID
 * - `PUT /patients/{patientId}/documents/{documentId}/report`– update a report's content
 * - `DELETE /patients/{patientId}/documents/{documentId}` – delete a document
 *
 * Global endpoints (`/documents`):
 * - `GET /documents?doctorId={doctorId}` – list all documents by doctor
 */
fun Route.documentRoutes(documentService: DocumentService) {

    route("/patients/{patientId}/documents") {

        // GET /patients/{patientId}/documents
        // Returns all documents belonging to the specified patient.
        get {
            val patientId =
                call.parameters["patientId"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse("bad_request", "Patient ID is required")
                    )

            val result =
                documentService.getAllDocumentsByPatient(PatientId(patientId)).map { documents ->
                    documents.map { it.toResponse() }
                }

            call.respondEitherJson(result, ListSerializer(DocumentResponse.serializer()))
        }

        // POST /patients/{patientId}/documents
        // Creates a new document and associates it with the given patient.
        // The route is responsible for building the domain Document from the request.
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

            val patientIdDomain = PatientId(patientId)
            val documentId = DocumentId(UUID.randomUUID().toString())

            val document =
                request
                    .toDomain(
                        patientId = patientIdDomain,
                        documentId = documentId,
                        resolveServicePrescription = { prescriptionId ->
                            documentService.getServicePrescription(patientIdDomain, prescriptionId)
                        }
                    )
                    .getOrElse { error ->
                        return@post call.respondEitherJson(
                            failure(error),
                            DocumentResponse.serializer()
                        )
                    }

            val result = documentService.createDocument(document).map { it.toResponse() }

            call.respondEitherJson(result, DocumentResponse.serializer(), HttpStatusCode.Created)
        }

        // GET /patients/{patientId}/documents/{documentId}
        // Retrieves a single document by its ID, scoped to the given patient.
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

            val result =
                documentService.getDocumentById(PatientId(patientId), DocumentId(documentId)).map {
                    it.toResponse()
                }

            call.respondEitherJson(result, DocumentResponse.serializer())
        }

        // PUT /patients/{patientId}/documents/{documentId}/report
        // Updates the content of a report document. Only report-type documents can be updated.
        // The route maps UpdateReportRequest fields to domain value objects before calling the
        // service.
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

            val command =
                UpdateReportCommand(
                    findings = request.findings?.let { Findings(it) },
                    clinicalQuestion = request.clinicalQuestion?.let { ClinicalQuestion(it) },
                    conclusion = request.conclusion?.let { Conclusion(it) },
                    recommendations = request.recommendations?.let { Recommendations(it) },
                )

            val result =
                documentService
                    .updateReport(PatientId(patientId), DocumentId(documentId), command)
                    .map { it.toResponse() }

            call.respondEitherJson(result, DocumentResponse.serializer())
        }

        // DELETE /patients/{patientId}/documents/{documentId}
        // Permanently removes a document from the patient's medical record.
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

            val result =
                documentService.deleteDocument(PatientId(patientId), DocumentId(documentId))

            call.respondEitherStatus(
                result,
                HttpStatusCode.OK,
                DeleteResponse("Document deleted successfully")
            )
        }
    }

    route("/documents") {

        // GET /documents?doctorId={doctorId}
        // Returns all documents issued by the specified doctor across all patients.
        get {
            val doctorId =
                call.request.queryParameters["doctorId"]
                    ?: return@get call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse("bad_request", "Doctor ID is required")
                    )

            val result =
                documentService.getAllDocumentsByDoctor(DoctorId(doctorId)).map { documents ->
                    documents.map { it.toResponse() }
                }

            call.respondEitherJson(result, ListSerializer(DocumentResponse.serializer()))
        }
    }
}
