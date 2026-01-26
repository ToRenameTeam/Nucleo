import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension

plugins {
    kotlin("jvm")
}

val javaVersion: String by project

configure<KotlinJvmProjectExtension> {
    jvmToolchain(javaVersion.toInt())
}