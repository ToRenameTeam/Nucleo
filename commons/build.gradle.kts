plugins {
    id("kotlin-base")
}

val catalog: VersionCatalog = extensions.getByType<VersionCatalogsExtension>().named("libs")

dependencies {
    api(catalog.findLibrary("ktor-server-core").get())
    api(catalog.findLibrary("ktor-server-status-pages").get())
    api(catalog.findLibrary("ktor-server-cors").get())
    api(catalog.findLibrary("ktor-server-content-negotiation").get())
    api(catalog.findLibrary("ktor-serialization-kotlinx-json").get())
    api(catalog.findLibrary("logback").get())
}