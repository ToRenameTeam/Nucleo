rootProject.name = "Nucleo"

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

includeBuild("build-logic")

include("appointments-service")