# Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY backend/pom.xml backend/mvnw backend/mvnw.cmd /app/backend/
COPY backend/.mvn /app/backend/.mvn
RUN chmod +x /app/backend/mvnw

COPY backend/src /app/backend/src

WORKDIR /app/backend
RUN ./mvnw clean package -DskipTests

# Run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
