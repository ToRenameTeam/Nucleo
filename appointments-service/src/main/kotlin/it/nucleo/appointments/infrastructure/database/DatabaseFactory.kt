package it.nucleo.appointments.infrastructure.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import it.nucleo.appointments.infrastructure.persistence.AppointmentsTable
import it.nucleo.appointments.infrastructure.persistence.AvailabilitiesTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

object DatabaseFactory {
    private val logger = LoggerFactory.getLogger(DatabaseFactory::class.java)

    fun init() {
        logger.info("Initializing database connection...")
        logger.info(
            "Database URL: ${System.getenv("DATABASE_URL") ?: "jdbc:postgresql://localhost:5432/appointments"}"
        )
        logger.info("Database User: ${System.getenv("DATABASE_USER") ?: "appointments_user"}")

        val database = Database.connect(createHikariDataSource())
        logger.info("Database connection established")

        transaction(database) {
            logger.info("Creating database schema if not exists...")
            SchemaUtils.create(AvailabilitiesTable, AppointmentsTable)
            logger.info("Database schema created/verified")
        }
        logger.info("Database initialization completed")
    }

    private fun createHikariDataSource(): HikariDataSource {
        logger.info("Creating HikariCP data source...")
        val config =
            HikariConfig().apply {
                jdbcUrl =
                    System.getenv("DATABASE_URL") ?: "jdbc:postgresql://localhost:5432/appointments"
                driverClassName = "org.postgresql.Driver"
                username = System.getenv("DATABASE_USER") ?: "appointments_user"
                password = System.getenv("DATABASE_PASSWORD") ?: "appointments_pass"
                maximumPoolSize = 10
                isAutoCommit = false
                transactionIsolation = "TRANSACTION_REPEATABLE_READ"
                validate()
            }
        logger.info("HikariCP data source configured")
        return HikariDataSource(config)
    }
}
