package it.nucleo.appointments.api.routes

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import it.nucleo.appointments.application.AvailabilityService
import it.nucleo.appointments.domain.*
import it.nucleo.appointments.fixtures.AppointmentFixtures
import it.nucleo.appointments.fixtures.FakeAvailabilityRepository
import kotlinx.serialization.json.Json

class AvailabilityRoutesTest :
    DescribeSpec({
        fun configuredTestApp(
            availabilityRepo: AvailabilityRepository = FakeAvailabilityRepository(),
            block: suspend ApplicationTestBuilder.() -> Unit,
        ) = testApplication {
            application { availabilityTestModule(availabilityRepo) }
            block()
        }

        describe("POST /availabilities") {
            it("should create an availability successfully") {
                configuredTestApp {
                    val response =
                        client.post("/availabilities") {
                            contentType(ContentType.Application.Json)
                            setBody(
                                """
                            {
                                "doctorId": "${AppointmentFixtures.DOCTOR_ID}",
                                "facilityId": "${AppointmentFixtures.FACILITY_ID}",
                                "serviceTypeId": "${AppointmentFixtures.SERVICE_TYPE_ID}",
                                "timeSlot": {
                                    "startDateTime": "2026-02-15T09:00:00",
                                    "durationMinutes": 30
                                }
                            }
                        """
                                    .trimIndent()
                            )
                        }

                    response.status shouldBe HttpStatusCode.Created
                    val body = response.bodyAsText()
                    body shouldContain "availabilityId"
                    body shouldContain AppointmentFixtures.DOCTOR_ID
                    body shouldContain AppointmentFixtures.FACILITY_ID
                }
            }

            it("should return 409 when an overlap is detected") {
                configuredTestApp(
                    availabilityRepo = FakeAvailabilityRepository(overlapDetected = true),
                ) {
                    val response =
                        client.post("/availabilities") {
                            contentType(ContentType.Application.Json)
                            setBody(
                                """
                            {
                                "doctorId": "${AppointmentFixtures.DOCTOR_ID}",
                                "facilityId": "${AppointmentFixtures.FACILITY_ID}",
                                "serviceTypeId": "${AppointmentFixtures.SERVICE_TYPE_ID}",
                                "timeSlot": {
                                    "startDateTime": "2026-02-15T09:00:00",
                                    "durationMinutes": 30
                                }
                            }
                        """
                                    .trimIndent()
                            )
                        }

                    response.status shouldBe HttpStatusCode.Conflict
                    response.bodyAsText() shouldContain "OVERLAP_ERROR"
                }
            }
        }

        describe("GET /availabilities/{id}") {
            it("should return the availability by id") {
                configuredTestApp {
                    val response =
                        client.get("/availabilities/${AppointmentFixtures.AVAILABILITY_ID}")

                    response.status shouldBe HttpStatusCode.OK
                    val body = response.bodyAsText()
                    body shouldContain AppointmentFixtures.AVAILABILITY_ID
                    body shouldContain "AVAILABLE"
                }
            }

            it("should return 404 when the availability is not found") {
                configuredTestApp(
                    availabilityRepo = FakeAvailabilityRepository(availabilityExists = false),
                ) {
                    val response =
                        client.get("/availabilities/00000000-0000-0000-0000-000000000000")

                    response.status shouldBe HttpStatusCode.NotFound
                    response.bodyAsText() shouldContain "AVAILABILITY_NOT_FOUND"
                }
            }
        }

        describe("GET /availabilities") {
            it("should return all availabilities") {
                configuredTestApp {
                    val response = client.get("/availabilities")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldNotBe ""
                }
            }

            it("should filter by doctorId") {
                configuredTestApp {
                    val response =
                        client.get("/availabilities?doctorId=${AppointmentFixtures.DOCTOR_ID}")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain AppointmentFixtures.DOCTOR_ID
                }
            }

            it("should filter by status") {
                configuredTestApp {
                    val response = client.get("/availabilities?status=AVAILABLE")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain "AVAILABLE"
                }
            }
        }

        describe("PUT /availabilities/{id}") {
            it("should update an availability successfully") {
                configuredTestApp {
                    val response =
                        client.put("/availabilities/${AppointmentFixtures.AVAILABILITY_ID}") {
                            contentType(ContentType.Application.Json)
                            setBody("""{ "status": "BOOKED" }""")
                        }

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain AppointmentFixtures.AVAILABILITY_ID
                }
            }

            it("should return 404 when the availability is not found") {
                configuredTestApp(
                    availabilityRepo = FakeAvailabilityRepository(availabilityExists = false),
                ) {
                    val response =
                        client.put("/availabilities/00000000-0000-0000-0000-000000000000") {
                            contentType(ContentType.Application.Json)
                            setBody("""{ "status": "BOOKED" }""")
                        }

                    response.status shouldBe HttpStatusCode.NotFound
                    response.bodyAsText() shouldContain "AVAILABILITY_NOT_FOUND"
                }
            }
        }

        describe("DELETE /availabilities/{id}") {
            it("should cancel an availability successfully") {
                configuredTestApp {
                    val response =
                        client.delete("/availabilities/${AppointmentFixtures.AVAILABILITY_ID}")

                    response.status shouldBe HttpStatusCode.NoContent
                }
            }

            it("should return 404 when the availability is not found") {
                configuredTestApp(
                    availabilityRepo = FakeAvailabilityRepository(availabilityExists = false),
                ) {
                    val response =
                        client.delete("/availabilities/00000000-0000-0000-0000-000000000000")

                    response.status shouldBe HttpStatusCode.NotFound
                    response.bodyAsText() shouldContain "AVAILABILITY_NOT_FOUND"
                }
            }
        }
    })

private val availabilityTestJson = Json {
    prettyPrint = true
    isLenient = true
    ignoreUnknownKeys = true
}

private fun Application.availabilityTestModule(
    availabilityRepo: AvailabilityRepository,
) {
    install(ContentNegotiation) { json(availabilityTestJson) }
    routing {
        val service = AvailabilityService(availabilityRepo)
        availabilityRoutes(service)
    }
}
