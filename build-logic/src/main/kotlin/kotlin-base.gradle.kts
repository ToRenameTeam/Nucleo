import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension

plugins {
    kotlin("jvm")
    kotlin("plugin.serialization")
    id("com.ncorti.ktfmt.gradle")
}

val catalog: VersionCatalog = extensions.getByType<VersionCatalogsExtension>().named("libs")

dependencies {
    testImplementation(catalog.findLibrary("kotest").get())
}

tasks.test {
    useJUnitPlatform()
}

val javaVersion: String by project

configure<KotlinJvmProjectExtension> {
    jvmToolchain(javaVersion.toInt())
}

ktfmt {
    kotlinLangStyle()
}