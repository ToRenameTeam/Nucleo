package it.nucleo.documents.api.routes

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.documents.api.dto.*
import it.nucleo.documents.application.DocumentPdfGenerator
import it.nucleo.documents.application.DocumentService
import it.nucleo.documents.domain.DocumentRepository
import it.nucleo.documents.domain.FileStorageRepository
import it.nucleo.documents.fixtures.DocumentFixtures
import it.nucleo.documents.fixtures.FakeDocumentRepository
import it.nucleo.documents.fixtures.FakeFileStorageRepository
import kotlinx.serialization.json.Json

class DocumentRoutesTest :
    DescribeSpec({
        fun configuredTestApp(
            docRepo: DocumentRepository = FakeDocumentRepository(),
            fileRepo: FileStorageRepository = FakeFileStorageRepository(),
            block: suspend (io.ktor.client.HttpClient) -> Unit,
        ) = testApplication {
            application { testModule(docRepo, fileRepo) }
            val client = createClient { install(ContentNegotiation) { json(testJson) } }
            block(client)
        }

        describe("GET /health") {
            it("should return OK") {
                configuredTestApp { client ->
                    val response = client.get("/health")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldBe "OK"
                }
            }
        }

        describe("GET /api/documents/patients/{patientId}") {
            it("should return an empty list for a patient with no documents") {
                configuredTestApp { client ->
                    val response = client.get("/api/documents/patients/unknown")

                    response.status shouldBe HttpStatusCode.OK
                    response.body<List<DocumentResponse>>().shouldBeEmpty()
                }
            }

            it("should return all documents belonging to the patient") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    // Given: two documents exist
                    client.createMedicinePrescription("patient-1")
                    client.createServicePrescription("patient-1")

                    // When
                    val response = client.get("/api/documents/patients/patient-1")

                    // Then
                    response.status shouldBe HttpStatusCode.OK
                    response.body<List<DocumentResponse>>() shouldHaveSize 2
                }
            }

            it("should not return documents from a different patient") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    client.createMedicinePrescription("patient-a")
                    client.createServicePrescription("patient-b")

                    val response = client.get("/api/documents/patients/patient-a")

                    response.status shouldBe HttpStatusCode.OK
                    val docs = response.body<List<DocumentResponse>>()
                    docs shouldHaveSize 1
                    docs.first().patientId shouldBe "patient-a"
                }
            }
        }

        describe("GET /api/documents/patients/{patientId}/{documentId}") {
            it("should return 404 for a non-existent document") {
                configuredTestApp { client ->
                    val response = client.get("/api/documents/patients/p1/non-existent")

                    response.status shouldBe HttpStatusCode.NotFound
                    response.body<ErrorResponse>().error shouldBe "not_found"
                }
            }

            it("should return the document by id") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    val created = client.createMedicinePrescription("patient-1")

                    val response = client.get("/api/documents/patients/patient-1/${created.id}")

                    response.status shouldBe HttpStatusCode.OK
                    val doc = response.body<MedicinePrescriptionResponse>()
                    doc.id shouldBe created.id
                    doc.doctorId shouldBe created.doctorId
                }
            }

            it("should return 404 when the document belongs to a different patient") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    val created = client.createMedicinePrescription("patient-a")

                    val response = client.get("/api/documents/patients/patient-b/${created.id}")

                    response.status shouldBe HttpStatusCode.NotFound
                }
            }
        }

        describe("POST /api/documents/patients/{patientId}") {
            describe("medicine prescription") {
                it("should create a medicine prescription with valid data") {
                    val docRepo = FakeDocumentRepository()
                    val fileRepo = FakeFileStorageRepository()
                    configuredTestApp(docRepo, fileRepo) { client ->
                        val created = client.createMedicinePrescription("patient-1")

                        created.id shouldNotBe null
                        created.patientId shouldBe "patient-1"
                        created.dosage.medicineId shouldBe "medicine-amoxicillin"
                    }
                }

                it("should create a medicine prescription with until_execution validity") {
                    val docRepo = FakeDocumentRepository()
                    val fileRepo = FakeFileStorageRepository()
                    configuredTestApp(docRepo, fileRepo) { client ->
                        val request =
                            DocumentFixtures.medicinePrescriptionRequest(
                                validity = ValidityRequest.UntilExecution,
                            )

                        val response = client.postDocument("patient-1", request)

                        response.status shouldBe HttpStatusCode.Created
                        val created = response.body<MedicinePrescriptionResponse>()
                        created.validity shouldBe ValidityResponse.UntilExecution
                    }
                }
            }

            describe("service prescription") {
                it("should create a service prescription with valid data") {
                    val docRepo = FakeDocumentRepository()
                    val fileRepo = FakeFileStorageRepository()
                    configuredTestApp(docRepo, fileRepo) { client ->
                        val request = DocumentFixtures.servicePrescriptionRequest()

                        val response = client.postDocument("patient-1", request)

                        response.status shouldBe HttpStatusCode.Created
                        val created = response.body<ServicePrescriptionResponse>()
                        created.id shouldNotBe null
                        created.serviceId shouldBe "service-blood-test"
                        created.facilityId shouldBe "facility-lab-001"
                        created.priority shouldBe "ROUTINE"
                    }
                }

                it("should create an urgent service prescription") {
                    val docRepo = FakeDocumentRepository()
                    val fileRepo = FakeFileStorageRepository()
                    configuredTestApp(docRepo, fileRepo) { client ->
                        val request =
                            DocumentFixtures.servicePrescriptionRequest(priority = "URGENT")

                        val response = client.postDocument("patient-1", request)

                        response.status shouldBe HttpStatusCode.Created
                        response.body<ServicePrescriptionResponse>().priority shouldBe "URGENT"
                    }
                }
            }

            describe("report") {
                it("should create a report linked to an existing service prescription") {
                    val docRepo = FakeDocumentRepository()
                    val fileRepo = FakeFileStorageRepository()
                    configuredTestApp(docRepo, fileRepo) { client ->
                        // Given: a service prescription exists
                        val spResponse =
                            client.postDocument(
                                "patient-1",
                                DocumentFixtures.servicePrescriptionRequest(),
                            )
                        val sp = spResponse.body<ServicePrescriptionResponse>()

                        // When: creating a report linked to it
                        val reportRequest =
                            DocumentFixtures.reportRequest(
                                servicePrescriptionId = sp.id,
                            )
                        val response = client.postDocument("patient-1", reportRequest)

                        // Then
                        response.status shouldBe HttpStatusCode.Created
                        val created = response.body<ReportResponse>()
                        created.id shouldNotBe null
                        created.servicePrescription.id shouldBe sp.id
                        created.findings shouldBe "All values within normal range"
                    }
                }

                it("should return 404 when the referenced service prescription does not exist") {
                    configuredTestApp { client ->
                        val request =
                            DocumentFixtures.reportRequest(
                                servicePrescriptionId = "non-existent",
                            )

                        val response = client.postDocument("patient-1", request)

                        response.status shouldBe HttpStatusCode.NotFound
                    }
                }

                it("should return 400 when linking to a medicine prescription instead of service") {
                    val docRepo = FakeDocumentRepository()
                    val fileRepo = FakeFileStorageRepository()
                    configuredTestApp(docRepo, fileRepo) { client ->
                        // Given: a medicine prescription (not a service prescription)
                        val mp = client.createMedicinePrescription("patient-1")

                        // When
                        val request =
                            DocumentFixtures.reportRequest(
                                servicePrescriptionId = mp.id,
                            )
                        val response = client.postDocument("patient-1", request)

                        // Then
                        response.status shouldBe HttpStatusCode.BadRequest
                        response.body<ErrorResponse>().message shouldContain "ServicePrescription"
                    }
                }
            }

            describe("validation") {
                it("should return 400 for invalid JSON") {
                    configuredTestApp { client ->
                        val response =
                            client.post("/api/documents/patients/p1") {
                                contentType(ContentType.Application.Json)
                                setBody("{ invalid json }")
                            }

                        response.status shouldBe HttpStatusCode.BadRequest
                    }
                }
            }
        }

        describe("DELETE /api/documents/patients/{patientId}/{documentId}") {
            it("should delete an existing document") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    val created = client.createMedicinePrescription("patient-1")

                    val deleteResponse =
                        client.delete("/api/documents/patients/patient-1/${created.id}")

                    deleteResponse.status shouldBe HttpStatusCode.OK
                    deleteResponse.body<DeleteResponse>().message shouldContain "deleted"

                    // Verify it is gone
                    val getResponse = client.get("/api/documents/patients/patient-1/${created.id}")
                    getResponse.status shouldBe HttpStatusCode.NotFound
                }
            }

            it("should return 404 when deleting a non-existent document") {
                configuredTestApp { client ->
                    val response = client.delete("/api/documents/patients/p1/non-existent")

                    response.status shouldBe HttpStatusCode.NotFound
                }
            }
        }

        describe("PUT /api/documents/patients/{patientId}/{documentId}/report") {
            it("should update the editable fields of a report") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    // Given: a report exists
                    val sp =
                        client
                            .postDocument(
                                "patient-1",
                                DocumentFixtures.servicePrescriptionRequest(),
                            )
                            .body<ServicePrescriptionResponse>()

                    val report =
                        client
                            .postDocument(
                                "patient-1",
                                DocumentFixtures.reportRequest(servicePrescriptionId = sp.id),
                            )
                            .body<ReportResponse>()

                    // When
                    val updateRequest =
                        UpdateReportRequest(
                            findings = "Updated findings",
                            conclusion = "New conclusion",
                        )
                    val response =
                        client.put("/api/documents/patients/patient-1/${report.id}/report") {
                            contentType(ContentType.Application.Json)
                            setBody(updateRequest)
                        }

                    // Then
                    response.status shouldBe HttpStatusCode.OK
                    val updated = response.body<ReportResponse>()
                    updated.findings shouldBe "Updated findings"
                    updated.conclusion shouldBe "New conclusion"
                }
            }

            it("should return 400 when trying to update a non-report document") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    val mp = client.createMedicinePrescription("patient-1")

                    val response =
                        client.put("/api/documents/patients/patient-1/${mp.id}/report") {
                            contentType(ContentType.Application.Json)
                            setBody(UpdateReportRequest(findings = "New findings"))
                        }

                    response.status shouldBe HttpStatusCode.BadRequest
                    response.body<ErrorResponse>().message shouldContain "Report"
                }
            }

            it("should return 404 when the document does not exist") {
                configuredTestApp { client ->
                    val response =
                        client.put("/api/documents/patients/p1/non-existent/report") {
                            contentType(ContentType.Application.Json)
                            setBody(UpdateReportRequest(findings = "New findings"))
                        }

                    response.status shouldBe HttpStatusCode.NotFound
                }
            }

            it("should allow partial updates keeping existing values") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                configuredTestApp(docRepo, fileRepo) { client ->
                    val sp =
                        client
                            .postDocument(
                                "patient-1",
                                DocumentFixtures.servicePrescriptionRequest(),
                            )
                            .body<ServicePrescriptionResponse>()

                    val report =
                        client
                            .postDocument(
                                "patient-1",
                                DocumentFixtures.reportRequest(
                                    servicePrescriptionId = sp.id,
                                    conclusion = "Original conclusion",
                                    recommendations = "Original recommendations",
                                ),
                            )
                            .body<ReportResponse>()

                    // When: updating only recommendations
                    val response =
                        client.put("/api/documents/patients/patient-1/${report.id}/report") {
                            contentType(ContentType.Application.Json)
                            setBody(
                                UpdateReportRequest(
                                    recommendations = "Updated recommendations only"
                                )
                            )
                        }

                    // Then: only recommendations should change
                    response.status shouldBe HttpStatusCode.OK
                    val updated = response.body<ReportResponse>()
                    updated.recommendations shouldBe "Updated recommendations only"
                    updated.conclusion shouldBe "Original conclusion"
                    updated.findings shouldBe report.findings
                }
            }
        }
    })

