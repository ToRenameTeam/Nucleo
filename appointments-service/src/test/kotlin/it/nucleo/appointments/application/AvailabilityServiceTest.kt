package it.nucleo.appointments.application

import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import it.nucleo.appointments.domain.*
import it.nucleo.appointments.domain.errors.*
import it.nucleo.appointments.fixtures.AppointmentFixtures
import it.nucleo.appointments.fixtures.FakeAvailabilityRepository
import kotlinx.datetime.LocalDateTime

class AvailabilityServiceTest :
    DescribeSpec({

        fun createService(
            repo: AvailabilityRepository = FakeAvailabilityRepository(),
        ) = AvailabilityService(repo)

        describe("createAvailability") {

            it("should create an availability successfully") {
                val service = createService()

                val result = service.createAvailability(
                    doctorId = AppointmentFixtures.DOCTOR_ID,
                    facilityId = AppointmentFixtures.FACILITY_ID,
                    serviceTypeId = AppointmentFixtures.SERVICE_TYPE_ID,
                    timeSlot = TimeSlot(
                        startDateTime = LocalDateTime.parse("2026-02-15T09:00:00"),
                        durationMinutes = 30,
                    ),
                )

                result.shouldBeInstanceOf<Either.Right<Availability>>()
                result.value.doctorId.value shouldBe AppointmentFixtures.DOCTOR_ID
                result.value.status shouldBe AvailabilityStatus.AVAILABLE
            }

            it("should return OverlapDetected when an overlap exists") {
                val service = createService(
                    repo = FakeAvailabilityRepository(overlapDetected = true),
                )

                val result = service.createAvailability(
                    doctorId = AppointmentFixtures.DOCTOR_ID,
                    facilityId = AppointmentFixtures.FACILITY_ID,
                    serviceTypeId = AppointmentFixtures.SERVICE_TYPE_ID,
                    timeSlot = TimeSlot(
                        startDateTime = LocalDateTime.parse("2026-02-15T09:00:00"),
                        durationMinutes = 30,
                    ),
                )

                result.shouldBeInstanceOf<Either.Left<AvailabilityError.OverlapDetected>>()
            }
        }

        describe("getAvailabilityById") {

            it("should return the availability when it exists") {
                val service = createService()

                val result = service.getAvailabilityById(AppointmentFixtures.AVAILABILITY_ID)

                result.shouldBeInstanceOf<Either.Right<Availability>>()
                result.value.availabilityId.value shouldBe AppointmentFixtures.AVAILABILITY_ID
            }

            it("should return NotFound when the availability does not exist") {
                val service = createService(
                    repo = FakeAvailabilityRepository(availabilityExists = false),
                )

                val result = service.getAvailabilityById("00000000-0000-0000-0000-000000000000")

                result.shouldBeInstanceOf<Either.Left<AvailabilityError.NotFound>>()
            }
        }

        describe("getAvailabilitiesByFilters") {

            it("should return filtered availabilities") {
                val service = createService()

                val result = service.getAvailabilitiesByFilters(
                    doctorId = AppointmentFixtures.DOCTOR_ID,
                    facilityId = null,
                    serviceTypeId = null,
                    status = null,
                )

                result.shouldBeInstanceOf<Either.Right<List<Availability>>>()
                result.value shouldHaveSize 1
                result.value[0].doctorId.value shouldBe AppointmentFixtures.DOCTOR_ID
            }
        }

        describe("updateAvailability") {

            it("should update the availability successfully") {
                val service = createService()

                val result = service.updateAvailability(
                    id = AppointmentFixtures.AVAILABILITY_ID,
                    facilityId = "facility-002",
                    serviceTypeId = null,
                    timeSlot = null,
                )

                result.shouldBeInstanceOf<Either.Right<Availability>>()
                result.value.facilityId.value shouldBe "facility-002"
            }

            it("should return NotFound when the availability does not exist") {
                val service = createService(
                    repo = FakeAvailabilityRepository(availabilityExists = false),
                )

                val result = service.updateAvailability(
                    id = "00000000-0000-0000-0000-000000000000",
                    facilityId = null,
                    serviceTypeId = null,
                    timeSlot = null,
                )

                result.shouldBeInstanceOf<Either.Left<AvailabilityError.NotFound>>()
            }
        }

        describe("cancelAvailability") {

            it("should cancel an availability successfully") {
                val service = createService()

                val result = service.cancelAvailability(AppointmentFixtures.AVAILABILITY_ID)

                result.shouldBeInstanceOf<Either.Right<Unit>>()
            }

            it("should return NotFound when the availability does not exist") {
                val service = createService(
                    repo = FakeAvailabilityRepository(availabilityExists = false),
                )

                val result = service.cancelAvailability("00000000-0000-0000-0000-000000000000")

                result.shouldBeInstanceOf<Either.Left<AvailabilityError.NotFound>>()
            }
        }
    })
