FROM gradle:8-jdk22 AS build
WORKDIR /app

COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY gradle ./gradle
COPY gradlew ./
COPY build-logic ./build-logic

COPY appointments-service ./appointments-service

RUN ./gradlew :appointments-service:build -x test --no-daemon

FROM eclipse-temurin:22-jre-alpine
WORKDIR /app

COPY --from=build /app/appointments-service/build/libs/*.jar app.jar
COPY --from=build /app/appointments-service/build/classes/kotlin/main /app/classes

EXPOSE 8080

ENTRYPOINT ["java", "-cp", "app.jar:classes", "it.nucleo.MainKt"]
