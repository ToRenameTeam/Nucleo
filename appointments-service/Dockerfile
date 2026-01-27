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

COPY --from=build /app/appointments-service/build/libs/*-all.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
