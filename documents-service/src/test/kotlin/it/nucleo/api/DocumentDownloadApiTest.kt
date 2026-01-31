package it.nucleo.api

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.minio.ListObjectsArgs
import it.nucleo.api.dto.ErrorResponse
import it.nucleo.api.fixtures.TestMinioConfig
import it.nucleo.api.fixtures.configuredTestApplication
import it.nucleo.api.fixtures.loadTestPdf
import it.nucleo.infrastructure.persistence.minio.MinioClientFactory

class DocumentDownloadApiTest :
    DescribeSpec({
        describe("GET /api/v1/patients/{patientId}/documents/{documentKey}/download") {
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

                    // Get the document key from MinIO
                    val documentKey = getLatestDocumentKey(patientId)

                    // Download the document
                    val downloadResponse =
                        client.get("/api/v1/patients/$patientId/documents/$documentKey/download")

                    downloadResponse.status shouldBe HttpStatusCode.OK
                    downloadResponse.contentType()?.toString() shouldBe "application/pdf"
                    downloadResponse.headers[HttpHeaders.ContentDisposition] shouldContain
                        "attachment"
                    downloadResponse.headers[HttpHeaders.ContentDisposition] shouldContain filename

                    val downloadedContent = downloadResponse.bodyAsBytes()
                    downloadedContent shouldBe pdfContent
                }
            }

            it("should return 404 for non-existent document") {
                configuredTestApplication { client ->
                    val patientId = "patient-download-${System.currentTimeMillis()}"

                    val response =
                        client.get(
                            "/api/v1/patients/$patientId/documents/non-existent-key.pdf/download"
                        )

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

                    // Get the document key
                    val documentKey = getLatestDocumentKey(patientA)

                    // Try to download as patient B
                    val downloadResponse =
                        client.get("/api/v1/patients/$patientB/documents/$documentKey/download")

                    downloadResponse.status shouldBe HttpStatusCode.NotFound
                }
            }

            it("should handle documents with special characters in filename") {
                configuredTestApplication { client ->
                    val patientId = "patient-download-${System.currentTimeMillis()}"
                    val pdfContent = loadTestPdf()
                    val filename = "medical report (2026).pdf"

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

                    val documentKey = getLatestDocumentKey(patientId)

                    val downloadResponse =
                        client.get("/api/v1/patients/$patientId/documents/$documentKey/download")

                    downloadResponse.status shouldBe HttpStatusCode.OK
                    // Filename should be sanitized but still recognizable
                    downloadResponse.headers[HttpHeaders.ContentDisposition] shouldContain
                        "attachment"
                }
            }

            it("should handle multiple uploads and downloads for same patient") {
                configuredTestApplication { client ->
                    val patientId = "patient-multi-${System.currentTimeMillis()}"
                    val pdfContent = loadTestPdf()

                    // Upload first document
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
                    val key1 = getLatestDocumentKey(patientId)

                    // Upload second document (same content, different filename)
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
                    val key2 = getLatestDocumentKey(patientId)

                    // Download both documents
                    val download1 =
                        client.get("/api/v1/patients/$patientId/documents/$key1/download")
                    val download2 =
                        client.get("/api/v1/patients/$patientId/documents/$key2/download")

                    download1.status shouldBe HttpStatusCode.OK
                    download2.status shouldBe HttpStatusCode.OK
                    download1.bodyAsBytes() shouldBe pdfContent
                    download2.bodyAsBytes() shouldBe pdfContent
                }
            }
        }
    })

/**
 * Helper function to get the latest uploaded document key for a patient. This directly queries
 * MinIO to find the uploaded file.
 */
private fun getLatestDocumentKey(patientId: String): String {
    val minioClient =
        MinioClientFactory.createClient(
            endpoint = TestMinioConfig.ENDPOINT,
            accessKey = TestMinioConfig.ACCESS_KEY,
            secretKey = TestMinioConfig.SECRET_KEY
        )

    val prefix = "patients/$patientId/"
    val objects =
        minioClient.listObjects(
            ListObjectsArgs.builder().bucket(TestMinioConfig.BUCKET_NAME).prefix(prefix).build()
        )

    val latestObject =
        objects.map { it.get() }.maxByOrNull { it.lastModified() }
            ?: throw IllegalStateException("No documents found for patient $patientId")

    // Return just the document key (filename part without the patient prefix)
    return latestObject.objectName().removePrefix(prefix)
}
