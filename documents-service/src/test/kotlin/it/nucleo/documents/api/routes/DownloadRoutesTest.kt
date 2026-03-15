package it.nucleo.documents.api.routes

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.documents.api.dto.UploadResponse
import it.nucleo.documents.application.DocumentDownloadService
import it.nucleo.documents.application.DocumentUploadService
import it.nucleo.documents.fixtures.FakeDocumentRepository
import it.nucleo.documents.fixtures.FakeFileStorageRepository
import kotlinx.serialization.json.Json

class DownloadRoutesTest :
    DescribeSpec({

        // minimal valid PDF header
        val validPdfBytes = byteArrayOf(0x25, 0x50, 0x44, 0x46) + "-1.4 fake body".toByteArray()

        fun configuredTestApp(
            block: suspend (HttpClient) -> Unit,
        ) {
            val fileRepo = FakeFileStorageRepository()
            val docRepo = FakeDocumentRepository()

            testApplication {
                application { downloadTestModule(fileRepo, docRepo) }
                val client = createClient { install(ContentNegotiation) { json(downloadTestJson) } }
                block(client)
            }
        }

        describe("GET /api/documents/patients/{patientId}/{documentId}/pdf") {
            it("should download an uploaded document successfully") {
                val fileRepo = FakeFileStorageRepository()
                val docRepo = FakeDocumentRepository()

                testApplication {
                    application { downloadTestModule(fileRepo, docRepo) }
                    val client = createClient {
                        install(ContentNegotiation) { json(downloadTestJson) }
                    }

                    // Upload first
                    val uploadResponse =
                        client.submitFormWithBinaryData(
                            url = "/api/documents/patients/patient-1/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        validPdfBytes,
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"test.pdf\""
                                            )
                                        },
                                    )
                                },
                        )
                    uploadResponse.status shouldBe HttpStatusCode.Created
                    val docId = uploadResponse.body<UploadResponse>().documentId!!

                    // Download
                    val downloadResponse =
                        client.get("/api/documents/patients/patient-1/$docId/pdf")

                    downloadResponse.status shouldBe HttpStatusCode.OK
                    downloadResponse.contentType()?.toString() shouldBe "application/pdf"
                    downloadResponse.headers[HttpHeaders.ContentDisposition] shouldContain
                        "attachment"
                    downloadResponse.headers[HttpHeaders.ContentDisposition] shouldContain
                        "test.pdf"
                    downloadResponse.bodyAsBytes() shouldBe validPdfBytes
                }
            }

            it("should return 404 for a non-existent document") {
                configuredTestApp { client ->
                    val response = client.get("/api/documents/patients/patient-1/non-existent/pdf")

                    response.status shouldBe HttpStatusCode.NotFound
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "not_found"
                    error.message shouldContain "not found"
                }
            }

            it("should return 404 when trying to access another patient's document") {
                val fileRepo = FakeFileStorageRepository()
                val docRepo = FakeDocumentRepository()

                testApplication {
                    application { downloadTestModule(fileRepo, docRepo) }
                    val client = createClient {
                        install(ContentNegotiation) { json(downloadTestJson) }
                    }

                    // Upload for patient-a
                    val uploadResponse =
                        client.submitFormWithBinaryData(
                            url = "/api/documents/patients/patient-a/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        validPdfBytes,
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"secret.pdf\""
                                            )
                                        },
                                    )
                                },
                        )
                    val docId = uploadResponse.body<UploadResponse>().documentId!!

                    // Try to download as patient-b
                    val downloadResponse =
                        client.get("/api/documents/patients/patient-b/$docId/pdf")

                    downloadResponse.status shouldBe HttpStatusCode.NotFound
                }
            }

            it("should handle multiple uploads and downloads for the same patient") {
                val fileRepo = FakeFileStorageRepository()
                val docRepo = FakeDocumentRepository()

                testApplication {
                    application { downloadTestModule(fileRepo, docRepo) }
                    val client = createClient {
                        install(ContentNegotiation) { json(downloadTestJson) }
                    }

                    fun uploadForm(filename: String) = formData {
                        append(
                            "file",
                            validPdfBytes,
                            Headers.build {
                                append(HttpHeaders.ContentType, "application/pdf")
                                append(HttpHeaders.ContentDisposition, "filename=\"$filename\"")
                            },
                        )
                    }

                    val docId1 =
                        client
                            .submitFormWithBinaryData(
                                url = "/api/documents/patients/patient-1/upload",
                                formData = uploadForm("doc1.pdf"),
                            )
                            .body<UploadResponse>()
                            .documentId!!

                    val docId2 =
                        client
                            .submitFormWithBinaryData(
                                url = "/api/documents/patients/patient-1/upload",
                                formData = uploadForm("doc2.pdf"),
                            )
                            .body<UploadResponse>()
                            .documentId!!

                    val download1 = client.get("/api/documents/patients/patient-1/$docId1/pdf")
                    val download2 = client.get("/api/documents/patients/patient-1/$docId2/pdf")

                    download1.status shouldBe HttpStatusCode.OK
                    download2.status shouldBe HttpStatusCode.OK
                    download1.headers[HttpHeaders.ContentDisposition] shouldContain "doc1.pdf"
                    download2.headers[HttpHeaders.ContentDisposition] shouldContain "doc2.pdf"
                }
            }
        }
    })

private val downloadTestJson = Json {
    prettyPrint = true
    isLenient = true
    ignoreUnknownKeys = true
    encodeDefaults = true
    classDiscriminator = "_t"
}

private fun Application.downloadTestModule(
    fileRepo: FakeFileStorageRepository,
    docRepo: FakeDocumentRepository,
) {
    install(io.ktor.server.plugins.contentnegotiation.ContentNegotiation) { json(downloadTestJson) }
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse("internal_error", "An unexpected error occurred", cause.message),
            )
        }
    }
    routing {
        route("/api") {
            val uploadService =
                DocumentUploadService(
                    fileStorageRepository = fileRepo,
                    documentRepository = docRepo,
                    aiServiceClient = null,
                )
            val downloadService = DocumentDownloadService(fileRepo)
            uploadRoutes(uploadService)
            downloadRoutes(downloadService)
        }
    }
}
