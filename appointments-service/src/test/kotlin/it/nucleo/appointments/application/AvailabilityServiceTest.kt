package it.nucleo.appointments.application

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import it.nucleo.appointments.domain.Availability
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.LocalDateTime

class AvailabilityServiceTest : FunSpec({

    test("createAvailability - should create availability successfully") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService()
        val service = AvailabilityService(repo)

        val command = AvailabilityService.CreateAvailabilityCommand(
            doctorId = "doc-001",
            facilityId = "facility-001",
            serviceTypeId = "service-001",
            timeSlot = TimeSlot(
                startDateTime = LocalDateTime.parse("2026-02-15T09:00:00"),
                durationMinutes = 30
            )
        )

        // When
        val result = service.createAvailability(command)

        // Then
        result shouldNotBe null
        result.doctorId.value shouldBe "doc-001"
        result.status shouldBe AvailabilityStatus.AVAILABLE
    }

    test("createAvailability - should throw AvailabilityOverlapException when overlap exists") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService(hasOverlap = true)
        val service = AvailabilityService(repo)

        val command = AvailabilityService.CreateAvailabilityCommand(
            doctorId = "doc-001",
            facilityId = "facility-001",
            serviceTypeId = "service-001",
            timeSlot = TimeSlot(
                startDateTime = LocalDateTime.parse("2026-02-15T09:00:00"),
                durationMinutes = 30
            )
        )

        // When & Then
        shouldThrow<AvailabilityOverlapException> {
            service.createAvailability(command)
        }
    }

    test("getAvailabilityById - should return availability when found") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService()
        val service = AvailabilityService(repo)

        // When
        val result = service.getAvailabilityById("a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6")

        // Then
        result shouldNotBe null
        result?.availabilityId?.value shouldBe "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
    }

    test("getAvailabilityById - should return null when not found") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService(availabilityExists = false)
        val service = AvailabilityService(repo)

        // When
        val result = service.getAvailabilityById("00000000-0000-0000-0000-000000000000")

        // Then
        result shouldBe null
    }

    test("getAvailabilitiesByFilters - should return filtered availabilities") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService()
        val service = AvailabilityService(repo)

        // When
        val result = service.getAvailabilitiesByFilters(
            doctorId = "doc-001",
            facilityId = null,
            serviceTypeId = null,
            status = null
        )

        // Then
        result shouldHaveSize 1
        result[0].doctorId.value shouldBe "doc-001"
    }

    test("updateAvailability - should update availability successfully") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService()
        val service = AvailabilityService(repo)

        val command = AvailabilityService.UpdateAvailabilityCommand(
            id = "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
            facilityId = "facility-002",
            serviceTypeId = null,
            timeSlot = null
        )

        // When
        val result = service.updateAvailability(command)

        // Then
        result shouldNotBe null
        result?.facilityId?.value shouldBe "facility-002"
    }

    test("updateAvailability - should return null when not found") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService(availabilityExists = false)
        val service = AvailabilityService(repo)

        val command = AvailabilityService.UpdateAvailabilityCommand(
            id = "00000000-0000-0000-0000-000000000000",
            facilityId = null,
            serviceTypeId = null,
            timeSlot = null
        )

        // When
        val result = service.updateAvailability(command)

        // Then
        result shouldBe null
    }

    test("cancelAvailability - should cancel availability successfully") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService()
        val service = AvailabilityService(repo)

        // When
        val result = service.cancelAvailability("a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6")

        // Then
        result shouldBe true
    }

    test("cancelAvailability - should return false when not found") {
        // Given
        val repo = FakeAvailabilityRepositoryForAvailabilityService(availabilityExists = false)
        val service = AvailabilityService(repo)

        // When
        val result = service.cancelAvailability("00000000-0000-0000-0000-000000000000")

        // Then
        result shouldBe false
    }
})

class FakeAvailabilityRepositoryForAvailabilityService(
    private val availabilityExists: Boolean = true,
    private val hasOverlap: Boolean = false
) : AvailabilityRepository {

    override suspend fun save(availability: Availability): Availability = availability

    override suspend fun findById(id: AvailabilityId): Availability? {
        if (!availabilityExists) return null

        return Availability(
            availabilityId = id,
            doctorId = DoctorId.fromString("doc-001"),
            facilityId = FacilityId.fromString("facility-001"),
            serviceTypeId = ServiceTypeId.fromString("service-001"),
            timeSlot = TimeSlot(
                startDateTime = LocalDateTime.parse("2026-02-01T09:00:00"),
                durationMinutes = 30
            ),
            status = AvailabilityStatus.AVAILABLE
        )
    }

    override suspend fun findByFilters(
        doctorId: DoctorId?,
        facilityId: FacilityId?,
        serviceTypeId: ServiceTypeId?,
        status: AvailabilityStatus?
    ): List<Availability> {
        if (!availabilityExists) return emptyList()

        val availability = Availability(
            availabilityId = AvailabilityId.fromString("a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"),
            doctorId = DoctorId.fromString("doc-001"),
            facilityId = FacilityId.fromString("facility-001"),
            serviceTypeId = ServiceTypeId.fromString("service-001"),
            timeSlot = TimeSlot(
                startDateTime = LocalDateTime.parse("2026-02-01T09:00:00"),
                durationMinutes = 30
            ),
            status = AvailabilityStatus.AVAILABLE
        )

        return listOf(availability)
    }

    override suspend fun update(availability: Availability): Availability? {
        if (!availabilityExists) return null
        return availability
    }

    override suspend fun checkOverlap(
        doctorId: DoctorId,
        timeSlot: TimeSlot,
        excludeId: AvailabilityId?
    ): Boolean = hasOverlap
}