private val testJson = Json {
    prettyPrint = true
    isLenient = true
    ignoreUnknownKeys = true
    encodeDefaults = true
    classDiscriminator = "type"
}

private fun Application.testModule(
    docRepo: DocumentRepository,
    fileRepo: FileStorageRepository,
) {
    install(io.ktor.server.plugins.contentnegotiation.ContentNegotiation) { json(testJson) }
    install(StatusPages) {
        exception<BadRequestException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", "Invalid request body", cause.message),
            )
        }
        exception<IllegalArgumentException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse("bad_request", "Invalid request", cause.message),
            )
        }
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "An unexpected error occurred", cause.message),
            )
        }
    }
    routing {
        get("/health") { call.respondText("OK") }
        route("/api") {
            val documentService =
                DocumentService(
                    repository = docRepo,
                    fileStorageRepository = fileRepo,
                    pdfGenerator = DocumentPdfGenerator(),
                    aiServiceClient = null,
                )
            documentRoutes(documentService)
        }
    }
}

private suspend fun io.ktor.client.HttpClient.postDocument(
    patientId: String,
    request: CreateDocumentRequest,
): HttpResponse =
    post("/api/documents/patients/$patientId") {
        contentType(ContentType.Application.Json)
        setBody(request)
    }

private suspend fun io.ktor.client.HttpClient.createMedicinePrescription(
    patientId: String,
): MedicinePrescriptionResponse {
    val response = postDocument(patientId, DocumentFixtures.medicinePrescriptionRequest())
    return response.body()
}

private suspend fun io.ktor.client.HttpClient.createServicePrescription(
    patientId: String,
): ServicePrescriptionResponse {
    val response = postDocument(patientId, DocumentFixtures.servicePrescriptionRequest())
    return response.body()
}
