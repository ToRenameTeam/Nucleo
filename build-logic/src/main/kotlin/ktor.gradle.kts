plugins {
    id("kotlin-base")
}

val catalog: VersionCatalog = extensions.getByType<VersionCatalogsExtension>().named("libs")

dependencies {
    implementation(project(":commons"))
    implementation(catalog.findLibrary("ktor-server-core").get())
    implementation(catalog.findLibrary("ktor-server-netty").get())
    implementation(catalog.findLibrary("ktor-server-content-negotiation").get())
    implementation(catalog.findLibrary("ktor-serialization-kotlinx-json").get())
    implementation(catalog.findLibrary("ktor-server-status-pages").get())
    implementation(catalog.findLibrary("ktor-server-cors").get())
    implementation(catalog.findLibrary("logback").get())

    testImplementation(catalog.findLibrary("ktor-server-test-host").get())
}
