FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

ARG JAVA_VERSION=22
ARG GRADLE_VERSION=8.14

# ── 1. Eclipse Temurin JDK 22 (Adoptium APT repository) ──────────
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    wget apt-transport-https gnupg \
    && wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public \
    | gpg --dearmor -o /usr/share/keyrings/adoptium.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] \
    https://packages.adoptium.net/artifactory/deb $(. /etc/os-release && echo $VERSION_CODENAME) main" \
    > /etc/apt/sources.list.d/adoptium.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends temurin-${JAVA_VERSION}-jdk \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/temurin-${JAVA_VERSION}-jdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# ── 2. Gradle 8.14 ───────────────────────────────────────────────
RUN wget -qO /tmp/gradle.zip \
    "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" \
    && unzip -qd /opt /tmp/gradle.zip \
    && rm /tmp/gradle.zip \
    && ln -s /opt/gradle-${GRADLE_VERSION} /opt/gradle

ENV GRADLE_HOME=/opt/gradle
ENV PATH="${GRADLE_HOME}/bin:${PATH}"
