package it.nucleo.documents.infrastructure.persistence.mongodb.dto

import it.nucleo.commons.errors.getOrElse
import it.nucleo.documents.domain.DoctorId
import it.nucleo.documents.domain.Document
import it.nucleo.documents.domain.DocumentId
import it.nucleo.documents.domain.FileMetadata
import it.nucleo.documents.domain.IssueDate
import it.nucleo.documents.domain.PatientId
import it.nucleo.documents.domain.Summary
import it.nucleo.documents.domain.Tag
import it.nucleo.documents.domain.Title
import it.nucleo.documents.domain.prescription.Validity
import it.nucleo.documents.domain.prescription.implementation.Dosage
import it.nucleo.documents.domain.prescription.implementation.Dose
import it.nucleo.documents.domain.prescription.implementation.DoseUnit
import it.nucleo.documents.domain.prescription.implementation.Duration
import it.nucleo.documents.domain.prescription.implementation.FacilityId
import it.nucleo.documents.domain.prescription.implementation.Frequency
import it.nucleo.documents.domain.prescription.implementation.MedicineId
import it.nucleo.documents.domain.prescription.implementation.MedicinePrescription
import it.nucleo.documents.domain.prescription.implementation.Period
import it.nucleo.documents.domain.prescription.implementation.Priority
import it.nucleo.documents.domain.prescription.implementation.ServiceId
import it.nucleo.documents.domain.prescription.implementation.ServicePrescription
import it.nucleo.documents.domain.report.ClinicalQuestion
import it.nucleo.documents.domain.report.Conclusion
import it.nucleo.documents.domain.report.ExecutionDate
import it.nucleo.documents.domain.report.Findings
import it.nucleo.documents.domain.report.Recommendations
import it.nucleo.documents.domain.report.Report
import it.nucleo.documents.domain.report.implementation.DefaultReport
import it.nucleo.documents.domain.uploaded.UploadedDocument
import it.nucleo.documents.domain.uploaded.UploadedDocumentType
import java.time.LocalDate

fun Document.toDto(): DocumentDto =
    when (this) {
        is MedicinePrescription ->
            MedicinePrescriptionDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                validity = validity.toDto(),
                dosage = dosage.toDto()
            )
        is ServicePrescription ->
            ServicePrescriptionDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                validity = validity.toDto(),
                serviceId = serviceId.id,
                facilityId = facilityId.id,
                priority = priority.name
            )
        is Report ->
            ReportDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                servicePrescription = servicePrescription.toDto() as ServicePrescriptionDto,
                executionDate = executionDate.date.toString(),
                clinicalQuestion = clinicalQuestion?.text,
                findings = findings.text,
                conclusion = conclusion?.text,
                recommendations = recommendations?.text
            )
        is UploadedDocument ->
            UploadedDocumentDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                title = title.value,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                filename = filename,
                documentType = documentType.name
            )
        else -> throw IllegalArgumentException("Unknown document type: ${this::class.simpleName}")
    }

fun Validity.toDto(): ValidityDto =
    when (this) {
        is Validity.UntilDate -> ValidityDto.UntilDate(date.toString())
        is Validity.UntilExecution -> ValidityDto.UntilExecution
    }

fun Dosage.toDto(): DosageDto =
    DosageDto(
        medicineId = medicine.id,
        doseAmount = dose.amount,
        doseUnit = dose.unit.name,
        frequencyTimesPerPeriod = frequency.timesPerPeriod,
        frequencyPeriod = frequency.period.name,
        durationLength = duration.length,
        durationUnit = duration.unit.name
    )

