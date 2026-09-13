# Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY Backend/pom.xml /app/Backend/pom.xml
COPY Backend/src /app/Backend/src

WORKDIR /app/Backend

RUN mvn clean package -DskipTests

# Run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/Backend/target/*.jar app.jar

EXPOSE 8080

ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
