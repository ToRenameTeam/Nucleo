FROM eclipse-temurin:22-jdk AS builder

WORKDIR /app

COPY gradlew settings.gradle.kts build.gradle.kts gradle.properties ./
COPY gradle ./gradle
COPY build-logic ./build-logic

COPY appointments-service ./appointments-service

RUN chmod +x gradlew && ./gradlew :appointments-service:buildFatJar --no-daemon

FROM eclipse-temurin:22-jre-alpine

WORKDIR /app

COPY --from=builder /app/appointments-service/build/libs/*-all.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
