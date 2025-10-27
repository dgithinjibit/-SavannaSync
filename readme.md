# SyncSenta: Kenya Education Ecosystem

A modern web application designed to enhance Kenya's education system through technology. Built with React, TypeScript, and Vite.

## Core Features

- Multi-role system (Students, Teachers, School Heads, County Officers)
- **AI-powered learning assistance with Hedera's decentralized AI infrastructure (Moonscape AI)**
- **Real-time data synchronization with HCS**
- Responsive design with Tailwind CSS

## Development Requirements

Every feature must be:
- Testable
- Implementable
- Unambiguous

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/dgithinjibit/dgithinjibit.github.io.git
cd syncsenta
```

2. Install frontend dependencies:
```bash
npm run install:frontend
```

3. Set up environment variables for the frontend:
```bash
cp .env.example frontend/.env
```

4. Add your API keys to `frontend/.env`:
```bash
VITE_JAVA_AI_SERVICE_URL=Your_Hedera_Java_AI_service_URL #(default: http://localhost:8081/api)
VITE_SUPABASE_URL=Your_Supabase_project_URL
VITE_SUPABASE_ANON_KEY=Your_Supabase_anonymous_key
```
5. Configure the backend (Java Spring Boot):
```bash
cd backend/syncsenta-ai-service
cp ../.env.example .env
```

6. Add your Hedera credentials to `backend/syncsenta-ai-service/.env`:
```bash
HEDERA_AI_API_KEY=Your_Hedera_Moonscape_AI_API_key
HEDERA_ACCOUNT_ID=Your_Hedera_testnet_account_ID
HEDERA_PRIVATE_KEY=Your_Hedera_testnet_private_key
```
7. Start the development servers:
```bash
# From the root directory
npm run dev:frontend    # Starts React app on http://localhost:5175
npm run dev:backend     # Starts Java backend on http://localhost:8081

# Or start both simultaneously (if you have concurrently installed)
npm run dev:all
```

## Available Scripts

### Frontend (React + TypeScript)
- `npm run dev:frontend` - Start React development server
- `npm run build:frontend` - Build frontend for production
- `npm run preview:frontend` - Preview frontend production build

### Backend (Java Spring Boot)
- `npm run dev:backend` - Start Java backend server
- `npm run build:backend` - Build backend JAR file
- `npm run test:backend` - Run backend tests

### Combined
- `npm run install:frontend` - Install frontend dependencies
- `npm run install:all` - Install all dependencies

## Service Management

### Starting Services
```bash
./start-services.sh
```

### Stopping Services
```bash
./stop-services.sh
```

## Project Structure
```
SavannaSync/
├── backend/                     # Backend Services
│   ├── syncsenta-ai-service/    # Java Spring Boot AI Service
│   │   ├── src/                 # Java source code
│   │   ├── target/              # Maven build artifacts
│   │   ├── .env                 # Backend environment variables
│   │   └── pom.xml              # Maven configuration
│   ├── .env.example             # Backend env template
│   ├── docker-compose.yml       # Multi-container setup
│   ├── Dockerfile               # Docker container config
│   ├── Dockerfile.simple        # Simplified Docker config
│   └── README.md                # Backend documentation
├── frontend/                    # React TypeScript Frontend
├── .env.example                 # Root environment template
├── .gitignore                   # Git ignore patterns
├── deploy-cloud.sh              # Cloud deployment script
├── package.json                 # Root workspace configuration
├── readme.md                    # This documentation
├── start-services.sh            # Start services script
└── stop-services.sh             # Stop services script
```
**Navigate to `frontend/` documentation**: [frontend](frontend/README.md)

**Navigate to `backend/` documentation**: [backend](backend/README.md)

### PHASE 0: FOUNDATION SETUP (DAY 1-2)
Critical path: Must be 100% complete before any UI work begins.

**`index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SyncSenta | Kenya Education Ecosystem</title>
    <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
    <script type="importmap">
    {
      "imports": {
        "react": "[https://esm.sh/react@19.0.0](https://esm.sh/react@19.0.0)",
        "react-dom": "[https://esm.sh/react-dom@19.0.0](https://esm.sh/react-dom@19.0.0)",
        "recharts": "[https://esm.sh/recharts@2.12.7](https://esm.sh/recharts@2.12.7)",
        "supabase": "[https://esm.sh/@supabase/supabase-js@2.42.4](https://esm.sh/@supabase/supabase-js@2.42.4)"
      }
    }
  </script>
</head>
<body>
  <div id="root" class="min-h-screen bg-gray-50"></div>
  <script type="module">
    // Phase 1 entry point will be injected here
  </script>
</body>
</html>