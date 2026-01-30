package it.nucleo.appointments.api.routes

import io.kotest.core.spec.style.FunSpec
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
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.json.Json

class AvailabilityRoutesTest :
    FunSpec({
        fun Application.testModule(availabilityRepository: AvailabilityRepository) {
            install(ContentNegotiation) {
                json(
                    Json {
                        prettyPrint = true
                        isLenient = true
                        ignoreUnknownKeys = true
                    }
                )
            }
            routing {
                val service = AvailabilityService(availabilityRepository)
                availabilityRoutes(service)
            }
        }

        test("POST /availabilities - should create availability successfully") {
            testApplication {
                application { testModule(FakeAvailabilityRepository()) }

                val response =
                    client.post("/availabilities") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "doctorId": "doc-001",
                        "facilityId": "facility-001",
                        "serviceTypeId": "service-001",
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
                body shouldContain "doc-001"
                body shouldContain "facility-001"
            }
        }

        test("POST /availabilities - should return 409 on overlap") {
            testApplication {
                application { testModule(FakeAvailabilityRepository(overlapDetected = true)) }

                val response =
                    client.post("/availabilities") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "doctorId": "doc-001",
                        "facilityId": "facility-001",
                        "serviceTypeId": "service-001",
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
                val body = response.bodyAsText()
                body shouldContain "OVERLAP_ERROR"
            }
        }

        test("GET /availabilities/{id} - should return availability by id") {
            testApplication {
                application { testModule(FakeAvailabilityRepository()) }

                val response = client.get("/availabilities/a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
                body shouldContain "AVAILABLE"
            }
        }

        test("GET /availabilities/{id} - should return 404 when not found") {
            testApplication {
                application { testModule(FakeAvailabilityRepository(availabilityExists = false)) }

                val response = client.get("/availabilities/00000000-0000-0000-0000-000000000000")

                response.status shouldBe HttpStatusCode.NotFound
                val body = response.bodyAsText()
                body shouldContain "NOT_FOUND"
            }
        }

        test("GET /availabilities - should return all availabilities") {
            testApplication {
                application { testModule(FakeAvailabilityRepository()) }

                val response = client.get("/availabilities")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldNotBe ""
            }
        }

        test("GET /availabilities - should filter by doctorId") {
            testApplication {
                application { testModule(FakeAvailabilityRepository()) }

                val response = client.get("/availabilities?doctorId=doc-001")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "doc-001"
            }
        }

        test("GET /availabilities - should filter by status") {
            testApplication {
                application { testModule(FakeAvailabilityRepository()) }

                val response = client.get("/availabilities?status=AVAILABLE")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "AVAILABLE"
            }
        }

        test("PUT /availabilities/{id} - should update availability successfully") {
            testApplication {
                application { testModule(FakeAvailabilityRepository()) }

                val response =
                    client.put("/availabilities/a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "status": "BOOKED"
                    }
                """
                                .trimIndent()
                        )
                    }

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
            }
        }

        test("PUT /availabilities/{id} - should return 404 when not found") {
            testApplication {
                application { testModule(FakeAvailabilityRepository(availabilityExists = false)) }

                val response =
                    client.put("/availabilities/00000000-0000-0000-0000-000000000000") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "status": "BOOKED"
                    }
                """
                                .trimIndent()
                        )
                    }

                response.status shouldBe HttpStatusCode.NotFound
                val body = response.bodyAsText()
                body shouldContain "NOT_FOUND"
            }
        }

        test("DELETE /availabilities/{id} - should cancel availability successfully") {
            testApplication {
                application { testModule(FakeAvailabilityRepository()) }

                val response = client.delete("/availabilities/a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6")

                response.status shouldBe HttpStatusCode.NoContent
            }
        }

        test("DELETE /availabilities/{id} - should return 404 when not found") {
            testApplication {
                application { testModule(FakeAvailabilityRepository(availabilityExists = false)) }

                val response = client.delete("/availabilities/00000000-0000-0000-0000-000000000000")

                response.status shouldBe HttpStatusCode.NotFound
                val body = response.bodyAsText()
                body shouldContain "NOT_FOUND"
            }
        }
    })

// Fake repository for testing
class FakeAvailabilityRepository(
    private val availabilityExists: Boolean = true,
    private val overlapDetected: Boolean = false,
    private val availabilityStatus: AvailabilityStatus = AvailabilityStatus.AVAILABLE
) : AvailabilityRepository {

    override suspend fun save(
        availability: it.nucleo.appointments.domain.Availability
    ): it.nucleo.appointments.domain.Availability = availability

    override suspend fun findById(id: AvailabilityId): it.nucleo.appointments.domain.Availability? {
        if (!availabilityExists) return null

        return it.nucleo.appointments.domain.Availability(
            availabilityId = id,
            doctorId = DoctorId.fromString("doc-001"),
            facilityId = FacilityId.fromString("facility-001"),
            serviceTypeId = ServiceTypeId.fromString("service-001"),
            timeSlot =
                TimeSlot(
                    startDateTime = LocalDateTime.parse("2026-02-01T09:00:00"),
                    durationMinutes = 30
                ),
            status = availabilityStatus
        )
    }

    override suspend fun findByFilters(
        doctorId: DoctorId?,
        facilityId: FacilityId?,
        serviceTypeId: ServiceTypeId?,
        status: AvailabilityStatus?
    ): List<it.nucleo.appointments.domain.Availability> {
        if (!availabilityExists) return emptyList()

        val availability =
            it.nucleo.appointments.domain.Availability(
                availabilityId = AvailabilityId.fromString("a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"),
                doctorId = DoctorId.fromString("doc-001"),
                facilityId = FacilityId.fromString("facility-001"),
                serviceTypeId = ServiceTypeId.fromString("service-001"),
                timeSlot =
                    TimeSlot(
                        startDateTime = LocalDateTime.parse("2026-02-01T09:00:00"),
                        durationMinutes = 30
                    ),
                status = AvailabilityStatus.AVAILABLE
            )

        return listOf(availability)
    }

    override suspend fun update(
        availability: it.nucleo.appointments.domain.Availability
    ): it.nucleo.appointments.domain.Availability? {
        if (!availabilityExists) return null
        return availability
    }

    override suspend fun checkOverlap(
        doctorId: DoctorId,
        timeSlot: TimeSlot,
        excludeId: AvailabilityId?
    ): Boolean = overlapDetected
}
