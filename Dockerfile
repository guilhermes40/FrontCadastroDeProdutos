#ETAPA 1 BUILD COM MAVEN
FROM maven:3.9.11-eclipse-temurin-24 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

#ETAPA 2 RUNTIME COM JDK LEVE
FROM eclipse-temurin:24-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]