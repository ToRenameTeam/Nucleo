package it.nucleo.documents.application

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.StoredFile
import it.nucleo.documents.domain.errors.Either
import it.nucleo.documents.domain.errors.StorageError
import it.nucleo.documents.fixtures.FakeFileStorageRepository

class DocumentDownloadServiceTest :
    DescribeSpec({
        describe("download") {
            it("should return the stored file when it exists") {
                val fileRepo = FakeFileStorageRepository()
                val service = DocumentDownloadService(fileRepo)

                val patientId = PatientId("patient-001")
                val documentId = DocumentId("doc-001")
                val content = "PDF content".toByteArray()

                fileRepo.store(
                    patientId,
                    documentId,
                    "report.pdf",
                    content.inputStream(),
                    content.size.toLong(),
                    "application/pdf",
                )

                val result =
                    service.download(
                        DownloadDocumentQuery(patientId, documentId),
                    )

                result.shouldBeInstanceOf<Either.Right<StoredFile>>()
                result.value.filename shouldBe "report.pdf"
                result.value.contentType shouldBe "application/pdf"
                result.value.inputStream.readBytes() shouldBe content
            }

            it("should return FileNotFound when the document does not exist") {
                val fileRepo = FakeFileStorageRepository()
                val service = DocumentDownloadService(fileRepo)

                val result =
                    service.download(
                        DownloadDocumentQuery(
                            PatientId("unknown"),
                            DocumentId("unknown"),
                        ),
                    )

                result.shouldBeInstanceOf<Either.Left<StorageError.FileNotFound>>()
            }

            it("should not return a file belonging to a different patient") {
                val fileRepo = FakeFileStorageRepository()
                val service = DocumentDownloadService(fileRepo)

                val patientA = PatientId("patient-a")
                val documentId = DocumentId("doc-001")
                val content = "secret".toByteArray()

                fileRepo.store(
                    patientA,
                    documentId,
                    "secret.pdf",
                    content.inputStream(),
                    content.size.toLong(),
                    "application/pdf",
                )

                val result =
                    service.download(
                        DownloadDocumentQuery(PatientId("patient-b"), documentId),
                    )

                result.shouldBeInstanceOf<Either.Left<StorageError.FileNotFound>>()
            }
        }
    })
