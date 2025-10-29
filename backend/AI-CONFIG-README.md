# Hedera AI Agent - OpenAI Exclusive Configuration

## Overview

The **Hedera AI Agent** is now configured to use **OpenAI exclusively** as the LLM provider. This simplified approach provides consistent performance and easier maintenance while leveraging Hedera's decentralized infrastructure for blockchain features.

## Simplified Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Hedera AI      │    │   OpenAI API    │
│   (React)       │───▶│     Agent       │───▶│   (gpt-3.5)     │
│                 │    │   (Java)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Hedera Network  │
                       │ (Optional)      │
                       └─────────────────┘
```

## Quick Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy your API key

### 2. Configure Environment

Edit `backend/.env` and add your OpenAI API key:

```bash
# Required: OpenAI LLM Provider
OPENAI_API_KEY=sk-your_actual_openai_api_key_here

# Optional: Hedera Network (for blockchain features)
HEDERA_ACCOUNT_ID=<HEDERA_TESTNET_ACCOUNT_ID>
HEDERA_PRIVATE_KEY="HEDERA_TESTNET_PRIVATE_KEY"
```

### 3. Start the Service

```bash
cd backend/syncsenta-ai-service
mvn spring-boot:run
```

### 4. Test the Configuration

```bash
# Test health endpoint
curl http://localhost:8081/api/tutor/health

# Test chat with Mwalimu AI Tutor
curl -X POST http://localhost:8081/api/tutor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Jambo Mwalimu! Can you help me with math?",
    "studentContext": {
      "gradeLevel": 5,
      "currentSubject": "Mathematics",
      "resourceLevel": "MEDIUM"
    }
  }'
```

## Supported LLM Provider

### Exclusive Provider: OpenAI
```bash
OPENAI_API_KEY=sk-your_openai_key_here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4, gpt-4-turbo
OPENAI_MAX_TOKENS=1500      # Customize as needed
OPENAI_TEMPERATURE=0.7      # Creativity level (0-1)
```

**Why OpenAI Only?**
- **Reliability**: Proven API stability
- **Performance**: Consistent response quality  
- **Simplicity**: Single provider, easier maintenance
- **Features**: Streaming support included
- **Cost**: Predictable pricing model

## Configuration Details

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | **Yes** | - |
| `OPENAI_MODEL` | Model to use | No | `gpt-3.5-turbo` |
| `OPENAI_MAX_TOKENS` | Max response length | No | `1500` |
| `OPENAI_TEMPERATURE` | Creativity (0-1) | No | `0.7` |
| `HEDERA_ACCOUNT_ID` | Hedera account (optional) | No | - |
| `HEDERA_PRIVATE_KEY` | Hedera private key (optional) | No | - |
| `SPRING_PROFILES_ACTIVE` | Active profile | No | `development` |

## Features

### What Works
- **OpenAI Integration** - Exclusive use of OpenAI's GPT models
- **Streaming Responses** - Real-time chat with OpenAI
- **Student Tutoring** - Mwalimu AI for Kenyan education
- **Educational Analysis** - Data insights and reporting
- **Error Handling** - Graceful fallbacks for API issues
- **Hedera Integration** - Optional blockchain features

### Simplified Benefits
- **Consistent Performance** - Single provider reliability
- **Predictable Costs** - Only OpenAI billing
- **Easier Debugging** - Focused error handling
- **Better Maintenance** - Reduced configuration complexity

## Troubleshooting

### Service Won't Start
```bash
# Check configuration
cd backend/syncsenta-ai-service
mvn spring-boot:run
# Look for "Hedera AI Agent initialized with [Provider] LLM Provider"
```

### Common Issues

#### "No LLM API keys configured"
```bash
# Add to backend/.env
OPENAI_API_KEY=sk-your_actual_key_here
```

#### "401 Unauthorized"
- Verify your OpenAI API key is correct
- Check your OpenAI account has credits
- Ensure key starts with `sk-`

#### "Model not found"
```bash
# Use supported OpenAI models
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4, gpt-4-turbo
```

#### CORS Errors
- Frontend URL should be in `CORS_ALLOWED_ORIGINS`
- Default: `http://localhost:5173`

## Usage Examples

### Student Chat
```bash
curl -X POST http://localhost:8081/api/tutor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain fractions to me",
    "studentContext": {
      "gradeLevel": 4,
      "currentSubject": "Mathematics",
      "resourceLevel": "LOW"
    }
  }'
```

### Educational Analysis
```bash
curl -X POST http://localhost:8081/api/analysis/equity \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Nairobi",
    "timeframe": "2024-Q1",
    "metrics": ["enrollment", "performance", "resources"]
  }'
```

## Useful Links

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Hedera Documentation](https://docs.hedera.com/) (optional)
- [SyncSenta Frontend](http://localhost:5173)

## Support

If you encounter issues:
1. Check the startup logs for "Hedera AI Agent initialized with OpenAI LLM Provider"
2. Verify your OpenAI API key is valid and has credits
3. Ensure `OPENAI_API_KEY` environment variable is set
4. Test with `curl` commands above

## Success!

When properly configured, you should see:
```
Hedera AI Agent initialized with OpenAI LLM Provider
Base URL: https://api.openai.com/v1
Model: gpt-3.5-turbo
OpenAI API key configured - Primary LLM provider
```