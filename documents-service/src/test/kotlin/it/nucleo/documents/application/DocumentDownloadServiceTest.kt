package it.nucleo.documents.application

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import it.nucleo.commons.errors.Either
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.StoredFile
import it.nucleo.documents.domain.errors.StorageError
import it.nucleo.documents.fixtures.FakeFileStorageRepository

class DocumentDownloadServiceTest :
    DescribeSpec({
        fun patientId(value: String): PatientId =
            when (val result = PatientId(value)) {
                is Either.Right -> result.value
                is Either.Left -> error("Invalid test patientId: ${result.error.message}")
            }

        fun documentId(value: String): DocumentId =
            when (val result = DocumentId(value)) {
                is Either.Right -> result.value
                is Either.Left -> error("Invalid test documentId: ${result.error.message}")
            }

        describe("download") {
            it("should return the stored file when it exists") {
                val fileRepo = FakeFileStorageRepository()
                val service = DocumentDownloadService(fileRepo)

                val patientId = patientId("patient-001")
                val documentId = documentId("doc-001")
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
                            patientId("unknown"),
                            documentId("unknown"),
                        ),
                    )

                result.shouldBeInstanceOf<Either.Left<StorageError.FileNotFound>>()
            }

            it("should not return a file belonging to a different patient") {
                val fileRepo = FakeFileStorageRepository()
                val service = DocumentDownloadService(fileRepo)

                val patientA = patientId("patient-a")
                val documentId = documentId("doc-001")
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
                        DownloadDocumentQuery(patientId("patient-b"), documentId),
                    )

                result.shouldBeInstanceOf<Either.Left<StorageError.FileNotFound>>()
            }
        }
    })
