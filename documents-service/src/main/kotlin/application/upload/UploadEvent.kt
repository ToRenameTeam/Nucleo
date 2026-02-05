package it.nucleo.application.upload

import it.nucleo.domain.DocumentId

/**
 * Represents the different stages of document upload process.
 */
sealed class UploadEvent {
    /** Document received and validation passed */
    data class DocumentReceived(val documentId: DocumentId, val filename: String) : UploadEvent()

    /** AI analysis started */
    data class AnalysisStarted(val documentId: DocumentId) : UploadEvent()

    /** AI analysis completed successfully */
    data class AnalysisCompleted(
        val documentId: DocumentId,
        val summary: String,
        val tags: Set<String>
    ) : UploadEvent()

    /** File storage started */
    data class StorageStarted(val documentId: DocumentId) : UploadEvent()

    /** File successfully stored in MinIO */
    data class StorageCompleted(val documentId: DocumentId) : UploadEvent()

    /** Upload process completed successfully */
    data class UploadCompleted(val documentId: DocumentId) : UploadEvent()

    /** An error occurred during the process */
    data class UploadError(val message: String, val errorCode: String) : UploadEvent()
}

/**
 * SSE event formatter for client consumption
 */
object UploadEventFormatter {
    fun format(event: UploadEvent): String {
        return when (event) {
            is UploadEvent.DocumentReceived ->
                buildEvent(
                    "document-received",
                    mapOf(
                        "documentId" to event.documentId.id,
                        "filename" to event.filename,
                        "message" to "Document received and validated"
                    )
                )
            is UploadEvent.AnalysisStarted ->
                buildEvent(
                    "analysis-started",
                    mapOf(
                        "documentId" to event.documentId.id,
                        "message" to "Analyzing document with AI"
                    )
                )
            is UploadEvent.AnalysisCompleted ->
                buildEvent(
                    "analysis-completed",
                    mapOf(
                        "documentId" to event.documentId.id,
                        "summary" to event.summary,
                        "tags" to event.tags.joinToString(","),
                        "message" to "AI analysis completed"
                    )
                )
            is UploadEvent.StorageStarted ->
                buildEvent(
                    "storage-started",
                    mapOf(
                        "documentId" to event.documentId.id,
                        "message" to "Storing document"
                    )
                )
            is UploadEvent.StorageCompleted ->
                buildEvent(
                    "storage-completed",
                    mapOf(
                        "documentId" to event.documentId.id,
                        "message" to "Document stored successfully"
                    )
                )
            is UploadEvent.UploadCompleted ->
                buildEvent(
                    "upload-completed",
                    mapOf(
                        "documentId" to event.documentId.id,
                        "message" to "Upload completed successfully"
                    )
                )
            is UploadEvent.UploadError ->
                buildEvent(
                    "upload-error",
                    mapOf("message" to event.message, "errorCode" to event.errorCode)
                )
        }
    }

    private fun buildEvent(eventType: String, data: Map<String, String>): String {
        val dataJson = data.entries.joinToString(",") { "\"${it.key}\":\"${it.value}\"" }
        return "event: $eventType\ndata: {$dataJson}\n\n"
    }
}
