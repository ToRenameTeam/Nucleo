package it.nucleo.documents.api.routes

import io.ktor.http.*
import io.ktor.server.plugins.ContentTransformationException
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.commons.errors.failure
import it.nucleo.commons.errors.getOrElse
import it.nucleo.commons.errors.map
import it.nucleo.documents.api.dto.*
import it.nucleo.documents.api.respondEitherJson
import it.nucleo.documents.api.respondEitherStatus
import it.nucleo.documents.application.DocumentService
import it.nucleo.documents.application.UpdateReportCommand
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.errors.DocumentError
import it.nucleo.documents.domain.report.ClinicalQuestion
import it.nucleo.documents.domain.report.Conclusion
import it.nucleo.documents.domain.report.Findings
import it.nucleo.documents.domain.report.Recommendations
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
@Suppress("CyclomaticComplexMethod")
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

            val patientIdDomain =
                PatientId(patientId).getOrElse {
                    return@get call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        ListSerializer(DocumentResponse.serializer())
                    )
                }

            val result =
                documentService.getAllDocumentsByPatient(patientIdDomain).map { documents ->
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
                } catch (e: ContentTransformationException) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse("bad_request", "Invalid request body", e.message)
                    )
                }

            val patientIdDomain =
                PatientId(patientId).getOrElse {
                    return@post call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        DocumentResponse.serializer()
                    )
                }
            val documentId =
                DocumentId(UUID.randomUUID().toString()).getOrElse {
                    return@post call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        DocumentResponse.serializer()
                    )
                }

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

            val patientIdDomain =
                PatientId(patientId).getOrElse {
                    return@get call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        DocumentResponse.serializer()
                    )
                }
            val documentIdDomain =
                DocumentId(documentId).getOrElse {
                    return@get call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        DocumentResponse.serializer()
                    )
                }

            val result =
                documentService.getDocumentById(patientIdDomain, documentIdDomain).map {
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
                } catch (e: ContentTransformationException) {
                    return@put call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse("bad_request", "Invalid request body", e.message)
                    )
                }

            val command =
                UpdateReportCommand(
                    findings =
                        request.findings?.let {
                            Findings(it).getOrElse { err ->
                                return@put call.respondEitherJson(
                                    failure(DocumentError.InvalidRequest(err.message)),
                                    DocumentResponse.serializer()
                                )
                            }
                        },
                    clinicalQuestion =
                        request.clinicalQuestion?.let {
                            ClinicalQuestion(it).getOrElse { err ->
                                return@put call.respondEitherJson(
                                    failure(DocumentError.InvalidRequest(err.message)),
                                    DocumentResponse.serializer()
                                )
                            }
                        },
                    conclusion =
                        request.conclusion?.let {
                            Conclusion(it).getOrElse { err ->
                                return@put call.respondEitherJson(
                                    failure(DocumentError.InvalidRequest(err.message)),
                                    DocumentResponse.serializer()
                                )
                            }
                        },
                    recommendations =
                        request.recommendations?.let {
                            Recommendations(it).getOrElse { err ->
                                return@put call.respondEitherJson(
                                    failure(DocumentError.InvalidRequest(err.message)),
                                    DocumentResponse.serializer()
                                )
                            }
                        },
                )

            val patientIdDomain =
                PatientId(patientId).getOrElse {
                    return@put call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        DocumentResponse.serializer()
                    )
                }
            val documentIdDomain =
                DocumentId(documentId).getOrElse {
                    return@put call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        DocumentResponse.serializer()
                    )
                }

            val result =
                documentService.updateReport(patientIdDomain, documentIdDomain, command).map {
                    it.toResponse()
                }

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

            val patientIdDomain =
                PatientId(patientId).getOrElse {
                    return@delete call.respondEitherStatus(
                        failure(DocumentError.InvalidRequest(it.message)),
                        HttpStatusCode.OK,
                        DeleteResponse("Document deleted successfully")
                    )
                }
            val documentIdDomain =
                DocumentId(documentId).getOrElse {
                    return@delete call.respondEitherStatus(
                        failure(DocumentError.InvalidRequest(it.message)),
                        HttpStatusCode.OK,
                        DeleteResponse("Document deleted successfully")
                    )
                }

            val result = documentService.deleteDocument(patientIdDomain, documentIdDomain)

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

            val doctorIdDomain =
                DoctorId(doctorId).getOrElse {
                    return@get call.respondEitherJson(
                        failure(DocumentError.InvalidRequest(it.message)),
                        ListSerializer(DocumentResponse.serializer())
                    )
                }

            val result =
                documentService.getAllDocumentsByDoctor(doctorIdDomain).map { documents ->
                    documents.map { it.toResponse() }
                }

            call.respondEitherJson(result, ListSerializer(DocumentResponse.serializer()))
        }
    }
}
