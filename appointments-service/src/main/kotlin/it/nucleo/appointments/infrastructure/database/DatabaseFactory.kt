package it.nucleo.appointments.infrastructure.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import it.nucleo.appointments.infrastructure.persistence.AvailabilitiesTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    
    fun init() {
        val database = Database.connect(createHikariDataSource())
        
        transaction(database) {
            SchemaUtils.create(AvailabilitiesTable)
        }
    }
    
    private fun createHikariDataSource(): HikariDataSource {
        val config = HikariConfig().apply {
            jdbcUrl = System.getenv("DATABASE_URL") 
                ?: "jdbc:postgresql://localhost:5432/appointments"
            driverClassName = "org.postgresql.Driver"
            username = System.getenv("DATABASE_USER") ?: "appointments_user"
            password = System.getenv("DATABASE_PASSWORD") ?: "appointments_pass"
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        return HikariDataSource(config)
    }
}
