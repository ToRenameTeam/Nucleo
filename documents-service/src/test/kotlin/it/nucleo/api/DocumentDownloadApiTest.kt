package it.nucleo.api

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.api.dto.UploadResponse
import it.nucleo.api.fixtures.configuredTestApplication
import it.nucleo.api.fixtures.loadTestPdf

class DocumentDownloadApiTest :
    DescribeSpec({
        describe("GET /api/v1/patients/{patientId}/documents/{documentId}/pdf") {
            it("should download an uploaded document successfully") {
                configuredTestApplication { client ->
                    val patientId = "patient-download-${System.currentTimeMillis()}"
                    val pdfContent = loadTestPdf()
                    val filename = "test-download.pdf"

                    // Upload a document first
                    val uploadResponse =
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
                                                "filename=\"$filename\""
                                            )
                                        }
                                    )
                                }
                        )
                    uploadResponse.status shouldBe HttpStatusCode.Created

                    val uploadBody = uploadResponse.body<UploadResponse>()
                    val documentId = uploadBody.documentId!!

                    // Download the document using the returned document ID
                    val downloadResponse =
                        client.get("/api/v1/patients/$patientId/documents/$documentId/pdf")

                    downloadResponse.status shouldBe HttpStatusCode.OK
                    downloadResponse.contentType()?.toString() shouldBe "application/pdf"
                    downloadResponse.headers[HttpHeaders.ContentDisposition] shouldContain
                        "attachment"
                    // The original filename should be preserved (sanitized)
                    downloadResponse.headers[HttpHeaders.ContentDisposition] shouldContain
                        "test-download.pdf"

                    val downloadedContent = downloadResponse.bodyAsBytes()
                    downloadedContent shouldBe pdfContent
                }
            }

            it("should return 404 for non-existent document") {
                configuredTestApplication { client ->
                    val patientId = "patient-download-${System.currentTimeMillis()}"

                    val response =
                        client.get("/api/v1/patients/$patientId/documents/non-existent-id/pdf")

                    response.status shouldBe HttpStatusCode.NotFound
                    val error = response.body<ErrorResponse>()
                    error.error shouldBe "not_found"
                    error.message shouldContain "not found"
                }
            }

            it("should return 404 when trying to access another patient's document") {
                configuredTestApplication { client ->
                    val patientA = "patient-a-download-${System.currentTimeMillis()}"
                    val patientB = "patient-b-download-${System.currentTimeMillis()}"
                    val pdfContent = loadTestPdf()

                    // Upload document for patient A
                    val uploadResponse =
                        client.submitFormWithBinaryData(
                            url = "/api/v1/patients/$patientA/documents/upload",
                            formData =
                                formData {
                                    append(
                                        "file",
                                        pdfContent,
                                        Headers.build {
                                            append(HttpHeaders.ContentType, "application/pdf")
                                            append(
                                                HttpHeaders.ContentDisposition,
                                                "filename=\"secret.pdf\""
                                            )
                                        }
                                    )
                                }
                        )
                    uploadResponse.status shouldBe HttpStatusCode.Created
                    val documentId = uploadResponse.body<UploadResponse>().documentId!!

                    // Try to download as patient B - should fail
                    val downloadResponse =
                        client.get("/api/v1/patients/$patientB/documents/$documentId/pdf")

                    downloadResponse.status shouldBe HttpStatusCode.NotFound
                }
            }

            it("should handle multiple uploads and downloads for same patient") {
                configuredTestApplication { client ->
                    val patientId = "patient-multi-${System.currentTimeMillis()}"
                    val pdfContent = loadTestPdf()

                    // Upload first document
                    val upload1 =
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
                                                "filename=\"doc1.pdf\""
                                            )
                                        }
                                    )
                                }
                        )
                    val docId1 = upload1.body<UploadResponse>().documentId!!

                    // Upload second document
                    val upload2 =
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
                                                "filename=\"doc2.pdf\""
                                            )
                                        }
                                    )
                                }
                        )
                    val docId2 = upload2.body<UploadResponse>().documentId!!

                    // Download both documents
                    val download1 = client.get("/api/v1/patients/$patientId/documents/$docId1/pdf")
                    val download2 = client.get("/api/v1/patients/$patientId/documents/$docId2/pdf")

                    download1.status shouldBe HttpStatusCode.OK
                    download2.status shouldBe HttpStatusCode.OK
                    download1.bodyAsBytes() shouldBe pdfContent
                    download2.bodyAsBytes() shouldBe pdfContent

                    // Verify filenames are preserved
                    download1.headers[HttpHeaders.ContentDisposition] shouldContain "doc1.pdf"
                    download2.headers[HttpHeaders.ContentDisposition] shouldContain "doc2.pdf"
                }
            }
        }
    })
