# Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY Backend/pom.xml Backend/mvnw Backend/mvnw.cmd /app/Backend/
COPY Backend/.mvnw /app/Backend/.mvnw
RUN chmod +x /app/Backend/mvnw

COPY Backend/src /app/Backend/src

WORKDIR /app/Backend
RUN ./mvnw clean package -DskipTests

# Run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/Backend/target/Backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
