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
import it.nucleo.appointments.application.AppointmentService
import it.nucleo.appointments.domain.*
import it.nucleo.appointments.fixtures.AppointmentFixtures
import it.nucleo.appointments.fixtures.FakeAppointmentRepository
import it.nucleo.appointments.fixtures.FakeAvailabilityRepository
import kotlinx.serialization.json.Json

class AppointmentRoutesTest :
    DescribeSpec({

        fun configuredTestApp(
            appointmentRepo: AppointmentRepository = FakeAppointmentRepository(),
            availabilityRepo: AvailabilityRepository = FakeAvailabilityRepository(),
            block: suspend ApplicationTestBuilder.() -> Unit,
        ) = testApplication {
            application { appointmentTestModule(appointmentRepo, availabilityRepo) }
            block()
        }

        describe("POST /appointments") {

            it("should create an appointment successfully") {
                configuredTestApp {
                    val response = client.post("/appointments") {
                        contentType(ContentType.Application.Json)
                        setBody("""
                            {
                                "patientId": "${AppointmentFixtures.PATIENT_ID}",
                                "availabilityId": "${AppointmentFixtures.AVAILABILITY_ID}"
                            }
                        """.trimIndent())
                    }

                    response.status shouldBe HttpStatusCode.Created
                    val body = response.bodyAsText()
                    body shouldContain "appointmentId"
                    body shouldContain AppointmentFixtures.PATIENT_ID
                    body shouldContain AppointmentFixtures.AVAILABILITY_ID
                }
            }

            it("should return 404 when the availability is not found") {
                configuredTestApp(
                    availabilityRepo = FakeAvailabilityRepository(availabilityExists = false),
                ) {
                    val response = client.post("/appointments") {
                        contentType(ContentType.Application.Json)
                        setBody("""
                            {
                                "patientId": "${AppointmentFixtures.PATIENT_ID}",
                                "availabilityId": "00000000-0000-0000-0000-000000000000"
                            }
                        """.trimIndent())
                    }

                    response.status shouldBe HttpStatusCode.NotFound
                    response.bodyAsText() shouldContain "AVAILABILITY_NOT_FOUND"
                }
            }

            it("should return 400 when the availability is not available") {
                configuredTestApp(
                    availabilityRepo = FakeAvailabilityRepository(
                        availabilityStatus = AvailabilityStatus.BOOKED,
                    ),
                ) {
                    val response = client.post("/appointments") {
                        contentType(ContentType.Application.Json)
                        setBody("""
                            {
                                "patientId": "${AppointmentFixtures.PATIENT_ID}",
                                "availabilityId": "${AppointmentFixtures.AVAILABILITY_ID}"
                            }
                        """.trimIndent())
                    }

                    response.status shouldBe HttpStatusCode.BadRequest
                    response.bodyAsText() shouldContain "AVAILABILITY_NOT_AVAILABLE"
                }
            }
        }

        describe("GET /appointments/{id}") {

            it("should return the appointment by id") {
                configuredTestApp {
                    val response = client.get("/appointments/${AppointmentFixtures.APPOINTMENT_ID}")

                    response.status shouldBe HttpStatusCode.OK
                    val body = response.bodyAsText()
                    body shouldContain AppointmentFixtures.APPOINTMENT_ID
                    body shouldContain "SCHEDULED"
                }
            }

            it("should return 404 when the appointment is not found") {
                configuredTestApp(
                    appointmentRepo = FakeAppointmentRepository(appointmentExists = false),
                ) {
                    val response = client.get("/appointments/00000000-0000-0000-0000-000000000000")

                    response.status shouldBe HttpStatusCode.NotFound
                    response.bodyAsText() shouldContain "APPOINTMENT_NOT_FOUND"
                }
            }
        }

        describe("GET /appointments") {

            it("should return all appointments") {
                configuredTestApp {
                    val response = client.get("/appointments")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain "appointmentId"
                }
            }

            it("should filter appointments by patientId") {
                configuredTestApp {
                    val response = client.get("/appointments?patientId=${AppointmentFixtures.PATIENT_ID}")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain AppointmentFixtures.PATIENT_ID
                }
            }

            it("should filter appointments by doctorId") {
                configuredTestApp {
                    val response = client.get("/appointments?doctorId=${AppointmentFixtures.DOCTOR_ID}")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldNotBe ""
                }
            }

            it("should filter appointments by status") {
                configuredTestApp {
                    val response = client.get("/appointments?status=SCHEDULED")

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain "SCHEDULED"
                }
            }
        }

        describe("PUT /appointments/{id}") {

            it("should update the appointment status") {
                configuredTestApp {
                    val response = client.put("/appointments/${AppointmentFixtures.APPOINTMENT_ID}") {
                        contentType(ContentType.Application.Json)
                        setBody("""{ "status": "CANCELLED" }""")
                    }

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain AppointmentFixtures.APPOINTMENT_ID
                }
            }

            it("should update the appointment availability") {
                configuredTestApp {
                    val response = client.put("/appointments/${AppointmentFixtures.APPOINTMENT_ID}") {
                        contentType(ContentType.Application.Json)
                        setBody("""{ "availabilityId": "${AppointmentFixtures.OTHER_AVAILABILITY_ID}" }""")
                    }

                    response.status shouldBe HttpStatusCode.OK
                    response.bodyAsText() shouldContain AppointmentFixtures.APPOINTMENT_ID
                }
            }

            it("should return 404 when the appointment is not found") {
                configuredTestApp(
                    appointmentRepo = FakeAppointmentRepository(appointmentExists = false),
                ) {
                    val response = client.put("/appointments/non-existent-id") {
                        contentType(ContentType.Application.Json)
                        setBody("""{ "status": "CANCELLED" }""")
                    }

                    response.status shouldBe HttpStatusCode.NotFound
                    response.bodyAsText() shouldContain "APPOINTMENT_NOT_FOUND"
                }
            }
        }

        describe("DELETE /appointments/{id}") {

            it("should delete an appointment successfully") {
                configuredTestApp(
                    availabilityRepo = FakeAvailabilityRepository(
                        availabilityStatus = AvailabilityStatus.BOOKED,
                    ),
                ) {
                    val response = client.delete("/appointments/${AppointmentFixtures.APPOINTMENT_ID}")

                    response.status shouldBe HttpStatusCode.NoContent
                }
            }

            it("should return 404 when the appointment is not found") {
                configuredTestApp(
                    appointmentRepo = FakeAppointmentRepository(appointmentExists = false),
                ) {
                    val response = client.delete("/appointments/00000000-0000-0000-0000-000000000000")

                    response.status shouldBe HttpStatusCode.NotFound
                    response.bodyAsText() shouldContain "APPOINTMENT_NOT_FOUND"
                }
            }
        }
    })

private val appointmentTestJson = Json {
    prettyPrint = true
    isLenient = true
    ignoreUnknownKeys = true
}

private fun Application.appointmentTestModule(
    appointmentRepo: AppointmentRepository,
    availabilityRepo: AvailabilityRepository,
) {
    install(ContentNegotiation) { json(appointmentTestJson) }
    routing {
        val service = AppointmentService(appointmentRepo, availabilityRepo)
        appointmentRoutes(service)
    }
}
