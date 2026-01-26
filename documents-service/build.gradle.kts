plugins {
    id("kotlin-base")
    alias(libs.plugins.ktor)
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
}

application {
    mainClass.set("it.nucleo.ApplicationKt")
}