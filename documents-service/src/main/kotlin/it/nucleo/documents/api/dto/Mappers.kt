package it.nucleo.documents.api.dto

import it.nucleo.commons.errors.DomainError
import it.nucleo.commons.errors.Either
import it.nucleo.commons.errors.failure
import it.nucleo.commons.errors.getOrElse
import it.nucleo.commons.errors.mapError
import it.nucleo.commons.errors.success
import it.nucleo.documents.domain.*
import it.nucleo.documents.domain.DocumentFactory
import it.nucleo.documents.domain.errors.DocumentError
import it.nucleo.documents.domain.prescription.Validity
import it.nucleo.documents.domain.prescription.implementation.*
import it.nucleo.documents.domain.report.*
import it.nucleo.documents.domain.uploaded.UploadedDocument
import java.time.LocalDate

private fun DomainError.toDocumentError(): DocumentError =
    this as? DocumentError ?: DocumentError.InvalidRequest(message)

fun Document.toResponse(): DocumentResponse =
    when (this) {
        is MedicinePrescription ->
            MedicinePrescriptionResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                validity = validity.toResponse(),
                dosage = dosage.toResponse()
            )
        is ServicePrescription ->
            ServicePrescriptionResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                validity = validity.toResponse(),
                serviceId = serviceId.id,
                facilityId = facilityId.id,
                priority = priority.name
            )
        is Report ->
            ReportResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                servicePrescription =
                    servicePrescription.toResponse() as ServicePrescriptionResponse,
                executionDate = executionDate.date.toString(),
                clinicalQuestion = clinicalQuestion?.text,
                findings = findings.text,
                conclusion = conclusion?.text,
                recommendations = recommendations?.text
            )
        is UploadedDocument ->
            UploadedDocumentResponse(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                metadata = metadata.toDto(),
                filename = filename,
                documentType = documentType.name
            )
        else -> throw IllegalArgumentException("Unknown document type: ${this::class.simpleName}")
    }

fun FileMetadata.toDto(): FileMetadataDto =
    FileMetadataDto(summary = summary.summary, tags = tags.map { it.tag }.toSet())

fun Validity.toResponse(): ValidityResponse =
    when (this) {
        is Validity.UntilDate -> ValidityResponse.UntilDate(date.toString())
        is Validity.UntilExecution -> ValidityResponse.UntilExecution
    }

fun Dosage.toResponse(): DosageResponse =
    DosageResponse(
        medicineId = medicine.id,
        dose = DoseDto(dose.amount, dose.unit.name),
        frequency = FrequencyDto(frequency.timesPerPeriod, frequency.period.name),
        duration = DurationDto(duration.length, duration.unit.name)
    )

fun ValidityRequest.toDomain(): Either<DocumentError, Validity> =
    when (this) {
        is ValidityRequest.UntilDate -> success(Validity.UntilDate(LocalDate.parse(date)))
        is ValidityRequest.UntilExecution -> success(Validity.UntilExecution)
    }

fun DosageRequest.toDomain(): Either<DocumentError, Dosage> {
    val medicine =
        MedicineId(medicineId).getOrElse {
            return failure(it.toDocumentError())
        }
    val domainDose =
        Dose(dose.amount, DoseUnit.valueOf(dose.unit)).getOrElse {
            return failure(it.toDocumentError())
        }
    val domainFrequency =
        Frequency(frequency.timesPerPeriod, Period.valueOf(frequency.period)).getOrElse {
            return failure(it.toDocumentError())
        }
    val domainDuration =
        Duration(duration.length, Period.valueOf(duration.unit)).getOrElse {
            return failure(it.toDocumentError())
        }

    return Dosage(
            medicine = medicine,
            dose = domainDose,
            frequency = domainFrequency,
            duration = domainDuration
        )
        .mapError { it.toDocumentError() }
}

