# ---------- Build Stage ----------
FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

# Copy Maven configuration first for better Docker layer caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the Spring Boot application
RUN mvn clean package -DskipTests


# ---------- Runtime Stage ----------
FROM eclipse-temurin:25-jre

WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Spring Boot application port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]