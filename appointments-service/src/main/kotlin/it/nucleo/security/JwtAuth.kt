package it.nucleo.security

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.call
import io.ktor.server.request.header
import io.ktor.server.request.httpMethod
import io.ktor.server.request.path
import io.ktor.server.response.respond
import it.nucleo.commons.api.ErrorResponse
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

private const val JWT_ISSUER = "nucleo-users-service"
private const val BEARER_TOKEN_PARTS = 2
private const val JWT_PARTS = 3
private const val EPOCH_SECONDS_DIVISOR = 1000

@Serializable
data class JwtClaims(
    val userId: String,
    val fiscalCode: String,
    val activeProfile: String,
    val iat: Long,
    val exp: Long,
    val iss: String,
)

private val json = Json { ignoreUnknownKeys = true }

private fun base64UrlDecode(input: String): String {
    return String(java.util.Base64.getUrlDecoder().decode(input), StandardCharsets.UTF_8)
}

private fun signHmacSha256(data: String, secret: String): String {
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(SecretKeySpec(secret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256"))
    return java.util.Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(mac.doFinal(data.toByteArray(StandardCharsets.UTF_8)))
}

private fun timingSafeEqual(left: String, right: String): Boolean {
    val leftBytes = left.toByteArray(StandardCharsets.UTF_8)
    val rightBytes = right.toByteArray(StandardCharsets.UTF_8)
    if (leftBytes.size != rightBytes.size) return false
    return MessageDigest.isEqual(leftBytes, rightBytes)
}

private fun extractBearerToken(authorizationHeader: String?): String? {
    if (authorizationHeader.isNullOrBlank()) return null
    val parts = authorizationHeader.split(" ", limit = BEARER_TOKEN_PARTS)
    if (parts.size != BEARER_TOKEN_PARTS || parts[0] != "Bearer") return null
    return parts[1].trim().takeIf { it.isNotEmpty() }
}

private fun verifyAccessToken(token: String): JwtClaims {
    val parts = token.split('.')
    if (parts.size != JWT_PARTS) {
        throw IllegalArgumentException("Invalid token format")
    }

    val header = json.parseToJsonElement(base64UrlDecode(parts[0])).jsonObject
    if (
        header["alg"]?.jsonPrimitive?.content != "HS256" ||
            header["typ"]?.jsonPrimitive?.content != "JWT"
    ) {
        throw IllegalArgumentException("Unsupported token algorithm")
    }

    val secret =
        System.getenv("JWT_SECRET")?.trim()?.takeIf { it.isNotEmpty() }
            ?: throw IllegalStateException("Missing required environment variable JWT_SECRET")
    val expectedSignature = signHmacSha256("${parts[0]}.${parts[1]}", secret)
    if (!timingSafeEqual(parts[2], expectedSignature)) {
        throw IllegalArgumentException("Invalid token signature")
    }

    val claims = json.decodeFromString(JwtClaims.serializer(), base64UrlDecode(parts[1]))
    val now = System.currentTimeMillis() / EPOCH_SECONDS_DIVISOR

    if (claims.iss != JWT_ISSUER || claims.exp <= now) {
        throw IllegalArgumentException("Token expired")
    }

    if (claims.activeProfile != "PATIENT" && claims.activeProfile != "DOCTOR") {
        throw IllegalArgumentException("Invalid token profile")
    }

    return claims
}

fun Application.installJwtAuthGuard() {
    intercept(ApplicationCallPipeline.Plugins) {
        val path = call.request.path()
        if (
            call.request.httpMethod == HttpMethod.Options ||
                path == "/health" ||
                !path.startsWith("/api")
        ) {
            return@intercept
        }

        val token = extractBearerToken(call.request.header(HttpHeaders.Authorization))
        if (token == null) {
            call.respond(
                HttpStatusCode.Unauthorized,
                ErrorResponse(error = "UNAUTHORIZED", message = "Unauthorized")
            )
            finish()
            return@intercept
        }

        try {
            verifyAccessToken(token)
        } catch (_: Exception) {
            call.respond(
                HttpStatusCode.Unauthorized,
                ErrorResponse(error = "UNAUTHORIZED", message = "Unauthorized")
            )
            finish()
        }
    }
}
