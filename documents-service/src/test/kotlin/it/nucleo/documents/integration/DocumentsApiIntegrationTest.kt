package it.nucleo.documents.integration

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.ktor.client.request.delete
import io.ktor.client.request.forms.formData
import io.ktor.client.request.forms.submitFormWithBinaryData
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsBytes
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.application.Application
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import it.nucleo.configureSerialization
import it.nucleo.configureStatusPages
import it.nucleo.documents.api.routes.documentRoutes
import it.nucleo.documents.api.routes.downloadRoutes
import it.nucleo.documents.api.routes.uploadRoutes
import it.nucleo.documents.application.DocumentDownloadService
import it.nucleo.documents.application.DocumentPdfGenerator
import it.nucleo.documents.application.DocumentService
import it.nucleo.documents.application.DocumentUploadService
import it.nucleo.documents.infrastructure.persistence.minio.MinioFileStorageRepository
import it.nucleo.documents.infrastructure.persistence.mongodb.MongoDocumentRepository
import it.nucleo.documents.integration.support.DocumentsContainersSupport
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class DocumentsApiIntegrationTest :
    DescribeSpec({
        val json = Json { ignoreUnknownKeys = true }
        val validPdfBytes =
            byteArrayOf(0x25, 0x50, 0x44, 0x46) + "-1.4 integration test".toByteArray()

        fun configuredTestApp(block: suspend ApplicationTestBuilder.() -> Unit) = testApplication {
            application { documentsIntegrationTestModule() }
            block()
        }

        fun jsonField(body: String, field: String): String {
            return json.parseToJsonElement(body).jsonObject.getValue(field).jsonPrimitive.content
        }

        suspend fun ApplicationTestBuilder.uploadPdf(patientId: String, filename: String): String {
            val response =
                client.submitFormWithBinaryData(
                    url = "/api/documents/patients/$patientId/upload",
                    formData =
                        formData {
                            append(
                                key = "file",
                                value = validPdfBytes,
                                headers =
                                    Headers.build {
                                        append(HttpHeaders.ContentType, "application/pdf")
                                        append(
                                            HttpHeaders.ContentDisposition,
                                            "filename=\"$filename\""
                                        )
                                    }
                            )
                        }
                )

            response.status shouldBe HttpStatusCode.Created
            return jsonField(response.bodyAsText(), "documentId")
        }

        beforeSpec { DocumentsContainersSupport.start() }

        beforeTest { DocumentsContainersSupport.resetState() }

        afterSpec { DocumentsContainersSupport.stop() }

        describe("Documents API integration") {
            it("returns health status") {
                configuredTestApp {
                    val response = client.get("/health")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldBe "OK"
                }
            }

            it("uploads, lists, fetches and downloads a PDF document") {
                configuredTestApp {
                    val patientId = "patient-integration-1"
                    val filename = "lab-report.pdf"
                    val documentId = uploadPdf(patientId = patientId, filename = filename)

                    val listResponse = client.get("/api/documents/patients/$patientId")
                    listResponse.status shouldBe HttpStatusCode.OK

                    val documents = json.parseToJsonElement(listResponse.bodyAsText()).jsonArray
                    documents shouldHaveSize 1
                    documents.first().jsonObject.getValue("id").jsonPrimitive.content shouldBe
                        documentId
                    documents.first().jsonObject.getValue("_t").jsonPrimitive.content shouldBe
                        "uploaded_document"

                    val byIdResponse = client.get("/api/documents/patients/$patientId/$documentId")
                    byIdResponse.status shouldBe HttpStatusCode.OK
                    jsonField(byIdResponse.bodyAsText(), "filename") shouldBe filename

                    val downloadResponse =
                        client.get("/api/documents/patients/$patientId/$documentId/pdf")
                    downloadResponse.status shouldBe HttpStatusCode.OK
                    downloadResponse.contentType() shouldBe ContentType.Application.Pdf
                    downloadResponse.bodyAsBytes() shouldBe validPdfBytes
                }
            }

            it("filters documents by doctor id for uploaded documents") {
                configuredTestApp {
                    uploadPdf("patient-doctor-a", "a.pdf")
                    uploadPdf("patient-doctor-b", "b.pdf")

                    val response = client.get("/api/documents?doctorId=UNKNOWN")
                    response.status shouldBe HttpStatusCode.OK

                    val documents = json.parseToJsonElement(response.bodyAsText()).jsonArray
                    documents shouldHaveSize 2
                }
            }

            it("deletes a document from the patient record") {
                configuredTestApp {
                    val patientId = "patient-delete"
                    val documentId = uploadPdf(patientId = patientId, filename = "to-delete.pdf")

                    val deleteResponse =
                        client.delete("/api/documents/patients/$patientId/$documentId")
                    deleteResponse.status shouldBe HttpStatusCode.OK

                    val byIdResponse = client.get("/api/documents/patients/$patientId/$documentId")
                    byIdResponse.status shouldBe HttpStatusCode.NotFound

                    val listResponse = client.get("/api/documents/patients/$patientId")
                    listResponse.status shouldBe HttpStatusCode.OK
                    json.parseToJsonElement(listResponse.bodyAsText()).jsonArray shouldHaveSize 0
                }
            }
        }
    })

private fun Application.documentsIntegrationTestModule() {
    configureSerialization()
    configureStatusPages()

    val documentRepository = MongoDocumentRepository(DocumentsContainersSupport.mongoDatabase)
    val fileStorageRepository =
        MinioFileStorageRepository(
            minioClient = DocumentsContainersSupport.minioClient,
            bucketName = DocumentsContainersSupport.bucketName()
        )

    val documentService =
        DocumentService(
            repository = documentRepository,
            fileStorageRepository = fileStorageRepository,
            pdfGenerator = DocumentPdfGenerator(),
            aiServiceClient = null
        )
    val uploadService =
        DocumentUploadService(
            fileStorageRepository = fileStorageRepository,
            documentRepository = documentRepository,
            aiServiceClient = null
        )
    val downloadService = DocumentDownloadService(fileStorageRepository)

    routing {
        get("/health") { call.respondText("OK") }
        route("/api") {
            documentRoutes(documentService)
            uploadRoutes(uploadService)
            downloadRoutes(downloadService)
        }
    }
}
