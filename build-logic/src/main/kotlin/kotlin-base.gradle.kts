import dev.detekt.gradle.extensions.DetektExtension
import org.gradle.api.plugins.JavaPluginExtension
import org.gradle.api.tasks.testing.Test
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
    testImplementation(catalog.findLibrary("testcontainers").get())
}

tasks.test {
    useJUnitPlatform()
}

val testSourceSet = extensions.getByType<JavaPluginExtension>().sourceSets.getByName("test")

val integrationTest by
    tasks.registering(Test::class) {
        description = "Runs integration tests only."
        group = LifecycleBasePlugin.VERIFICATION_GROUP

        testClassesDirs = testSourceSet.output.classesDirs
        classpath = testSourceSet.runtimeClasspath
        shouldRunAfter(tasks.test)
        useJUnitPlatform()

        filter {
            includeTestsMatching("it.nucleo.*.integration.*")
            includeTestsMatching("*IntegrationTest")
            isFailOnNoMatchingTests = false
        }
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
