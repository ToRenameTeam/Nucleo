import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension

plugins {
    kotlin("jvm")
    id("com.ncorti.ktfmt.gradle")
}

val javaVersion: String by project

configure<KotlinJvmProjectExtension> {
    jvmToolchain(javaVersion.toInt())
}

ktfmt {
    kotlinLangStyle()
}