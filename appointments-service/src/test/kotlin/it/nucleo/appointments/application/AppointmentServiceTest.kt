package it.nucleo.appointments.application

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import it.nucleo.appointments.domain.Appointment
import it.nucleo.appointments.domain.AppointmentRepository
import it.nucleo.appointments.domain.AvailabilityRepository
import it.nucleo.appointments.domain.valueobjects.*
import kotlinx.datetime.LocalDateTime

class AppointmentServiceTest :
    FunSpec({
        test(
            "createAppointment - should create appointment successfully when availability is available"
        ) {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo = FakeAvailabilityRepositoryForService()
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            val command =
                AppointmentService.CreateAppointmentCommand(
                    patientId = "pat-001",
                    availabilityId = "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
                )

            // When
            val result = service.createAppointment(command)

            // Then
            result shouldNotBe null
            result.patientId.value shouldBe "pat-001"
            result.status shouldBe AppointmentStatus.SCHEDULED
        }

        test(
            "createAppointment - should throw AvailabilityNotFoundException when availability not found"
        ) {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo = FakeAvailabilityRepositoryForService(availabilityExists = false)
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            val command =
                AppointmentService.CreateAppointmentCommand(
                    patientId = "pat-001",
                    availabilityId = "00000000-0000-0000-0000-000000000000"
                )

            // When & Then
            shouldThrow<AvailabilityNotFoundException> { service.createAppointment(command) }
        }

        test(
            "createAppointment - should throw AvailabilityNotAvailableException when availability is not available"
        ) {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo =
                FakeAvailabilityRepositoryForService(availabilityStatus = AvailabilityStatus.BOOKED)
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            val command =
                AppointmentService.CreateAppointmentCommand(
                    patientId = "pat-001",
                    availabilityId = "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
                )

            // When & Then
            shouldThrow<AvailabilityNotAvailableException> { service.createAppointment(command) }
        }

        test("getAppointmentById - should return appointment when found") {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo = FakeAvailabilityRepositoryForService()
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            // When
            val result = service.getAppointmentById("d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9")

            // Then
            result shouldNotBe null
            result?.id?.value shouldBe "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9"
        }

        test("getAppointmentById - should return null when not found") {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService(appointmentExists = false)
            val availabilityRepo = FakeAvailabilityRepositoryForService()
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            // When
            val result = service.getAppointmentById("00000000-0000-0000-0000-000000000000")

            // Then
            result shouldBe null
        }

        test("getAppointmentsByFilters - should return filtered appointments") {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo = FakeAvailabilityRepositoryForService()
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            // When
            val result =
                service.getAppointmentsByFilters(
                    patientId = "pat-001",
                    doctorId = null,
                    facilityId = null,
                    status = null,
                    startDate = null,
                    endDate = null
                )

            // Then
            result shouldHaveSize 1
            result[0].patientId.value shouldBe "pat-001"
        }

        test("updateAppointment - should update appointment status successfully") {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo = FakeAvailabilityRepositoryForService()
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            val command =
                AppointmentService.UpdateAppointmentCommand(
                    id = "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9",
                    status = "CANCELLED",
                    availabilityId = null
                )

            // When
            val result = service.updateAppointment(command)

            // Then
            result shouldNotBe null
            result?.status shouldBe AppointmentStatus.CANCELLED
        }

        test("updateAppointment - should update appointment availability successfully") {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo = FakeAvailabilityRepositoryForService()
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            val command =
                AppointmentService.UpdateAppointmentCommand(
                    id = "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9",
                    status = null,
                    availabilityId = "b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7"
                )

            // When
            val result = service.updateAppointment(command)

            // Then
            result shouldNotBe null
            result?.availabilityId?.value shouldBe "b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7"
        }

        test("deleteAppointment - should delete appointment successfully") {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService()
            val availabilityRepo =
                FakeAvailabilityRepositoryForService(availabilityStatus = AvailabilityStatus.BOOKED)
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            // When
            val result = service.deleteAppointment("d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9")

            // Then
            result shouldBe true
        }

        test("deleteAppointment - should return false when appointment not found") {
            // Given
            val appointmentRepo = FakeAppointmentRepositoryForService(appointmentExists = false)
            val availabilityRepo = FakeAvailabilityRepositoryForService()
            val service = AppointmentService(appointmentRepo, availabilityRepo)

            // When
            val result = service.deleteAppointment("00000000-0000-0000-0000-000000000000")

            // Then
            result shouldBe false
        }
    })

class FakeAppointmentRepositoryForService(private val appointmentExists: Boolean = true) :
    AppointmentRepository {

    private var savedAppointment: Appointment? = null

    override suspend fun save(appointment: Appointment): Appointment {
        savedAppointment = appointment
        return appointment
    }

    override suspend fun findById(id: AppointmentId): Appointment? {
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

class FakeAvailabilityRepositoryForService(
    private val availabilityExists: Boolean = true,
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
    ): List<it.nucleo.appointments.domain.Availability> = emptyList()

    override suspend fun update(
        availability: it.nucleo.appointments.domain.Availability
    ): it.nucleo.appointments.domain.Availability? = availability

    override suspend fun checkOverlap(
        doctorId: DoctorId,
        timeSlot: TimeSlot,
        excludeId: AvailabilityId?
    ): Boolean = false
}
