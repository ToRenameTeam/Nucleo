plugins {
    id("ktor")
    alias(libs.plugins.ktor)
}

dependencies {
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.mongodb.driver.kotlin.coroutine)
    implementation(libs.mongodb.bson.kotlinx)
    implementation(libs.minio)
    implementation(libs.pdfbox)

    testImplementation(libs.ktor.client.content.negotiation)
}

application {
    mainClass.set("it.nucleo.ApplicationKt")
}