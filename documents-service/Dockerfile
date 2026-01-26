FROM eclipse-temurin:22-jdk AS builder

WORKDIR /app

COPY gradlew settings.gradle.kts build.gradle.kts gradle.properties ./
COPY gradle ./gradle
COPY build-logic ./build-logic

COPY documents-service ./documents-service

RUN chmod +x gradlew && ./gradlew :documents-service:buildFatJar --no-daemon

FROM eclipse-temurin:22-jre

WORKDIR /app

COPY --from=builder /app/documents-service/build/libs/*-all.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
