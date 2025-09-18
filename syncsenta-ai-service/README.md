# SyncSenta AI Service

A Java Spring Boot microservice that provides AI-powered educational assistance using **Hedera Moonscape AI Agent** for the Kenya Education Ecosystem.

## 🏗️ Architecture

This microservice replaces Google Gemini with Hedera's decentralized AI infrastructure, providing:

- **Student AI Tutoring** - Mwalimu AI personality for personalized learning
- **Teacher Analytics** - Performance insights and classroom optimization
- **School Head Consulting** - Operational analysis and recommendations
- **County Officer Analysis** - Equity heatmaps and strategic planning

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.8+
- Hedera Moonscape AI API credentials

### Environment Setup

```bash
# Set environment variables
export HEDERA_AI_API_KEY=your_hedera_ai_api_key_here
export HEDERA_AI_BASE_URL=https://api.moonscape.hedera.com/v1

# For development
export SPRING_PROFILES_ACTIVE=development
```

### Build and Run

```bash
# Build the project
mvn clean package

# Run the service
mvn spring-boot:run

# Or run the JAR directly
java -jar target/syncsenta-ai-service-1.0.0.jar
```

The service will start on `http://localhost:8081/api`

## 📡 API Endpoints

### Student Tutoring

```bash
# Chat with Mwalimu AI
POST /api/tutor/chat
Content-Type: application/json

{
  "message": "What is photosynthesis?",
  "studentContext": {
    "gradeLevel": 8,
    "currentSubject": "Science",
    "resourceLevel": "MEDIUM",
    "schoolId": "school_123"
  }
}

# Streaming chat (Server-Sent Events)
POST /api/tutor/chat/stream
```

### Educational Analysis

```bash
# School Head Analysis
POST /api/analysis/school-head
{
  "query": "How can we improve math performance?",
  "schoolId": "school_123",
  "contextData": {
    "kpis": {...},
    "resourceInventory": {...}
  },
  "analysisType": "SCHOOL_HEAD_OPERATIONAL"
}

# County Equity Analysis
POST /api/analysis/equity
{
  "county": "Nairobi"
}

# County Strategic Analysis
POST /api/analysis/county-strategic
{
  "query": "Resource allocation strategy",
  "schoolId": "county_nairobi",
  "contextData": {...},
  "analysisType": "COUNTY_STRATEGIC"
}
```

### Health Checks

```bash
# Service health
GET /api/tutor/health
GET /api/analysis/health

# Spring Actuator
GET /api/actuator/health
GET /api/actuator/info
```

## 🔧 Configuration

### Application Properties (`application.yml`)

```yaml
hedera:
  ai:
    base-url: ${HEDERA_AI_BASE_URL:https://api.moonscape.hedera.com/v1}
    api-key: ${HEDERA_AI_API_KEY}
    timeout: 30s
    max-tokens: 1000
    temperature: 0.7

cors:
  allowed-origins: 
    - http://localhost:5173  # Vite dev server
    - https://syncsenta.netlify.app  # Production
```

### Frontend Integration

Update your React app's environment variables:

```bash
# .env.local
VITE_JAVA_AI_SERVICE_URL=http://localhost:8081/api
```

Then import the new service:

```typescript
// Replace geminiService.ts imports with:
import * as hederaService from './services/hederaJavaBackendService';

// Use the same function names as before:
const chatService = hederaService.createTutorChat(studentContext);
const analysis = await hederaService.getSchoolHeadAnalysis(query, data);
```

## 🐳 Docker Deployment

```dockerfile
# Dockerfile
FROM openjdk:21-jdk-slim
VOLUME /tmp
COPY target/syncsenta-ai-service-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
# Build and run with Docker
docker build -t syncsenta-ai-service .
docker run -p 8081:8081 \
  -e HEDERA_AI_API_KEY=your_key \
  -e HEDERA_AI_BASE_URL=https://api.moonscape.hedera.com/v1 \
  syncsenta-ai-service
```

## 🔒 Security Features

- **CORS Configuration** - Restricts access to authorized frontends
- **Input Validation** - Jakarta Validation for all request DTOs
- **Error Handling** - Graceful degradation with fallback responses
- **Environment Isolation** - Separate configs for dev/prod

## 📊 Monitoring

The service includes Spring Boot Actuator for monitoring:

- **Health Checks** - `/actuator/health`
- **Metrics** - `/actuator/metrics`
- **Info** - `/actuator/info`

## 🧪 Testing

```bash
# Run tests
mvn test

# Test with curl
curl -X POST http://localhost:8081/api/tutor/health
curl -X POST http://localhost:8081/api/tutor/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Mwalimu!","studentContext":{"gradeLevel":5,"currentSubject":"Math","resourceLevel":"MEDIUM"}}'
```

## 🔄 Migration Benefits

### From Google Gemini to Hedera Moonscape AI:

1. **Decentralized Infrastructure** - No single point of failure
2. **Cost Optimization** - Potentially lower costs than centralized providers
3. **Data Sovereignty** - Educational data stays within decentralized network
4. **Blockchain Integration** - Future integration with Hedera consensus services
5. **Performance** - Distributed AI nodes for faster responses

## 🚀 Production Deployment

### Environment Variables for Production:

```bash
export SPRING_PROFILES_ACTIVE=production
export HEDERA_AI_API_KEY=prod_api_key
export HEDERA_AI_BASE_URL=https://api.moonscape.hedera.com/v1
export SERVER_PORT=8081
```

### Scaling Considerations:

- **Load Balancing** - Multiple instances behind a load balancer
- **Rate Limiting** - Implement request rate limiting for API protection
- **Caching** - Redis cache for frequently requested analyses
- **Database** - PostgreSQL for session persistence and analytics

## 📚 Development

### Project Structure

```
src/main/java/com/syncsenta/ai/
├── SyncSentaAiApplication.java     # Main application class
├── controller/                     # REST controllers
│   ├── StudentTutorController.java
│   └── EducationAnalysisController.java
├── service/                        # Business logic
│   ├── HederaAiClientService.java
│   ├── StudentTutorService.java
│   └── EducationAnalysisService.java
└── dto/                           # Data transfer objects
    ├── ChatRequest.java
    ├── ChatResponse.java
    ├── AnalysisRequest.java
    └── AnalysisResponse.java
```

### Adding New Features

1. **Create DTOs** for request/response structures
2. **Add Service Methods** in appropriate service classes
3. **Create Controller Endpoints** with proper validation
4. **Update Frontend Service** to call new endpoints
5. **Add Tests** for all new functionality

---

**Built with ❤️ for Kenya's Education System**
**Powered by Hedera Moonscape AI Agent**
