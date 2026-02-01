package it.nucleo.infrastructure.ai

import it.nucleo.domain.FileMetadata
import it.nucleo.domain.Summary
import it.nucleo.domain.Tag
import it.nucleo.infrastructure.logging.logger
import java.io.Closeable
import java.net.HttpURLConnection
import java.net.URI
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

sealed class AiAnalysisResult {

    data class Success(val metadata: FileMetadata) : AiAnalysisResult()

    data class Failure(val errorCode: AiErrorCode, val message: String) : AiAnalysisResult()
}

enum class AiErrorCode {
    DOCUMENT_NOT_FOUND,
    PDF_EXTRACTION_FAILED,
    AI_GENERATION_FAILED,
    CONNECTION_FAILED,
    INVALID_REQUEST,
    INTERNAL_ERROR,
    UNKNOWN
}

class AiServiceClient(host: String, port: Int, private val timeoutMs: Int = 120_000) : Closeable {

    private val logger = logger()
    private val json = Json { ignoreUnknownKeys = true }
    private val baseUrl = "http://$host:$port"

    init {
        logger.info("AI Service HTTP client configured for: $baseUrl")
    }

    suspend fun analyzeDocument(patientId: String, documentId: String): AiAnalysisResult {
        logger.debug("Requesting AI analysis for document: $documentId, patient: $patientId")

        return withContext(Dispatchers.IO) {
            try {
                val url = URI("$baseUrl/analyze").toURL()
                val connection = url.openConnection() as HttpURLConnection

                try {
                    connection.requestMethod = "POST"
                    connection.setRequestProperty("Content-Type", "application/json")
                    connection.setRequestProperty("Accept", "application/json")
                    connection.connectTimeout = timeoutMs
                    connection.readTimeout = timeoutMs
                    connection.doOutput = true

                    // Send request
                    val requestBody =
                        """{"document_id": "$documentId", "patient_id": "$patientId"}"""
                    connection.outputStream.use { os ->
                        os.write(requestBody.toByteArray(Charsets.UTF_8))
                    }

                    val responseCode = connection.responseCode

                    if (responseCode == 200) {
                        val responseBody = connection.inputStream.bufferedReader().readText()
                        parseSuccessResponse(responseBody, documentId)
                    } else {
                        val errorBody =
                            connection.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
                        logger.warn(
                            "AI analysis failed for document $documentId: HTTP $responseCode - $errorBody"
                        )
                        AiAnalysisResult.Failure(
                            mapHttpErrorCode(responseCode),
                            "AI analysis failed: HTTP $responseCode"
                        )
                    }
                } finally {
                    connection.disconnect()
                }
            } catch (e: java.net.ConnectException) {
                logger.error("Failed to connect to AI service for document $documentId", e)
                AiAnalysisResult.Failure(
                    AiErrorCode.CONNECTION_FAILED,
                    "Failed to connect to AI service: ${e.message}"
                )
            } catch (e: java.net.SocketTimeoutException) {
                logger.error("AI service timeout for document $documentId", e)
                AiAnalysisResult.Failure(
                    AiErrorCode.CONNECTION_FAILED,
                    "AI service request timed out"
                )
            } catch (e: Exception) {
                logger.error("Unexpected error during AI analysis for document $documentId", e)
                AiAnalysisResult.Failure(
                    AiErrorCode.INTERNAL_ERROR,
                    "Unexpected error: ${e.message}"
                )
            }
        }
    }

    private fun parseSuccessResponse(responseBody: String, documentId: String): AiAnalysisResult {
        return try {
            val response = json.decodeFromString<AiAnalysisResponse>(responseBody)

            if (response.success) {
                val metadata =
                    FileMetadata(
                        summary = Summary(response.summary),
                        tags = response.tags.map { Tag(it) }.toSet()
                    )
                logger.info(
                    "AI analysis successful for document $documentId: " +
                        "summary_length=${response.summary.length}, tags_count=${response.tags.size}"
                )
                AiAnalysisResult.Success(metadata)
            } else {
                logger.warn(
                    "AI analysis returned failure for document $documentId: ${response.errorMessage}"
                )
                AiAnalysisResult.Failure(
                    mapErrorCode(response.errorCode),
                    response.errorMessage ?: "Unknown error"
                )
            }
        } catch (e: Exception) {
            logger.error("Failed to parse AI response for document $documentId", e)
            AiAnalysisResult.Failure(
                AiErrorCode.INTERNAL_ERROR,
                "Failed to parse AI response: ${e.message}"
            )
        }
    }

    private fun mapHttpErrorCode(httpCode: Int): AiErrorCode {
        return when (httpCode) {
            404 -> AiErrorCode.DOCUMENT_NOT_FOUND
            400 -> AiErrorCode.INVALID_REQUEST
            503 -> AiErrorCode.CONNECTION_FAILED
            else -> AiErrorCode.INTERNAL_ERROR
        }
    }

    private fun mapErrorCode(errorCode: String?): AiErrorCode {
        return when (errorCode) {
            "DOCUMENT_NOT_FOUND" -> AiErrorCode.DOCUMENT_NOT_FOUND
            "PDF_EXTRACTION_FAILED" -> AiErrorCode.PDF_EXTRACTION_FAILED
            "AI_GENERATION_FAILED" -> AiErrorCode.AI_GENERATION_FAILED
            "MINIO_CONNECTION_FAILED" -> AiErrorCode.CONNECTION_FAILED
            "INVALID_REQUEST" -> AiErrorCode.INVALID_REQUEST
            "INTERNAL_ERROR" -> AiErrorCode.INTERNAL_ERROR
            else -> AiErrorCode.UNKNOWN
        }
    }

    override fun close() {
        logger.info("AI service HTTP client closed")
    }

    companion object {
        object Defaults {
            const val HOST = "localhost"
            const val PORT = 8000
        }
    }
}

@Serializable
private data class AiAnalysisResponse(
    val success: Boolean,
    val summary: String = "",
    val tags: List<String> = emptyList(),
    val errorMessage: String? = null,
    val errorCode: String? = null
)
