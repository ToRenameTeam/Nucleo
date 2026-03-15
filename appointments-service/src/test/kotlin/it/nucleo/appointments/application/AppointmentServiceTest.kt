package it.nucleo.appointments.application

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import it.nucleo.appointments.domain.*
import it.nucleo.appointments.domain.errors.*
import it.nucleo.appointments.fixtures.AppointmentFixtures
import it.nucleo.appointments.fixtures.FakeAppointmentRepository
import it.nucleo.appointments.fixtures.FakeAvailabilityRepository
import it.nucleo.commons.errors.*

class AppointmentServiceTest :
    DescribeSpec({
        fun createService(
            appointmentRepo: AppointmentRepository = FakeAppointmentRepository(),
            availabilityRepo: AvailabilityRepository = FakeAvailabilityRepository(),
        ) = AppointmentService(appointmentRepo, availabilityRepo)

        describe("createAppointment") {
            it("should create an appointment when the availability is available") {
                val service = createService()

                val result =
                    service.createAppointment(
                        patientId = AppointmentFixtures.PATIENT_ID,
                        availabilityId = AppointmentFixtures.AVAILABILITY_ID,
                    )

                result.shouldBeInstanceOf<Either.Right<Appointment>>()
                result.value.patientId.value shouldBe AppointmentFixtures.PATIENT_ID
                result.value.status shouldBe AppointmentStatus.SCHEDULED
            }

            it("should return NotFound when the availability does not exist") {
                val service =
                    createService(
                        availabilityRepo = FakeAvailabilityRepository(availabilityExists = false),
                    )

                val result =
                    service.createAppointment(
                        patientId = AppointmentFixtures.PATIENT_ID,
                        availabilityId = "00000000-0000-0000-0000-000000000000",
                    )

                result.shouldBeInstanceOf<Either.Left<AvailabilityError.NotFound>>()
            }

            it("should return NotAvailable when the availability is already booked") {
                val service =
                    createService(
                        availabilityRepo =
                            FakeAvailabilityRepository(
                                availabilityStatus = AvailabilityStatus.BOOKED,
                            ),
                    )

                val result =
                    service.createAppointment(
                        patientId = AppointmentFixtures.PATIENT_ID,
                        availabilityId = AppointmentFixtures.AVAILABILITY_ID,
                    )

                result.shouldBeInstanceOf<Either.Left<AvailabilityError.NotAvailable>>()
            }
        }

        describe("getAppointmentById") {
            it("should return the appointment when it exists") {
                val service = createService()

                val result = service.getAppointmentById(AppointmentFixtures.APPOINTMENT_ID)

                result.shouldBeInstanceOf<Either.Right<Appointment>>()
                result.value.id.value shouldBe AppointmentFixtures.APPOINTMENT_ID
            }

            it("should return NotFound when the appointment does not exist") {
                val service =
                    createService(
                        appointmentRepo = FakeAppointmentRepository(appointmentExists = false),
                    )

                val result = service.getAppointmentById("00000000-0000-0000-0000-000000000000")

                result.shouldBeInstanceOf<Either.Left<AppointmentError.NotFound>>()
            }
        }

        describe("getAppointmentsByFilters") {
            it("should return filtered appointments") {
                val service = createService()

                val result =
                    service.getAppointmentsByFilters(
                        patientId = AppointmentFixtures.PATIENT_ID,
                        doctorId = null,
                        status = null,
                    )

                result.shouldBeInstanceOf<Either.Right<List<Appointment>>>()
                result.value shouldHaveSize 1
                result.value[0].patientId.value shouldBe AppointmentFixtures.PATIENT_ID
            }
        }

        describe("updateAppointment") {
            it("should update the appointment status") {
                val service = createService()

                val result =
                    service.updateAppointment(
                        id = AppointmentFixtures.APPOINTMENT_ID,
                        status = "CANCELLED",
                        availabilityId = null,
                    )

                result.shouldBeInstanceOf<Either.Right<Appointment>>()
                result.value.status shouldBe AppointmentStatus.CANCELLED
            }

            it("should update the appointment availability") {
                val service = createService()

                val result =
                    service.updateAppointment(
                        id = AppointmentFixtures.APPOINTMENT_ID,
                        status = null,
                        availabilityId = AppointmentFixtures.OTHER_AVAILABILITY_ID,
                    )

                result.shouldBeInstanceOf<Either.Right<Appointment>>()
                result.value.availabilityId.value shouldBe AppointmentFixtures.OTHER_AVAILABILITY_ID
            }
        }

        describe("deleteAppointment") {
            it("should delete an existing appointment") {
                val service =
                    createService(
                        availabilityRepo =
                            FakeAvailabilityRepository(
                                availabilityStatus = AvailabilityStatus.BOOKED,
                            ),
                    )

                val result = service.deleteAppointment(AppointmentFixtures.APPOINTMENT_ID)

                result.shouldBeInstanceOf<Either.Right<Unit>>()
            }

            it("should return NotFound when the appointment does not exist") {
                val service =
                    createService(
                        appointmentRepo = FakeAppointmentRepository(appointmentExists = false),
                    )

                val result = service.deleteAppointment("00000000-0000-0000-0000-000000000000")

                result.shouldBeInstanceOf<Either.Left<AppointmentError.NotFound>>()
            }
        }
    })
