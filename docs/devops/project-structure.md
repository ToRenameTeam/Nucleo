# Project Structure

The project is organized as a **monorepo**, accommodating services written in different languages and runtimes: JVM-based microservices in Kotlin, Node.js services in TypeScript, and a Python service. This approach keeps all components in a single repository while allowing each to use the most appropriate toolchain.

Build tooling is split by ecosystem: **Gradle** is used for JVM projects, **pnpm** for Node.js projects, and **uv** for the Python service.

The repository is structured into the following subprojects:

- `appointments-service` (JVM): manages medical appointments.
- `documents-service` (JVM): manages medical documents.
- `ai-service` (Python): AI companion to `documents-service`, responsible for document analysis.
- `users-service` (Node.js): manages user accounts and authentication.
- `master-data-service` (Node.js): provides master/reference data.
- `frontend-service` (Node.js): serves the frontend application.
- `commons` (JVM): shared code consumed by JVM-based microservices.

## Shared Build Logic

To avoid duplicating build configuration across JVM microservices, shared logic is centralized in the `build-logic` directory — a standard Gradle convention for defining reusable build plugins as an included build. Plugins declared here are available to all subprojects without being published to an external repository.

Two convention plugins are defined:

- **`kotlin-base.gradle.kts`**: establishes the Kotlin baseline for all JVM projects.
- **`nucleo-services.gradle.kts`**: extends `kotlin-base` and adds the dependencies common to every microservice. Each microservice only needs to declare its own specific dependencies on top of this shared baseline.

A microservice's build file is therefore minimal. For example, `documents-service` only declares its own dependencies (MongoDB driver, MinIO, PDFBox, etc.) while all cross-cutting concerns are inherited:

```kotlin
// documents-service/build.gradle.kts
plugins {
    id("nucleo-services")
    // ...
}

dependencies {
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.mongodb.driver.kotlin.coroutine)
    implementation(libs.mongodb.bson.kotlinx)
    implementation(libs.minio)
    implementation(libs.pdfbox)
    // ...
}

application {
    mainClass.set("it.nucleo.ApplicationKt")
}
```

## Dependencies Declaration

All dependency versions for JVM projects are centralized in a [Gradle version catalog](https://docs.gradle.org/current/userguide/version_catalogs.html) located at `gradle/libs.versions.toml`. This single file defines library coordinates and versions, which are then referenced across all subproject build files via the `libs` accessor.

For Node.js projects, the equivalent is the [pnpm catalog](https://pnpm.io/catalogs) feature, configured in `pnpm-workspace.yaml`. It serves the same purpose — a single source of truth for package versions shared across all Node.js workspaces.

Both mechanisms ensure dependency versions are declared once and consistently applied throughout the monorepo, avoiding version drift between services.