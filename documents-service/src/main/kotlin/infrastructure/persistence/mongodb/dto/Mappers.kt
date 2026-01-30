package it.nucleo.infrastructure.persistence.mongodb.dto

import it.nucleo.domain.DoctorId
import it.nucleo.domain.Document
import it.nucleo.domain.DocumentId
import it.nucleo.domain.FileMetadata
import it.nucleo.domain.FileURI
import it.nucleo.domain.IssueDate
import it.nucleo.domain.PatientId
import it.nucleo.domain.Summary
import it.nucleo.domain.Tag
import it.nucleo.domain.prescription.Validity
import it.nucleo.domain.prescription.implementation.Dosage
import it.nucleo.domain.prescription.implementation.Dose
import it.nucleo.domain.prescription.implementation.DoseUnit
import it.nucleo.domain.prescription.implementation.Duration
import it.nucleo.domain.prescription.implementation.FacilityId
import it.nucleo.domain.prescription.implementation.Frequency
import it.nucleo.domain.prescription.implementation.MedicineId
import it.nucleo.domain.prescription.implementation.MedicinePrescription
import it.nucleo.domain.prescription.implementation.Period
import it.nucleo.domain.prescription.implementation.Priority
import it.nucleo.domain.prescription.implementation.ServiceId
import it.nucleo.domain.prescription.implementation.ServicePrescription
import it.nucleo.domain.report.ClinicalQuestion
import it.nucleo.domain.report.Conclusion
import it.nucleo.domain.report.ExecutionDate
import it.nucleo.domain.report.Findings
import it.nucleo.domain.report.Recommendations
import it.nucleo.domain.report.Report
import it.nucleo.domain.report.implementation.DefaultReport
import java.time.LocalDate

fun Document.toDto(): DocumentDto =
    when (this) {
        is MedicinePrescription ->
            MedicinePrescriptionDto(
                id = id.id,
                doctorId = doctorId.id,
                patientId = patientId.id,
                issueDate = issueDate.date.toString(),
                fileUri = metadata.fileURI.uri,
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
                fileUri = metadata.fileURI.uri,
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
                fileUri = metadata.fileURI.uri,
                summary = metadata.summary.summary,
                tags = metadata.tags.map { it.tag }.toSet(),
                servicePrescription = servicePrescription.toDto() as ServicePrescriptionDto,
                executionDate = executionDate.date.toString(),
                clinicalQuestion = clinicalQuestion?.text,
                findings = findings.text,
                conclusion = conclusion?.text,
                recommendations = recommendations?.text
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
                id = DocumentId(id),
                doctorId = DoctorId(doctorId),
                patientId = PatientId(patientId),
                issueDate = IssueDate(LocalDate.parse(issueDate)),
                metadata =
                    FileMetadata(
                        fileURI = FileURI(fileUri),
                        summary = Summary(summary),
                        tags = tags.map { Tag(it) }.toSet()
                    ),
                validity = validity.toDomain(),
                dosage = dosage.toDomain()
            )
        is ServicePrescriptionDto ->
            ServicePrescription(
                id = DocumentId(id),
                doctorId = DoctorId(doctorId),
                patientId = PatientId(patientId),
                issueDate = IssueDate(LocalDate.parse(issueDate)),
                metadata =
                    FileMetadata(
                        fileURI = FileURI(fileUri),
                        summary = Summary(summary),
                        tags = tags.map { Tag(it) }.toSet()
                    ),
                validity = validity.toDomain(),
                serviceId = ServiceId(serviceId),
                facilityId = FacilityId(facilityId),
                priority = Priority.valueOf(priority)
            )
        is ReportDto ->
            DefaultReport(
                id = DocumentId(id),
                doctorId = DoctorId(doctorId),
                patientId = PatientId(patientId),
                issueDate = IssueDate(LocalDate.parse(issueDate)),
                metadata =
                    FileMetadata(
                        fileURI = FileURI(fileUri),
                        summary = Summary(summary),
                        tags = tags.map { Tag(it) }.toSet()
                    ),
                servicePrescription = servicePrescription.toDomain() as ServicePrescription,
                executionDate = ExecutionDate(LocalDate.parse(executionDate)),
                clinicalQuestion = clinicalQuestion?.let { ClinicalQuestion(it) },
                findings = Findings(findings),
                conclusion = conclusion?.let { Conclusion(it) },
                recommendations = recommendations?.let { Recommendations(it) }
            )
    }

fun ValidityDto.toDomain(): Validity =
    when (this) {
        is ValidityDto.UntilDate -> Validity.UntilDate(LocalDate.parse(date))
        is ValidityDto.UntilExecution -> Validity.UntilExecution
    }

fun DosageDto.toDomain(): Dosage =
    Dosage(
        medicine = MedicineId(medicineId),
        dose = Dose(doseAmount, DoseUnit.valueOf(doseUnit)),
        frequency = Frequency(frequencyTimesPerPeriod, Period.valueOf(frequencyPeriod)),
        duration = Duration(durationLength, Period.valueOf(durationUnit))
    )
