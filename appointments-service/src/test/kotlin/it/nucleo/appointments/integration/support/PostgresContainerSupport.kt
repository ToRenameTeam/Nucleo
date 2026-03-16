package it.nucleo.appointments.integration.support

import it.nucleo.appointments.infrastructure.database.DatabaseFactory
import it.nucleo.appointments.infrastructure.persistence.AppointmentsTable
import it.nucleo.appointments.infrastructure.persistence.AvailabilitiesTable
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.testcontainers.postgresql.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

private const val DATABASE_URL_PROPERTY = "DATABASE_URL"
private const val DATABASE_USER_PROPERTY = "DATABASE_USER"
private const val DATABASE_PASSWORD_PROPERTY = "DATABASE_PASSWORD"

@Suppress("DEPRECATION")
object PostgresContainerSupport {
    private val container =
        PostgreSQLContainer(DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("appointments")
            .withUsername("appointments_user")
            .withPassword("appointments_pass")

    @Volatile private var started = false

    fun start() {
        if (!started) {
            container.start()
            started = true
        }
        System.setProperty(DATABASE_URL_PROPERTY, container.jdbcUrl)
        System.setProperty(DATABASE_USER_PROPERTY, container.username)
        System.setProperty(DATABASE_PASSWORD_PROPERTY, container.password)
        DatabaseFactory.init()
    }

    fun resetDatabase() {
        transaction {
            AppointmentsTable.deleteAll()
            AvailabilitiesTable.deleteAll()
        }
    }

    fun stop() {
        if (started) {
            container.stop()
            started = false
        }
        System.clearProperty(DATABASE_URL_PROPERTY)
        System.clearProperty(DATABASE_USER_PROPERTY)
        System.clearProperty(DATABASE_PASSWORD_PROPERTY)
    }
}
