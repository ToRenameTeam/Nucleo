package it.nucleo.documents.application

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.errors.*
import it.nucleo.documents.domain.prescription.implementation.ServicePrescription
import it.nucleo.documents.domain.report.Conclusion
import it.nucleo.documents.domain.report.Findings
import it.nucleo.documents.domain.report.Recommendations
import it.nucleo.documents.domain.report.Report
import it.nucleo.documents.fixtures.DocumentFixtures
import it.nucleo.documents.fixtures.FakeDocumentRepository
import it.nucleo.documents.fixtures.FakeFileStorageRepository

class DocumentServiceTest :
    DescribeSpec({
        fun createService(
            documentRepo: DocumentRepository = FakeDocumentRepository(),
            fileStorageRepo: FileStorageRepository = FakeFileStorageRepository(),
        ) =
            DocumentService(
                repository = documentRepo,
                fileStorageRepository = fileStorageRepo,
                pdfGenerator = DocumentPdfGenerator(),
                aiServiceClient = null,
            )

        describe("getAllDocumentsByPatient") {
            it("should return an empty list when the patient has no documents") {
                val service = createService()

                val result = service.getAllDocumentsByPatient(PatientId("unknown"))

                result.shouldBeInstanceOf<Either.Right<List<Document>>>()
                result.value shouldBe emptyList()
            }

            it("should return all documents belonging to the patient") {
                val repo = FakeDocumentRepository()
                val service = createService(documentRepo = repo)
                val prescription = DocumentFixtures.medicinePrescription()
                repo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), prescription)

                val result =
                    service.getAllDocumentsByPatient(PatientId(DocumentFixtures.PATIENT_ID))

                result.shouldBeInstanceOf<Either.Right<List<Document>>>()
                result.value.size shouldBe 1
                result.value.first().id.id shouldBe DocumentFixtures.DOCUMENT_ID
            }
        }

        describe("getDocumentById") {
            it("should return the document when it exists") {
                val repo = FakeDocumentRepository()
                val service = createService(documentRepo = repo)
                val prescription = DocumentFixtures.medicinePrescription()
                repo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), prescription)

                val result =
                    service.getDocumentById(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.DOCUMENT_ID),
                    )

                result.shouldBeInstanceOf<Either.Right<Document>>()
                result.value.id.id shouldBe DocumentFixtures.DOCUMENT_ID
            }

            it("should return NotFound when the document does not exist") {
                val service = createService()

                val result =
                    service.getDocumentById(
                        PatientId("unknown-patient"),
                        DocumentId("unknown-doc"),
                    )

                result.shouldBeInstanceOf<Either.Left<DocumentError.NotFound>>()
            }
        }

        describe("getServicePrescription") {
            it("should return the service prescription when it exists") {
                val repo = FakeDocumentRepository()
                val service = createService(documentRepo = repo)
                val sp = DocumentFixtures.servicePrescription()
                repo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), sp)

                val result =
                    service.getServicePrescription(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.SERVICE_PRESCRIPTION_ID),
                    )

                result.shouldBeInstanceOf<Either.Right<ServicePrescription>>()
                result.value.id.id shouldBe DocumentFixtures.SERVICE_PRESCRIPTION_ID
            }

            it("should return NotFound when the document does not exist") {
                val service = createService()

                val result =
                    service.getServicePrescription(
                        PatientId("unknown"),
                        DocumentId("unknown"),
                    )

                result.shouldBeInstanceOf<Either.Left<DocumentError>>()
            }

            it("should return InvalidType when the document is not a service prescription") {
                val repo = FakeDocumentRepository()
                val service = createService(documentRepo = repo)
                val mp = DocumentFixtures.medicinePrescription()
                repo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), mp)

                val result =
                    service.getServicePrescription(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.DOCUMENT_ID),
                    )

                result.shouldBeInstanceOf<Either.Left<DocumentError.InvalidType>>()
            }
        }

        describe("createDocument") {
            it("should persist the document and generate a PDF") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                val service = createService(documentRepo = docRepo, fileStorageRepo = fileRepo)

                val prescription = DocumentFixtures.medicinePrescription()
                val result = service.createDocument(prescription)

                result.shouldBeInstanceOf<Either.Right<Document>>()
                result.value.id.id shouldBe DocumentFixtures.DOCUMENT_ID

                // Verify the document was persisted
                val stored =
                    docRepo.findDocumentById(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.DOCUMENT_ID),
                    )
                stored.shouldBeInstanceOf<Either.Right<Document>>()

                // Verify the PDF was stored
                val pdf =
                    fileRepo.retrieve(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.DOCUMENT_ID),
                    )
                pdf.shouldBeInstanceOf<Either.Right<StoredFile>>()
            }

            it("should create a report linked to an existing service prescription") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                val service = createService(documentRepo = docRepo, fileStorageRepo = fileRepo)

                val sp = DocumentFixtures.servicePrescription()
                docRepo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), sp)

                val report = DocumentFixtures.report(servicePrescription = sp)
                val result = service.createDocument(report)

                result.shouldBeInstanceOf<Either.Right<Document>>()
                (result.value as Report).servicePrescription.id.id shouldBe
                    DocumentFixtures.SERVICE_PRESCRIPTION_ID
            }
        }

        describe("deleteDocument") {
            it("should delete an existing document") {
                val repo = FakeDocumentRepository()
                val service = createService(documentRepo = repo)
                val prescription = DocumentFixtures.medicinePrescription()
                repo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), prescription)

                val result =
                    service.deleteDocument(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.DOCUMENT_ID),
                    )

                result.shouldBeInstanceOf<Either.Right<Unit>>()

                // Verify it is gone
                val lookup =
                    repo.findDocumentById(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.DOCUMENT_ID),
                    )
                lookup.shouldBeInstanceOf<Either.Left<DocumentError.NotFound>>()
            }

            it("should return NotFound when the document does not exist") {
                val service = createService()

                val result =
                    service.deleteDocument(
                        PatientId("unknown"),
                        DocumentId("unknown"),
                    )

                result.shouldBeInstanceOf<Either.Left<DocumentError.NotFound>>()
            }
        }

        describe("updateReport") {
            it("should update the editable fields of a report") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                val service = createService(documentRepo = docRepo, fileStorageRepo = fileRepo)

                val sp = DocumentFixtures.servicePrescription()
                val report = DocumentFixtures.report(servicePrescription = sp)
                docRepo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), sp)
                docRepo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), report)

                // Also store a fake PDF so regeneration succeeds
                fileRepo.store(
                    PatientId(DocumentFixtures.PATIENT_ID),
                    DocumentId(DocumentFixtures.REPORT_ID),
                    "report.pdf",
                    ByteArray(0).inputStream(),
                    0,
                    "application/pdf",
                )

                val command =
                    UpdateReportCommand(
                        findings = Findings("Updated findings"),
                        conclusion = Conclusion("New conclusion"),
                    )

                val result =
                    service.updateReport(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.REPORT_ID),
                        command,
                    )

                result.shouldBeInstanceOf<Either.Right<Report>>()
                result.value.findings.text shouldBe "Updated findings"
                result.value.conclusion?.text shouldBe "New conclusion"
                // Unchanged field
                result.value.recommendations?.text shouldBe "Repeat in 12 months"
            }

            it("should return NotFound when the document does not exist") {
                val service = createService()

                val command = UpdateReportCommand(findings = Findings("New findings"))
                val result =
                    service.updateReport(
                        PatientId("unknown"),
                        DocumentId("unknown"),
                        command,
                    )

                result.shouldBeInstanceOf<Either.Left<DomainError>>()
            }

            it("should return InvalidType when the document is not a report") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                val service = createService(documentRepo = docRepo, fileStorageRepo = fileRepo)

                val prescription = DocumentFixtures.medicinePrescription()
                docRepo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), prescription)

                val command = UpdateReportCommand(findings = Findings("New findings"))
                val result =
                    service.updateReport(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.DOCUMENT_ID),
                        command,
                    )

                result.shouldBeInstanceOf<Either.Left<DocumentError.InvalidType>>()
            }

            it("should allow partial updates keeping existing values") {
                val docRepo = FakeDocumentRepository()
                val fileRepo = FakeFileStorageRepository()
                val service = createService(documentRepo = docRepo, fileStorageRepo = fileRepo)

                val sp = DocumentFixtures.servicePrescription()
                val report = DocumentFixtures.report(servicePrescription = sp)
                docRepo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), sp)
                docRepo.addDocument(PatientId(DocumentFixtures.PATIENT_ID), report)

                val command =
                    UpdateReportCommand(
                        recommendations = Recommendations("Updated recommendations only"),
                    )

                val result =
                    service.updateReport(
                        PatientId(DocumentFixtures.PATIENT_ID),
                        DocumentId(DocumentFixtures.REPORT_ID),
                        command,
                    )

                result.shouldBeInstanceOf<Either.Right<Report>>()
                result.value.findings.text shouldBe "All values within normal range"
                result.value.conclusion?.text shouldBe "No abnormalities detected"
                result.value.recommendations?.text shouldBe "Updated recommendations only"
            }
        }
    })
