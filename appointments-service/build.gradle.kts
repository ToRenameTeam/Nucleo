plugins {
    id("kotlin-base")
    alias(libs.plugins.ktor)
}

dependencies {
    // Ktor Server
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.server.call.logging)

    // Database
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.java.time)
    implementation(libs.hikari)
    implementation(libs.postgresql)

    // DateTime
    implementation(libs.kotlinx.datetime)
    
    // Logging
    implementation(libs.logback)

    // Testing
    testImplementation(libs.kotest)
    testImplementation(libs.ktor.server.test.host)
}

application {
    mainClass.set("it.nucleo.ApplicationKt")
}