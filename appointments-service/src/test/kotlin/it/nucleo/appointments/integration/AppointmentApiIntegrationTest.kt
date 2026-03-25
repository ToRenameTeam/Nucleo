package it.nucleo.appointments.integration

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import it.nucleo.appointments.integration.support.PostgresContainerSupport
import it.nucleo.module
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class AppointmentApiIntegrationTest :
    DescribeSpec({
        val json = Json { ignoreUnknownKeys = true }

        fun configuredTestApp(block: suspend ApplicationTestBuilder.() -> Unit) = testApplication {
            application { module() }
            block()
        }

        fun fieldValue(body: String, field: String): String {
            return json.parseToJsonElement(body).jsonObject.getValue(field).jsonPrimitive.content
        }

        suspend fun ApplicationTestBuilder.createAvailability(
            doctorId: String,
            startDateTime: String,
            facilityId: String = "facility-1",
            serviceTypeId: String = "service-1",
        ): String {
            val response =
                client.post("/api/availabilities") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        """
                        {
                          "doctorId": "$doctorId",
                          "facilityId": "$facilityId",
                          "serviceTypeId": "$serviceTypeId",
                          "timeSlot": {
                            "startDateTime": "$startDateTime",
                            "durationMinutes": 30
                          }
                        }
                        """
                            .trimIndent()
                    )
                }

            response.status shouldBe HttpStatusCode.Created
            return fieldValue(response.bodyAsText(), "availabilityId")
        }

        suspend fun ApplicationTestBuilder.createAppointment(
            patientId: String,
            availabilityId: String,
        ): String {
            val response =
                client.post("/api/appointments") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        """
                        {
                          "patientId": "$patientId",
                          "availabilityId": "$availabilityId"
                        }
                        """
                            .trimIndent()
                    )
                }

            response.status shouldBe HttpStatusCode.Created
            return fieldValue(response.bodyAsText(), "appointmentId")
        }

        beforeSpec { PostgresContainerSupport.start() }

        beforeTest { PostgresContainerSupport.resetDatabase() }

        afterSpec { PostgresContainerSupport.stop() }

        describe("Appointments API integration") {
            it("books an appointment and marks the slot as BOOKED") {
                configuredTestApp {
                    val availabilityId =
                        createAvailability(
                            doctorId = "doctor-booking",
                            startDateTime = "2026-04-10T09:00:00"
                        )

                    val appointmentId =
                        createAppointment(
                            patientId = "patient-booking",
                            availabilityId = availabilityId
                        )

                    val availabilityResponse = client.get("/api/availabilities/$availabilityId")
                    availabilityResponse.status shouldBe HttpStatusCode.OK
                    fieldValue(availabilityResponse.bodyAsText(), "status") shouldBe "BOOKED"

                    val detailsResponse = client.get("/api/appointments/$appointmentId/details")
                    detailsResponse.status shouldBe HttpStatusCode.OK
                    fieldValue(detailsResponse.bodyAsText(), "availabilityStatus") shouldBe "BOOKED"
                }
            }

            it("reschedules an appointment and updates both old and new availability status") {
                configuredTestApp {
                    val oldAvailabilityId =
                        createAvailability(
                            doctorId = "doctor-reschedule",
                            startDateTime = "2026-04-10T10:00:00"
                        )
                    val newAvailabilityId =
                        createAvailability(
                            doctorId = "doctor-reschedule",
                            startDateTime = "2026-04-10T11:00:00"
                        )
                    val appointmentId =
                        createAppointment(
                            patientId = "patient-reschedule",
                            availabilityId = oldAvailabilityId
                        )

                    val updateResponse =
                        client.put("/api/appointments/$appointmentId") {
                            contentType(ContentType.Application.Json)
                            setBody("""{ "availabilityId": "$newAvailabilityId" }""")
                        }

                    updateResponse.status shouldBe HttpStatusCode.OK
                    fieldValue(updateResponse.bodyAsText(), "availabilityId") shouldBe
                        newAvailabilityId

                    val oldAvailability = client.get("/api/availabilities/$oldAvailabilityId")
                    oldAvailability.status shouldBe HttpStatusCode.OK
                    fieldValue(oldAvailability.bodyAsText(), "status") shouldBe "AVAILABLE"

                    val newAvailability = client.get("/api/availabilities/$newAvailabilityId")
                    newAvailability.status shouldBe HttpStatusCode.OK
                    fieldValue(newAvailability.bodyAsText(), "status") shouldBe "BOOKED"
                }
            }

            it("filters appointments by doctorId using the persistence join") {
                configuredTestApp {
                    val doctorOneAvailability =
                        createAvailability(
                            doctorId = "doctor-filter-one",
                            startDateTime = "2026-04-10T13:00:00"
                        )
                    val doctorTwoAvailability =
                        createAvailability(
                            doctorId = "doctor-filter-two",
                            startDateTime = "2026-04-10T14:00:00"
                        )

                    createAppointment("patient-one", doctorOneAvailability)
                    createAppointment("patient-two", doctorTwoAvailability)

                    val response = client.get("/api/appointments?doctorId=doctor-filter-one")
                    response.status shouldBe HttpStatusCode.OK

                    val appointments = json.parseToJsonElement(response.bodyAsText()).jsonArray
                    appointments shouldHaveSize 1
                    appointments
                        .first()
                        .jsonObject
                        .getValue("patientId")
                        .jsonPrimitive
                        .content shouldBe "patient-one"
                }
            }

            it("cancels an appointment and reopens the availability") {
                configuredTestApp {
                    val availabilityId =
                        createAvailability(
                            doctorId = "doctor-delete",
                            startDateTime = "2026-04-10T15:00:00"
                        )
                    val appointmentId =
                        createAppointment(
                            patientId = "patient-delete",
                            availabilityId = availabilityId
                        )

                    val deleteResponse = client.delete("/api/appointments/$appointmentId")
                    deleteResponse.status shouldBe HttpStatusCode.NoContent

                    val availabilityResponse = client.get("/api/availabilities/$availabilityId")
                    availabilityResponse.status shouldBe HttpStatusCode.OK
                    fieldValue(availabilityResponse.bodyAsText(), "status") shouldBe "AVAILABLE"
                }
            }
        }
    })
