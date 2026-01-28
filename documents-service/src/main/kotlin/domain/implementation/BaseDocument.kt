package it.nucleo.domain.implementation

import java.time.LocalDate

@JvmInline value class DocumentId(val id: String)

@JvmInline value class Patient(val id: String)

@JvmInline value class Doctor(val id: String)

@JvmInline value class Facility(val id: String)

@JvmInline value class IssueDate(val date: LocalDate)

@JvmInline value class FileURI(val uri: String)

@JvmInline value class Summary(val summary: String)

@JvmInline value class Tag(val tag: String)

typealias Tags = Set<Tag>
