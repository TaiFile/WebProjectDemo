# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 3000

ENTRYPOINT ["java", "-jar", "app.jar"]
