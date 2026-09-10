FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

COPY pom.xml .
COPY src src
COPY uploads uploads

RUN mvn clean package -DskipTests

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
COPY --from=build /app/uploads uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]