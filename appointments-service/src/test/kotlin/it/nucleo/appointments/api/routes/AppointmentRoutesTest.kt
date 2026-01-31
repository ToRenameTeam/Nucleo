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
import it.nucleo.appointments.application.AppointmentService
import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.AppointmentRepository
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.json.Json

class AppointmentRoutesTest :
    FunSpec({
        fun Application.testModule(
            appointmentRepository: AppointmentRepository,
            availabilityRepository: AvailabilityRepository
        ) {
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
                val service = AppointmentService(appointmentRepository, availabilityRepository)
                appointmentRoutes(service)
            }
        }

        test("POST /appointments - should create appointment successfully") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response =
                    client.post("/appointments") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "patientId": "pat-001",
                        "availabilityId": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
                    }
                """
                                .trimIndent()
                        )
                    }

                response.status shouldBe HttpStatusCode.Created
                val body = response.bodyAsText()
                body shouldContain "appointmentId"
                body shouldContain "pat-001"
                body shouldContain "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
            }
        }

        test("POST /appointments - should return 404 when availability not found") {
            testApplication {
                application {
                    testModule(
                        FakeAppointmentRepository(),
                        FakeAvailabilityRepository(availabilityExists = false)
                    )
                }

                val response =
                    client.post("/appointments") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "patientId": "pat-001",
                        "availabilityId": "00000000-0000-0000-0000-000000000000"
                    }
                """
                                .trimIndent()
                        )
                    }

                response.status shouldBe HttpStatusCode.NotFound
                val body = response.bodyAsText()
                body shouldContain "AVAILABILITY_NOT_FOUND"
            }
        }

        test("POST /appointments - should return 400 when availability not available") {
            testApplication {
                application {
                    testModule(
                        FakeAppointmentRepository(),
                        FakeAvailabilityRepository(
                            availabilityExists = true,
                            overlapDetected = false,
                            availabilityStatus = AvailabilityStatus.BOOKED
                        )
                    )
                }

                val response =
                    client.post("/appointments") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "patientId": "pat-001",
                        "availabilityId": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
                    }
                """
                                .trimIndent()
                        )
                    }

                response.status shouldBe HttpStatusCode.BadRequest
                val body = response.bodyAsText()
                body shouldContain "AVAILABILITY_NOT_AVAILABLE"
            }
        }

        test("GET /appointments/{id} - should return appointment by id") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response = client.get("/appointments/d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9"
                body shouldContain "SCHEDULED"
            }
        }

        test("GET /appointments/{id} - should return 404 when appointment not found") {
            testApplication {
                application {
                    testModule(
                        FakeAppointmentRepository(appointmentExists = false),
                        FakeAvailabilityRepository()
                    )
                }

                val response = client.get("/appointments/00000000-0000-0000-0000-000000000000")

                response.status shouldBe HttpStatusCode.NotFound
                val body = response.bodyAsText()
                body shouldContain "NOT_FOUND"
            }
        }

        test("GET /appointments/{id} - should return 400 for invalid id") {
            testApplication {
                application {
                    testModule(
                        FakeAppointmentRepository(throwInvalidId = true),
                        FakeAvailabilityRepository()
                    )
                }

                val response = client.get("/appointments/not-a-uuid")

                response.status shouldBe HttpStatusCode.BadRequest
                val body = response.bodyAsText()
                body shouldContain "INVALID_ID"
            }
        }

        test("GET /appointments - should return all appointments") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response = client.get("/appointments")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "appointmentId"
            }
        }

        test("GET /appointments - should filter appointments by patientId") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response = client.get("/appointments?patientId=pat-001")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "pat-001"
            }
        }

        test("GET /appointments - should filter appointments by doctorId") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response = client.get("/appointments?doctorId=doc-001")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldNotBe ""
            }
        }

        test("GET /appointments - should filter appointments by status") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response = client.get("/appointments?status=SCHEDULED")

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "SCHEDULED"
            }
        }

        test("PUT /appointments/{id} - should update appointment status") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response =
                    client.put("/appointments/d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "status": "CANCELLED"
                    }
                """
                                .trimIndent()
                        )
                    }

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9"
            }
        }

        test("PUT /appointments/{id} - should update appointment availability") {
            testApplication {
                application {
                    testModule(FakeAppointmentRepository(), FakeAvailabilityRepository())
                }

                val response =
                    client.put("/appointments/d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "availabilityId": "b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7"
                    }
                """
                                .trimIndent()
                        )
                    }

                response.status shouldBe HttpStatusCode.OK
                val body = response.bodyAsText()
                body shouldContain "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9"
            }
        }

        test("PUT /appointments/{id} - should return 404 when appointment not found") {
            testApplication {
                application {
                    testModule(
                        FakeAppointmentRepository(appointmentExists = false),
                        FakeAvailabilityRepository()
                    )
                }

                val response =
                    client.put("/appointments/non-existent-id") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            """
                    {
                        "status": "CANCELLED"
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

        test("DELETE /appointments/{id} - should delete appointment successfully") {
            testApplication {
                application {
                    testModule(
                        FakeAppointmentRepository(),
                        FakeAvailabilityRepository(availabilityStatus = AvailabilityStatus.BOOKED)
                    )
                }

                val response = client.delete("/appointments/d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9")

                response.status shouldBe HttpStatusCode.NoContent
            }
        }

        test("DELETE /appointments/{id} - should return 404 when appointment not found") {
            testApplication {
                application {
                    testModule(
                        FakeAppointmentRepository(appointmentExists = false),
                        FakeAvailabilityRepository()
                    )
                }

                val response = client.delete("/appointments/00000000-0000-0000-0000-000000000000")

                response.status shouldBe HttpStatusCode.NotFound
                val body = response.bodyAsText()
                body shouldContain "NOT_FOUND"
            }
        }
    })

// Fake repository implementations for testing
class FakeAppointmentRepository(
    private val appointmentExists: Boolean = true,
    private val throwInvalidId: Boolean = false
) : AppointmentRepository {

    override suspend fun save(appointment: Appointment): Appointment = appointment

    override suspend fun findById(id: AppointmentId): Appointment? {
        if (throwInvalidId) throw IllegalArgumentException("Invalid appointment ID format")
        if (!appointmentExists) return null

        return Appointment(
            id = id,
            patientId = PatientId.fromString("pat-001"),
            availabilityId = AvailabilityId.fromString("a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"),
            doctorId = DoctorId.fromString("doc-001"),
            facilityId = FacilityId.fromString("facility-001"),
            serviceTypeId = ServiceTypeId.fromString("service-001"),
            timeSlot =
                TimeSlot(
                    startDateTime = LocalDateTime.parse("2026-02-01T09:00:00"),
                    durationMinutes = 30
                ),
            status = AppointmentStatus.SCHEDULED,
            createdAt = LocalDateTime.parse("2026-01-30T10:00:00"),
            updatedAt = LocalDateTime.parse("2026-01-30T10:00:00")
        )
    }

    override suspend fun findByFilters(
        patientId: PatientId?,
        doctorId: DoctorId?,
        facilityId: FacilityId?,
        status: AppointmentStatus?,
        startDate: LocalDateTime?,
        endDate: LocalDateTime?
    ): List<Appointment> {
        if (!appointmentExists) return emptyList()

        val appointment =
            Appointment(
                id = AppointmentId.fromString("d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9"),
                patientId = PatientId.fromString("pat-001"),
                availabilityId = AvailabilityId.fromString("a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"),
                doctorId = DoctorId.fromString("doc-001"),
                facilityId = FacilityId.fromString("facility-001"),
                serviceTypeId = ServiceTypeId.fromString("service-001"),
                timeSlot =
                    TimeSlot(
                        startDateTime = LocalDateTime.parse("2026-02-01T09:00:00"),
                        durationMinutes = 30
                    ),
                status = AppointmentStatus.SCHEDULED,
                createdAt = LocalDateTime.parse("2026-01-30T10:00:00"),
                updatedAt = LocalDateTime.parse("2026-01-30T10:00:00")
            )

        return listOf(appointment)
    }

    override suspend fun update(appointment: Appointment): Appointment? {
        if (!appointmentExists) return null
        return appointment
    }
}

// Use FakeAvailabilityRepository from AvailabilityRoutesTest.kt to avoid redeclaration
