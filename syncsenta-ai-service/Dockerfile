# Use OpenJDK 21 as the base image
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create runtime image
FROM openjdk:21-jre-slim

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN groupadd -r syncsenta && useradd -r -g syncsenta syncsenta

# Copy the JAR file from build stage
COPY --from=0 /app/target/syncsenta-ai-service-1.0.0.jar app.jar

# Change ownership to non-root user
RUN chown syncsenta:syncsenta app.jar

# Switch to non-root user
USER syncsenta

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8081/api/actuator/health || exit 1

# Set JVM options for production
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
