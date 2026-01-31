package it.nucleo.api

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.call.*
import io.ktor.client.request.forms.*
import io.ktor.http.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.api.dto.UploadResponse
import it.nucleo.api.fixtures.configuredTestApplication
import it.nucleo.api.fixtures.loadTestPdf

class DocumentUploadApiTest :
    DescribeSpec({
        describe("POST /api/v1/patients/{patientId}/documents/upload") {
            it("should upload a valid PDF document successfully") {
                configuredTestApplication { client ->
                    val patientId = "patient-upload-${System.currentTimeMillis()}"
                    val pdfContent = loadTestPdf()

                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/v1/patients/$patientId/documents/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        pdfContent,
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"test-document.pdf\""
                                            )
                                        }
                                    )
                                }
                        )

                    response.status shouldBe HttpStatusCode.Created
                    val body = response.body<UploadResponse>()
                    body.success shouldBe true
                    body.message shouldContain "uploaded successfully"
                }
            }

            it("should reject upload without file") {
                configuredTestApplication { client ->
                    val patientId = "patient-upload-${System.currentTimeMillis()}"

                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/v1/patients/$patientId/documents/upload",
                            formData = formData {}
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "bad_request"
                    error.message shouldContain "No file provided"
                }
            }

            it("should reject non-PDF files") {
                configuredTestApplication { client ->
                    val patientId = "patient-upload-${System.currentTimeMillis()}"
                    val textContent = "This is not a PDF".toByteArray()

                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/v1/patients/$patientId/documents/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        textContent,
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "text/plain")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"document.txt\""
                                            )
                                        }
                                    )
                                }
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "bad_request"
                    error.message shouldContain "Only PDF files are accepted"
                }
            }

            it("should reject files with PDF extension but invalid content") {
                configuredTestApplication { client ->
                    val patientId = "patient-upload-${System.currentTimeMillis()}"
                    val fakeContent = "Not a real PDF content".toByteArray()

                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/v1/patients/$patientId/documents/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        fakeContent,
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"fake.pdf\""
                                            )
                                        }
                                    )
                                }
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "bad_request"
                    error.message shouldContain "does not appear to be a valid PDF"
                }
            }

            it("should reject empty files") {
                configuredTestApplication { client ->
                    val patientId = "patient-upload-${System.currentTimeMillis()}"

                    val response =
                        client.submitFormWithBinaryData(
                            url = "/api/v1/patients/$patientId/documents/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        byteArrayOf(),
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"empty.pdf\""
                                            )
                                        }
                                    )
                                }
                        )

                    response.status shouldBe HttpStatusCode.BadRequest
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "bad_request"
                    error.message shouldContain "empty"
                }
            }
        }
    })
