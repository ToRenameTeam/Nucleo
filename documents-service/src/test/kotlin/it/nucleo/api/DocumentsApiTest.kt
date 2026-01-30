package it.nucleo.api

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import it.nucleo.api.fixtures.configuredTestApplication

class DocumentsApiTest : DescribeSpec({

    describe("Health Check") {
        it("should return OK") {
            configuredTestApplication { client ->
                val response = client.get("/health")

                response.status shouldBe HttpStatusCode.OK
                response.bodyAsText() shouldBe "OK"
            }
        }
    }
})