fun FileMetadataDto.toDomain(): Either<DocumentError, FileMetadata> {
    val summary =
        Summary(summary).getOrElse {
            return failure(it.toDocumentError())
        }
    val tags =
        tags
            .map {
                Tag(it).getOrElse { error ->
                    return failure(error.toDocumentError())
                }
            }
            .toSet()

    return FileMetadata(summary = summary, tags = tags).mapError { it.toDocumentError() }
}

suspend fun CreateDocumentRequest.toDomain(
    patientId: PatientId,
    documentId: DocumentId,
    resolveServicePrescription:
        (suspend (DocumentId) -> Either<DocumentError, ServicePrescription>)? =
        null,
): Either<DocumentError, Document> {
    val doctorId =
        DoctorId(this.doctorId).getOrElse {
            return failure(it.toDocumentError())
        }
    val title =
        Title(this.title).getOrElse {
            return failure(it.toDocumentError())
        }
    val metadata =
        this.metadata.toDomain().getOrElse {
            return failure(it)
        }

    return when (this) {
        is CreateMedicinePrescriptionRequest -> {
            val validity =
                validity.toDomain().getOrElse {
                    return failure(it)
                }
            val dosage =
                dosage.toDomain().getOrElse {
                    return failure(it)
                }

            DocumentFactory.createMedicinePrescription(
                    id = documentId,
                    doctorId = doctorId,
                    patientId = patientId,
                    title = title,
                    metadata = metadata,
                    validity = validity,
                    dosage = dosage
                )
                .mapError { it.toDocumentError() }
        }
        is CreateServicePrescriptionRequest -> {
            val validity =
                validity.toDomain().getOrElse {
                    return failure(it)
                }
            val serviceId =
                ServiceId(serviceId).getOrElse {
                    return failure(it.toDocumentError())
                }
            val facilityId =
                FacilityId(facilityId).getOrElse {
                    return failure(it.toDocumentError())
                }

            DocumentFactory.createServicePrescription(
                    id = documentId,
                    doctorId = doctorId,
                    patientId = patientId,
                    title = title,
                    metadata = metadata,
                    validity = validity,
                    serviceId = serviceId,
                    facilityId = facilityId,
                    priority = Priority.valueOf(priority)
                )
                .mapError { it.toDocumentError() }
        }
        is CreateReportRequest -> {
            val prescriptionId =
                DocumentId(servicePrescriptionId).getOrElse {
                    return failure(it.toDocumentError())
                }
            val servicePrescription =
                resolveServicePrescription?.invoke(prescriptionId)
                    ?: return failure(
                        DocumentError.InvalidRequest("Service prescription resolver not provided")
                    )

            when (servicePrescription) {
                is Either.Left -> failure(servicePrescription.error)
                is Either.Right -> {
                    val executionDate =
                        ExecutionDate(LocalDate.parse(executionDate)).getOrElse {
                            return failure(it.toDocumentError())
                        }
                    val findings =
                        Findings(findings).getOrElse {
                            return failure(it.toDocumentError())
                        }
                    val clinicalQuestion =
                        clinicalQuestion?.let {
                            ClinicalQuestion(it).getOrElse { err ->
                                return failure(err.toDocumentError())
                            }
                        }
                    val conclusion =
                        conclusion?.let {
                            Conclusion(it).getOrElse { err ->
                                return failure(err.toDocumentError())
                            }
                        }
                    val recommendations =
                        recommendations?.let {
                            Recommendations(it).getOrElse { err ->
                                return failure(err.toDocumentError())
                            }
                        }

                    DocumentFactory.createReport(
                            id = documentId,
                            doctorId = doctorId,
                            patientId = patientId,
                            title = title,
                            metadata = metadata,
                            servicePrescription = servicePrescription.value,
                            executionDate = executionDate,
                            findings = findings,
                            clinicalQuestion = clinicalQuestion,
                            conclusion = conclusion,
                            recommendations = recommendations
                        )
                        .mapError { it.toDocumentError() }
                }
            }
        }
    }
}
