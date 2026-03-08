package it.nucleo.documents.application

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.errors.Either
import it.nucleo.documents.domain.errors.ValidationError
import it.nucleo.documents.fixtures.FakeDocumentRepository
import it.nucleo.documents.fixtures.FakeFileStorageRepository

class DocumentUploadServiceTest :
    DescribeSpec({

        // minimal valid PDF header (%PDF-1.4) followed by enough bytes
        val validPdfBytes = byteArrayOf(0x25, 0x50, 0x44, 0x46) + "−1.4 fake body".toByteArray()

        fun createService(
            fileRepo: FakeFileStorageRepository = FakeFileStorageRepository(),
            docRepo: FakeDocumentRepository = FakeDocumentRepository(),
        ) =
            DocumentUploadService(
                fileStorageRepository = fileRepo,
                documentRepository = docRepo,
                aiServiceClient = null,
            )

        describe("upload") {
            describe("with valid input") {
                it("should store the file and return a document id") {
                    val fileRepo = FakeFileStorageRepository()
                    val docRepo = FakeDocumentRepository()
                    val service = createService(fileRepo, docRepo)

                    val command =
                        UploadDocumentCommand(
                            patientId = PatientId("patient-001"),
                            filename = "blood-test.pdf",
                            content = validPdfBytes,
                            contentType = "application/pdf",
                        )

                    val result = service.upload(command)

                    result.shouldBeInstanceOf<Either.Right<DocumentId>>()
                    result.value.id.isNotBlank() shouldBe true
                }
            }

            describe("validation") {
                it("should reject a non-PDF filename") {
                    val service = createService()

                    val command =
                        UploadDocumentCommand(
                            patientId = PatientId("patient-001"),
                            filename = "document.txt",
                            content = "text".toByteArray(),
                            contentType = "application/pdf",
                        )

                    val result = service.upload(command)

                    result.shouldBeInstanceOf<Either.Left<ValidationError>>()
                    result.error.message shouldBe "Only PDF files are accepted"
                }

                it("should reject a non-PDF content type") {
                    val service = createService()

                    val command =
                        UploadDocumentCommand(
                            patientId = PatientId("patient-001"),
                            filename = "document.pdf",
                            content = validPdfBytes,
                            contentType = "text/plain",
                        )

                    val result = service.upload(command)

                    result.shouldBeInstanceOf<Either.Left<ValidationError>>()
                }

                it("should reject an empty file") {
                    val service = createService()

                    val command =
                        UploadDocumentCommand(
                            patientId = PatientId("patient-001"),
                            filename = "empty.pdf",
                            content = byteArrayOf(),
                            contentType = "application/pdf",
                        )

                    val result = service.upload(command)

                    result.shouldBeInstanceOf<Either.Left<ValidationError>>()
                    result.error.message shouldBe "File is empty"
                }

                it("should reject a file that does not start with PDF magic bytes") {
                    val service = createService()

                    val command =
                        UploadDocumentCommand(
                            patientId = PatientId("patient-001"),
                            filename = "fake.pdf",
                            content = "Not a real PDF content".toByteArray(),
                            contentType = "application/pdf",
                        )

                    val result = service.upload(command)

                    result.shouldBeInstanceOf<Either.Left<ValidationError>>()
                    result.error.message shouldBe "File does not appear to be a valid PDF"
                }
            }
        }
    })
