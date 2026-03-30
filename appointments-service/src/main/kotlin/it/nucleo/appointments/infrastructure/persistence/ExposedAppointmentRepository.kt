package it.nucleo.appointments.infrastructure.persistence

import it.nucleo.appointments.domain.*
import kotlinx.datetime.toJavaLocalDateTime
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.innerJoin
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update

data class CleanupStats(
    val deletedAppointments: Int,
    val deletedAvailabilities: Int
)

class ExposedAppointmentRepository : AppointmentRepository {

    private suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction { block() }

    override suspend fun save(appointment: Appointment): Appointment = dbQuery {
        AppointmentsTable.insert {
            it[appointmentId] = appointment.id.value
            it[patientId] = appointment.patientId.value
            it[availabilityId] = appointment.availabilityId.value
            it[status] = appointment.status.name
            it[createdAt] = appointment.createdAt.toJavaLocalDateTime()
            it[updatedAt] = appointment.updatedAt.toJavaLocalDateTime()
        }
        appointment
    }

    override suspend fun findById(id: AppointmentId): Appointment? = dbQuery {
        AppointmentsTable.selectAll()
            .where { AppointmentsTable.appointmentId eq id.value }
            .map { it.toAppointment() }
            .singleOrNull()
    }

    override suspend fun findByFilters(
        patientId: PatientId?,
        doctorId: DoctorId?,
        status: AppointmentStatus?
    ): List<Appointment> = dbQuery {
        var query =
            if (doctorId != null) {
                // JOIN with availabilities when filtering by doctorId
                AppointmentsTable.innerJoin(
                        AvailabilitiesTable,
                        { AppointmentsTable.availabilityId },
                        { AvailabilitiesTable.availabilityId }
                    )
                    .select(AppointmentsTable.columns)
                    .where { AvailabilitiesTable.doctorId eq doctorId.value }
            } else {
                AppointmentsTable.selectAll()
            }

        patientId?.let { query = query.andWhere { AppointmentsTable.patientId eq it.value } }
        status?.let { query = query.andWhere { AppointmentsTable.status eq it.name } }

        query.map { it.toAppointment() }
    }

    override suspend fun update(appointment: Appointment): Appointment? = dbQuery {
        val updated =
            AppointmentsTable.update({ AppointmentsTable.appointmentId eq appointment.id.value }) {
                it[patientId] = appointment.patientId.value
                it[availabilityId] = appointment.availabilityId.value
                it[status] = appointment.status.name
                it[updatedAt] = appointment.updatedAt.toJavaLocalDateTime()
            }

        if (updated > 0) appointment else null
    }

    suspend fun cleanupByDeletedUser(userId: String): CleanupStats {
        val patientCleanup = cleanupByPatientId(userId)
        val doctorCleanup = cleanupByDoctorId(userId)

        return CleanupStats(
            deletedAppointments =
                patientCleanup.deletedAppointments + doctorCleanup.deletedAppointments,
            deletedAvailabilities =
                patientCleanup.deletedAvailabilities + doctorCleanup.deletedAvailabilities
        )
    }

    suspend fun cleanupByDeletedFacility(facilityId: String): CleanupStats {
        return cleanupByAvailabilityField(AvailabilitiesTable.facilityId, facilityId)
    }

    suspend fun cleanupByDeletedServiceType(serviceTypeId: String): CleanupStats {
        return cleanupByAvailabilityField(AvailabilitiesTable.serviceTypeId, serviceTypeId)
    }

    private suspend fun cleanupByPatientId(patientId: String): CleanupStats = dbQuery {
        val deletedAppointments =
            AppointmentsTable.deleteWhere { AppointmentsTable.patientId eq patientId }

        CleanupStats(
            deletedAppointments = deletedAppointments,
            deletedAvailabilities = 0
        )
    }

    private suspend fun cleanupByDoctorId(doctorId: String): CleanupStats =
        cleanupByAvailabilityField(AvailabilitiesTable.doctorId, doctorId)

    private suspend fun cleanupByAvailabilityField(
        field: org.jetbrains.exposed.sql.Column<String>,
        value: String
    ): CleanupStats = dbQuery {
        val availabilityIds =
            AvailabilitiesTable.select(AvailabilitiesTable.availabilityId)
                .where { field eq value }
                .map { it[AvailabilitiesTable.availabilityId] }

        val deletedAppointments =
            if (availabilityIds.isEmpty()) {
                0
            } else {
                AppointmentsTable.deleteWhere { AppointmentsTable.availabilityId inList availabilityIds }
            }

        val deletedAvailabilities = AvailabilitiesTable.deleteWhere { field eq value }

        CleanupStats(
            deletedAppointments = deletedAppointments,
            deletedAvailabilities = deletedAvailabilities
        )
    }
}
