package it.nucleo.documents.api.routes

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.forms.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import it.nucleo.commons.api.ErrorResponse
import it.nucleo.documents.api.dto.UploadResponse
import it.nucleo.documents.application.DocumentUploadService
import it.nucleo.documents.fixtures.FakeDocumentRepository
import it.nucleo.documents.fixtures.FakeFileStorageRepository
import kotlinx.serialization.json.Json

class UploadRoutesTest :
    DescribeSpec({

        // minimal valid PDF header
        val validPdfBytes = byteArrayOf(0x25, 0x50, 0x44, 0x46) + "-1.4 fake body".toByteArray()

        fun configuredTestApp(
            block: suspend (HttpClient) -> Unit,
        ) = testApplication {
            val fileRepo = FakeFileStorageRepository()
            val docRepo = FakeDocumentRepository()
            application { uploadTestModule(fileRepo, docRepo) }
            val client = createClient { install(ContentNegotiation) { json(uploadTestJson) } }
            block(client)
        }

        describe("POST /api/documents/patients/{patientId}/upload") {
            it("should upload a valid PDF document successfully") {
                configuredTestApp { client ->
                    val response =
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
                                                "filename=\"test-document.pdf\"",
                                            )
                                        },
                                    )
                                },
                        )

                    response.status shouldBe HttpStatusCode.Created
                    val body = response.body<UploadResponse>()
                    body.success shouldBe true
                    body.message shouldContain "uploaded successfully"
                    body.documentId shouldNotBe null
                }
            }

            it("should reject an upload without a file") {
                configuredTestApp { client ->
                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/documents/patients/patient-1/upload",
                            formData = formData {},
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "bad_request"
                    error.message shouldContain "No file provided"
                }
            }

            it("should reject non-PDF files") {
                configuredTestApp { client ->
                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/documents/patients/patient-1/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        "This is not a PDF".toByteArray(),
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "text/plain")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"document.txt\"",
                                            )
                                        },
                                    )
                                },
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "VALIDATION_ERROR"
                    error.message shouldContain "Only PDF files are accepted"
                }
            }

            it("should reject files with a PDF extension but invalid content") {
                configuredTestApp { client ->
                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/documents/patients/patient-1/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        "Not a real PDF content".toByteArray(),
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"fake.pdf\"",
                                            )
                                        },
                                    )
                                },
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "VALIDATION_ERROR"
                    error.message shouldContain "does not appear to be a valid PDF"
                }
            }

            it("should reject empty files") {
                configuredTestApp { client ->
                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/documents/patients/patient-1/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        byteArrayOf(),
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"empty.pdf\"",
                                            )
                                        },
                                    )
                                },
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "VALIDATION_ERROR"
                    error.message shouldContain "empty"
                }
            }
        }
    })

private val uploadTestJson = Json {
    prettyPrint = true
    isLenient = true
    ignoreUnknownKeys = true
    encodeDefaults = true
    classDiscriminator = "type"
}

private fun Application.uploadTestModule(
    fileRepo: FakeFileStorageRepository,
    docRepo: FakeDocumentRepository,
) {
    install(io.ktor.server.plugins.contentnegotiation.ContentNegotiation) { json(uploadTestJson) }
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
            uploadRoutes(uploadService)
        }
    }
}
