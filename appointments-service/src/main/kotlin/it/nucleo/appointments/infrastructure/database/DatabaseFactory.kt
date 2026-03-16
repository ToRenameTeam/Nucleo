package it.nucleo.appointments.infrastructure.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import it.nucleo.appointments.infrastructure.persistence.AppointmentsTable
import it.nucleo.appointments.infrastructure.persistence.AvailabilitiesTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

private const val MAX_DB_POOL_SIZE = 10

object DatabaseFactory {
    private val logger = LoggerFactory.getLogger(DatabaseFactory::class.java)

    fun init() {
        logger.info("Initializing database connection...")
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
                    configValue("DATABASE_URL", "jdbc:postgresql://localhost:5432/appointments")
                driverClassName = "org.postgresql.Driver"
                username = configValue("DATABASE_USER", "appointments_user")
                password = configValue("DATABASE_PASSWORD", "appointments_pass")
                maximumPoolSize = MAX_DB_POOL_SIZE
                isAutoCommit = false
                transactionIsolation = "TRANSACTION_REPEATABLE_READ"
                validate()
            }
        logger.info("HikariCP data source configured")
        return HikariDataSource(config)
    }

    private fun configValue(key: String, default: String): String {
        return System.getenv(key) ?: System.getProperty(key) ?: default
    }
}
