FROM maven:3.9.5-eclipse-temurin-11 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/doctor-service-1.0.0.jar app.jar
COPY --from=build /app/src/main/resources/config.yml config.yml
EXPOSE 8083
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar", "server", "config.yml"]
