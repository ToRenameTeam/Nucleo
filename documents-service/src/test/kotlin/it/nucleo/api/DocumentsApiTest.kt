package it.nucleo.api

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import it.nucleo.api.dto.*
import it.nucleo.api.fixtures.DocumentFixtures
import it.nucleo.api.fixtures.configuredTestApplication

class DocumentsApiTest : DescribeSpec({

    describe("Health Check") {
        it("should return OK") {
            configuredTestApplication { client ->
                val response = client.get("/health")

                response.status shouldBe HttpStatusCode.OK
                response.bodyAsText() shouldBe "OK"
            }
        }
    }

    describe("GET /api/v1/patients/{patientId}/documents") {
        it("should return empty list for patient with no documents") {
            configuredTestApplication { client ->
                val response = client.get("/api/v1/patients/unknown-patient/documents")

                response.status shouldBe HttpStatusCode.OK
                response.body<List<DocumentResponse>>().shouldBeEmpty()
            }
        }

        it("should return all documents for a patient") {
            configuredTestApplication { client ->
                // Given: a patient with two documents
                val patientId = "patient-${System.currentTimeMillis()}"
                client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.medicinePrescriptionRequest())
                }
                client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.servicePrescriptionRequest())
                }

                // When: retrieving all documents
                val response = client.get("/api/v1/patients/$patientId/documents")

                // Then: should return both documents
                response.status shouldBe HttpStatusCode.OK
                response.body<List<DocumentResponse>>() shouldHaveSize 2
            }
        }

        it("should not return documents from other patients") {
            configuredTestApplication { client ->
                // Given: documents for different patients
                val patientA = "patient-a-${System.currentTimeMillis()}"
                val patientB = "patient-b-${System.currentTimeMillis()}"

                client.post("/api/v1/patients/$patientA/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.medicinePrescriptionRequest())
                }
                client.post("/api/v1/patients/$patientB/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.servicePrescriptionRequest())
                }

                // When: retrieving documents for patient A
                val response = client.get("/api/v1/patients/$patientA/documents")

                // Then: should only return patient A's documents
                response.status shouldBe HttpStatusCode.OK
                val documents = response.body<List<DocumentResponse>>()
                documents shouldHaveSize 1
                documents.first().patientId shouldBe patientA
            }
        }
    }

    describe("GET /api/v1/patients/{patientId}/documents/{documentId}") {
        it("should return 404 for non-existent document") {
            configuredTestApplication { client ->
                val response = client.get("/api/v1/patients/patient-1/documents/non-existent-id")

                response.status shouldBe HttpStatusCode.NotFound
                val error = response.body<ErrorResponse>()
                error.error shouldBe "not_found"
            }
        }

        it("should return document by id") {
            configuredTestApplication { client ->
                // Given: a document exists
                val patientId = "patient-${System.currentTimeMillis()}"
                val createResponse = client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.medicinePrescriptionRequest())
                }
                val created = createResponse.body<MedicinePrescriptionResponse>()

                // When: retrieving by id
                val response = client.get("/api/v1/patients/$patientId/documents/${created.id}")

                // Then: should return the document
                response.status shouldBe HttpStatusCode.OK
                val document = response.body<MedicinePrescriptionResponse>()
                document.id shouldBe created.id
                document.doctorId shouldBe created.doctorId
            }
        }

        it("should return 404 when document belongs to different patient") {
            configuredTestApplication { client ->
                // Given: a document for patient A
                val patientA = "patient-a-${System.currentTimeMillis()}"
                val createResponse = client.post("/api/v1/patients/$patientA/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.medicinePrescriptionRequest())
                }
                val created = createResponse.body<MedicinePrescriptionResponse>()

                // When: trying to access it as patient B
                val response = client.get("/api/v1/patients/patient-b/documents/${created.id}")

                // Then: should not find it
                response.status shouldBe HttpStatusCode.NotFound
            }
        }
    }

    describe("POST /api/v1/patients/{patientId}/documents") {
        describe("Medicine Prescription") {
            it("should create medicine prescription with valid data") {
                configuredTestApplication { client ->
                    val patientId = "patient-${System.currentTimeMillis()}"
                    val request: CreateDocumentRequest = DocumentFixtures.medicinePrescriptionRequest()

                    val response = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody(request)
                    }

                    response.status shouldBe HttpStatusCode.Created
                    val created = response.body<MedicinePrescriptionResponse>()
                    created.id shouldNotBe null
                    created.patientId shouldBe patientId
                    created.doctorId shouldBe request.doctorId
                    created.metadata.fileUri shouldBe request.metadata.fileUri
                    created.dosage.medicineId shouldBe (request as CreateMedicinePrescriptionRequest).dosage.medicineId
                }
            }

            it("should create medicine prescription with until_execution validity") {
                configuredTestApplication { client ->
                    val patientId = "patient-${System.currentTimeMillis()}"
                    val request: CreateDocumentRequest = DocumentFixtures.medicinePrescriptionRequest(
                        validity = ValidityRequest.UntilExecution
                    )

                    val response = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody(request)
                    }

                    response.status shouldBe HttpStatusCode.Created
                    val created = response.body<MedicinePrescriptionResponse>()
                    created.validity shouldBe ValidityResponse.UntilExecution
                }
            }
        }

        describe("Service Prescription") {
            it("should create service prescription with valid data") {
                configuredTestApplication { client ->
                    val patientId = "patient-${System.currentTimeMillis()}"
                    val request: CreateDocumentRequest = DocumentFixtures.servicePrescriptionRequest()

                    val response = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody(request)
                    }

                    response.status shouldBe HttpStatusCode.Created
                    val created = response.body<ServicePrescriptionResponse>()
                    created.id shouldNotBe null
                    created.patientId shouldBe patientId
                    created.serviceId shouldBe (request as CreateServicePrescriptionRequest).serviceId
                    created.facilityId shouldBe request.facilityId
                    created.priority shouldBe request.priority
                }
            }

            it("should create urgent service prescription") {
                configuredTestApplication { client ->
                    val patientId = "patient-${System.currentTimeMillis()}"
                    val request: CreateDocumentRequest = DocumentFixtures.servicePrescriptionRequest(priority = "URGENT")

                    val response = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody(request)
                    }

                    response.status shouldBe HttpStatusCode.Created
                    val created = response.body<ServicePrescriptionResponse>()
                    created.priority shouldBe "URGENT"
                }
            }
        }

        describe("Report") {
            it("should create report linked to existing service prescription") {
                configuredTestApplication { client ->
                    // Given: a service prescription exists
                    val patientId = "patient-${System.currentTimeMillis()}"
                    val prescriptionResponse = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody<CreateDocumentRequest>(DocumentFixtures.servicePrescriptionRequest())
                    }
                    val prescription = prescriptionResponse.body<ServicePrescriptionResponse>()

                    // When: creating a report for that prescription
                    val reportRequest: CreateDocumentRequest = DocumentFixtures.reportRequest(
                        servicePrescriptionId = prescription.id
                    )
                    val response = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody(reportRequest)
                    }

                    // Then: report should be created with link to prescription
                    response.status shouldBe HttpStatusCode.Created
                    val created = response.body<ReportResponse>()
                    created.id shouldNotBe null
                    created.servicePrescription.id shouldBe prescription.id
                    created.findings shouldBe (reportRequest as CreateReportRequest).findings
                    created.executionDate shouldBe reportRequest.executionDate
                }
            }

            it("should return 404 when service prescription does not exist") {
                configuredTestApplication { client ->
                    val patientId = "patient-${System.currentTimeMillis()}"
                    val request: CreateDocumentRequest = DocumentFixtures.reportRequest(
                        servicePrescriptionId = "non-existent-prescription"
                    )

                    val response = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody(request)
                    }

                    response.status shouldBe HttpStatusCode.NotFound
                }
            }

            it("should return 400 when trying to link report to medicine prescription") {
                configuredTestApplication { client ->
                    // Given: a medicine prescription (not a service prescription)
                    val patientId = "patient-${System.currentTimeMillis()}"
                    val medicineResponse = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody<CreateDocumentRequest>(DocumentFixtures.medicinePrescriptionRequest())
                    }
                    val medicinePrescription = medicineResponse.body<MedicinePrescriptionResponse>()

                    // When: trying to create a report linked to it
                    val request: CreateDocumentRequest = DocumentFixtures.reportRequest(
                        servicePrescriptionId = medicinePrescription.id
                    )
                    val response = client.post("/api/v1/patients/$patientId/documents") {
                        contentType(ContentType.Application.Json)
                        setBody(request)
                    }

                    // Then: should fail with bad request
                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.message shouldContain "not a service prescription"
                }
            }
        }

        describe("Validation") {
            it("should return 400 for invalid JSON") {
                configuredTestApplication { client ->
                    val response = client.post("/api/v1/patients/patient-1/documents") {
                        contentType(ContentType.Application.Json)
                        setBody("{ invalid json }")
                    }

                    response.status shouldBe HttpStatusCode.BadRequest
                }
            }
        }
    }

    describe("DELETE /api/v1/patients/{patientId}/documents/{documentId}") {
        it("should delete existing document") {
            configuredTestApplication { client ->
                // Given: a document exists
                val patientId = "patient-${System.currentTimeMillis()}"
                val createResponse = client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.medicinePrescriptionRequest())
                }
                val created = createResponse.body<MedicinePrescriptionResponse>()

                // When: deleting it
                val deleteResponse = client.delete("/api/v1/patients/$patientId/documents/${created.id}")

                // Then: should succeed
                deleteResponse.status shouldBe HttpStatusCode.OK
                val result = deleteResponse.body<DeleteResponse>()
                result.message shouldContain "deleted"

                // And: document should no longer exist
                val getResponse = client.get("/api/v1/patients/$patientId/documents/${created.id}")
                getResponse.status shouldBe HttpStatusCode.NotFound
            }
        }

        it("should return 404 when deleting non-existent document") {
            configuredTestApplication { client ->
                val response = client.delete("/api/v1/patients/patient-1/documents/non-existent")

                response.status shouldBe HttpStatusCode.NotFound
            }
        }
    }

    describe("PUT /api/v1/patients/{patientId}/documents/{documentId}/report") {
        it("should update report findings") {
            configuredTestApplication { client ->
                // Given: a report exists
                val patientId = "patient-${System.currentTimeMillis()}"
                val prescriptionResponse = client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.servicePrescriptionRequest())
                }
                val prescription = prescriptionResponse.body<ServicePrescriptionResponse>()

                val reportResponse = client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.reportRequest(servicePrescriptionId = prescription.id))
                }
                val report = reportResponse.body<ReportResponse>()

                // When: updating the report
                val updateRequest = UpdateReportRequest(
                    findings = "Updated findings with new information",
                    conclusion = "New conclusion"
                )
                val response = client.put("/api/v1/patients/$patientId/documents/${report.id}/report") {
                    contentType(ContentType.Application.Json)
                    setBody(updateRequest)
                }

                // Then: should return updated report
                response.status shouldBe HttpStatusCode.OK
                val updated = response.body<ReportResponse>()
                updated.findings shouldBe "Updated findings with new information"
                updated.conclusion shouldBe "New conclusion"
            }
        }

        it("should return 400 when trying to update non-report document") {
            configuredTestApplication { client ->
                // Given: a medicine prescription (not a report)
                val patientId = "patient-${System.currentTimeMillis()}"
                val createResponse = client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.medicinePrescriptionRequest())
                }
                val prescription = createResponse.body<MedicinePrescriptionResponse>()

                // When: trying to update it as a report
                val updateRequest = UpdateReportRequest(findings = "New findings")
                val response = client.put("/api/v1/patients/$patientId/documents/${prescription.id}/report") {
                    contentType(ContentType.Application.Json)
                    setBody(updateRequest)
                }

                // Then: should fail
                response.status shouldBe HttpStatusCode.BadRequest
                val error = response.body<ErrorResponse>()
                error.message shouldContain "report"
            }
        }

        it("should return 404 when updating non-existent report") {
            configuredTestApplication { client ->
                val updateRequest = UpdateReportRequest(findings = "New findings")
                val response = client.put("/api/v1/patients/patient-1/documents/non-existent/report") {
                    contentType(ContentType.Application.Json)
                    setBody(updateRequest)
                }

                response.status shouldBe HttpStatusCode.NotFound
            }
        }

        it("should allow partial updates") {
            configuredTestApplication { client ->
                // Given: a report with all fields
                val patientId = "patient-${System.currentTimeMillis()}"
                val prescriptionResponse = client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.servicePrescriptionRequest())
                }
                val prescription = prescriptionResponse.body<ServicePrescriptionResponse>()

                val reportResponse = client.post("/api/v1/patients/$patientId/documents") {
                    contentType(ContentType.Application.Json)
                    setBody<CreateDocumentRequest>(DocumentFixtures.reportRequest(
                        servicePrescriptionId = prescription.id,
                        conclusion = "Original conclusion",
                        recommendations = "Original recommendations"
                    ))
                }
                val report = reportResponse.body<ReportResponse>()

                // When: updating only recommendations
                val updateRequest = UpdateReportRequest(recommendations = "Updated recommendations only")
                val response = client.put("/api/v1/patients/$patientId/documents/${report.id}/report") {
                    contentType(ContentType.Application.Json)
                    setBody(updateRequest)
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
