import dev.detekt.gradle.extensions.DetektExtension
import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension

plugins {
    kotlin("jvm")
    kotlin("plugin.serialization")
    id("com.ncorti.ktfmt.gradle")
    id("org.jetbrains.kotlinx.kover")
    id("dev.detekt")
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

kover {
    reports {
        filters {
            excludes {
                packages("it.nucleo.*.infrastructure.*")
            }
        }
    }
}

configure<DetektExtension> {
    // Keep default Detekt rules and override only selected checks in shared config.
    buildUponDefaultConfig = true
    config.setFrom(rootProject.file("detekt.yaml"))
}
