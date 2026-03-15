plugins {
    id("ktor")
    alias(libs.plugins.ktor)
}

dependencies {
    implementation(libs.ktor.server.call.logging)
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.java.time)
    implementation(libs.hikari)
    implementation(libs.postgresql)
    implementation(libs.kotlinx.datetime)
}

application {
    mainClass.set("it.nucleo.ApplicationKt")
}