fun DocumentDto.toDomain(): Document =
    when (this) {
        is MedicinePrescriptionDto ->
            MedicinePrescription(
                id =
                    DocumentId(id).getOrElse {
                        throw IllegalStateException("Invalid stored document id: ${it.message}")
                    },
                doctorId =
                    DoctorId(doctorId).getOrElse {
                        throw IllegalStateException("Invalid stored doctor id: ${it.message}")
                    },
                patientId =
                    PatientId(patientId).getOrElse {
                        throw IllegalStateException("Invalid stored patient id: ${it.message}")
                    },
                issueDate =
                    IssueDate(LocalDate.parse(issueDate)).getOrElse {
                        throw IllegalStateException("Invalid stored issue date: ${it.message}")
                    },
                title =
                    Title(title).getOrElse {
                        throw IllegalStateException("Invalid stored title: ${it.message}")
                    },
                metadata =
                    FileMetadata(
                            summary =
                                Summary(summary).getOrElse {
                                    throw IllegalStateException(
                                        "Invalid stored summary: ${it.message}"
                                    )
                                },
                            tags =
                                tags
                                    .map { rawTag ->
                                        Tag(rawTag).getOrElse { error ->
                                            throw IllegalStateException(
                                                "Invalid stored tag '$rawTag': ${error.message}"
                                            )
                                        }
                                    }
                                    .toSet(),
                        )
                        .getOrElse {
                            throw IllegalStateException("Invalid stored metadata: ${it.message}")
                        },
                validity = validity.toDomain(),
                dosage = dosage.toDomain()
            )
        is ServicePrescriptionDto ->
            ServicePrescription(
                id =
                    DocumentId(id).getOrElse {
                        throw IllegalStateException("Invalid stored document id: ${it.message}")
                    },
                doctorId =
                    DoctorId(doctorId).getOrElse {
                        throw IllegalStateException("Invalid stored doctor id: ${it.message}")
                    },
                patientId =
                    PatientId(patientId).getOrElse {
                        throw IllegalStateException("Invalid stored patient id: ${it.message}")
                    },
                issueDate =
                    IssueDate(LocalDate.parse(issueDate)).getOrElse {
                        throw IllegalStateException("Invalid stored issue date: ${it.message}")
                    },
                title =
                    Title(title).getOrElse {
                        throw IllegalStateException("Invalid stored title: ${it.message}")
                    },
                metadata =
                    FileMetadata(
                            summary =
                                Summary(summary).getOrElse {
                                    throw IllegalStateException(
                                        "Invalid stored summary: ${it.message}"
                                    )
                                },
                            tags =
                                tags
                                    .map { rawTag ->
                                        Tag(rawTag).getOrElse { error ->
                                            throw IllegalStateException(
                                                "Invalid stored tag '$rawTag': ${error.message}"
                                            )
                                        }
                                    }
                                    .toSet(),
                        )
                        .getOrElse {
                            throw IllegalStateException("Invalid stored metadata: ${it.message}")
                        },
                validity = validity.toDomain(),
                serviceId =
                    ServiceId(serviceId).getOrElse {
                        throw IllegalStateException("Invalid stored service id: ${it.message}")
                    },
                facilityId =
                    FacilityId(facilityId).getOrElse {
                        throw IllegalStateException("Invalid stored facility id: ${it.message}")
                    },
                priority = Priority.valueOf(priority)
            )
        is ReportDto ->
            DefaultReport(
                id =
                    DocumentId(id).getOrElse {
                        throw IllegalStateException("Invalid stored document id: ${it.message}")
                    },
                doctorId =
                    DoctorId(doctorId).getOrElse {
                        throw IllegalStateException("Invalid stored doctor id: ${it.message}")
                    },
                patientId =
                    PatientId(patientId).getOrElse {
                        throw IllegalStateException("Invalid stored patient id: ${it.message}")
                    },
                issueDate =
                    IssueDate(LocalDate.parse(issueDate)).getOrElse {
                        throw IllegalStateException("Invalid stored issue date: ${it.message}")
                    },
                title =
                    Title(title).getOrElse {
                        throw IllegalStateException("Invalid stored title: ${it.message}")
                    },
                metadata =
                    FileMetadata(
                            summary =
                                Summary(summary).getOrElse {
                                    throw IllegalStateException(
                                        "Invalid stored summary: ${it.message}"
                                    )
                                },
                            tags =
                                tags
                                    .map { rawTag ->
                                        Tag(rawTag).getOrElse { error ->
                                            throw IllegalStateException(
                                                "Invalid stored tag '$rawTag': ${error.message}"
                                            )
                                        }
                                    }
                                    .toSet(),
                        )
                        .getOrElse {
                            throw IllegalStateException("Invalid stored metadata: ${it.message}")
                        },
                servicePrescription = servicePrescription.toDomain() as ServicePrescription,
                executionDate =
                    ExecutionDate(LocalDate.parse(executionDate)).getOrElse {
                        throw IllegalStateException("Invalid stored execution date: ${it.message}")
                    },
                clinicalQuestion =
                    clinicalQuestion?.let {
                        ClinicalQuestion(it).getOrElse { err ->
                            throw IllegalStateException(
                                "Invalid stored clinical question: ${err.message}"
                            )
                        }
                    },
                findings =
                    Findings(findings).getOrElse {
                        throw IllegalStateException("Invalid stored findings: ${it.message}")
                    },
                conclusion =
                    conclusion?.let {
                        Conclusion(it).getOrElse { err ->
                            throw IllegalStateException("Invalid stored conclusion: ${err.message}")
                        }
                    },
                recommendations =
                    recommendations?.let {
                        Recommendations(it).getOrElse { err ->
                            throw IllegalStateException(
                                "Invalid stored recommendations: ${err.message}"
                            )
                        }
                    }
            )
        is UploadedDocumentDto ->
            UploadedDocument(
                id =
                    DocumentId(id).getOrElse {
                        throw IllegalStateException("Invalid stored document id: ${it.message}")
                    },
                doctorId =
                    DoctorId(doctorId).getOrElse {
                        throw IllegalStateException("Invalid stored doctor id: ${it.message}")
                    },
                patientId =
                    PatientId(patientId).getOrElse {
                        throw IllegalStateException("Invalid stored patient id: ${it.message}")
                    },
                issueDate =
                    IssueDate(LocalDate.parse(issueDate)).getOrElse {
                        throw IllegalStateException("Invalid stored issue date: ${it.message}")
                    },
                title =
                    Title(title).getOrElse {
                        throw IllegalStateException("Invalid stored title: ${it.message}")
                    },
                metadata =
                    FileMetadata(
                            summary =
                                Summary(summary).getOrElse {
                                    throw IllegalStateException(
                                        "Invalid stored summary: ${it.message}"
                                    )
                                },
                            tags =
                                tags
                                    .map { rawTag ->
                                        Tag(rawTag).getOrElse { error ->
                                            throw IllegalStateException(
                                                "Invalid stored tag '$rawTag': ${error.message}"
                                            )
                                        }
                                    }
                                    .toSet(),
                        )
                        .getOrElse {
                            throw IllegalStateException("Invalid stored metadata: ${it.message}")
                        },
                filename = filename,
                documentType = UploadedDocumentType.valueOf(documentType)
            )
    }

fun ValidityDto.toDomain(): Validity =
    when (this) {
        is ValidityDto.UntilDate -> Validity.UntilDate(LocalDate.parse(date))
        is ValidityDto.UntilExecution -> Validity.UntilExecution
    }

fun DosageDto.toDomain(): Dosage {
    val medicine =
        MedicineId(medicineId).getOrElse {
            throw IllegalStateException("Invalid stored medicine id: ${it.message}")
        }
    val dose =
        Dose(doseAmount, DoseUnit.valueOf(doseUnit)).getOrElse {
            throw IllegalStateException("Invalid stored dose: ${it.message}")
        }
    val frequency =
        Frequency(frequencyTimesPerPeriod, Period.valueOf(frequencyPeriod)).getOrElse {
            throw IllegalStateException("Invalid stored frequency: ${it.message}")
        }
    val duration =
        Duration(durationLength, Period.valueOf(durationUnit)).getOrElse {
            throw IllegalStateException("Invalid stored duration: ${it.message}")
        }

    return Dosage(medicine = medicine, dose = dose, frequency = frequency, duration = duration)
        .getOrElse { throw IllegalStateException("Invalid stored dosage: ${it.message}") }
}
