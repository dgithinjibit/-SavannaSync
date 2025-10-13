# SyncSenta Frontend

React TypeScript frontend for the Kenya Education Ecosystem platform, featuring a multi-role system with AI-powered learning assistance through Hedera's decentralized infrastructure.

## 🏗️ Project Structure

```
frontend/
├── components/                  # Reusable UI Components
│   ├── AuthPage.tsx            # Authentication page with login/register forms
│   ├── DataCard.tsx            # Data visualization cards for metrics display
│   ├── ErrorBoundary.jsx       # React error boundary for graceful error handling
│   ├── GlobalErrorBoundary.tsx # Global error boundary with TypeScript
│   ├── Header.tsx              # Application header with navigation
│   ├── Icons.tsx               # SVG icon components library
│   ├── LoadingSpinner.tsx      # Loading indicators and spinners
│   └── Sidebar.tsx             # Navigation sidebar with role-based menu
├── contexts/                   # React Context Providers
│   └── AuthContext.tsx         # Authentication state and user management
├── hooks/                      # Custom React Hooks
│   └── useAuth.ts              # Authentication hook with Supabase integration
├── services/                   # External API Services
│   ├── authService.ts          # Supabase authentication service
│   ├── dataService.ts          # Data fetching and caching utilities
│   ├── geminiService.ts        # Google Gemini AI integration
│   ├── hederaJavaBackendService.ts # Hedera backend API communication
│   ├── schoolService.ts        # School management operations
│   └── supabaseClient.ts       # Supabase client configuration
├── src/                        # Additional Source Files
│   └── env.d.ts                # TypeScript environment declarations
├── types/                      # TypeScript Type Definitions
│   └── global.d.ts             # Global type declarations
├── views/                      # Page-Level Components
│   ├── auth/                   # Authentication Views
│   │   └── ResetPasswordView.tsx
│   ├── county_officer/         # County Officer Dashboard
│   │   ├── AddSchoolView.tsx   # School registration interface
│   │   └── CountyOfficeView.tsx # County-level analytics dashboard
│   ├── school_head/            # School Head Management
│   │   └── SchoolHeadView.tsx  # School administration interface
│   ├── students/               # Student Portal
│   │   ├── StudentProfileModal.tsx # Student profile management
│   │   ├── StudentSetupView.tsx    # Student onboarding
│   │   └── StudentView.tsx     # Main student dashboard
│   └── teacher/                # Teacher Dashboard
│       └── TeacherView.tsx     # Teacher tools and analytics
├── .env                        # Environment Variables
├── App.tsx                     # Main Application Component
├── constants.ts                # Application Constants & Configuration
├── index.html                  # HTML Template
├── index.tsx                   # Application Entry Point
├── metadata.json              # Application Metadata
├── netlify.toml               # Netlify Deployment Configuration
├── package.json               # Dependencies & Scripts
├── tsconfig.json              # TypeScript Configuration
├── types.ts                   # Global Type Definitions
└── vite.config.ts             # Vite Build Configuration
```

## 🎯 Key Features

### Multi-Role System
- **Students**: AI-powered tutoring with Mwalimu assistant
- **Teachers**: Performance analytics and classroom management
- **School Heads**: Operational insights and resource optimization
- **County Officers**: Equity analysis and strategic planning

### AI Integration
- **Hedera Moonscape AI**: Decentralized AI infrastructure
- **Google Gemini**: Additional AI capabilities
- **Personalized Learning**: Adaptive tutoring system
- **Real-time Analytics**: Performance insights and recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Environment variables configured in `.env`

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

Create `.env` file with:
```env
VITE_JAVA_AI_SERVICE_URL=http://localhost:8081/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Supabase** for authentication and database
- **Tailwind CSS** for styling (via CDN)
- **Recharts** for data visualization
- **Hedera Moonscape AI** for AI services

## 🏛️ Architecture Patterns

### Component Organization
- **components/**: Reusable, presentational components
- **views/**: Page-level components organized by user role
- **contexts/**: React context providers for global state
- **hooks/**: Custom hooks for logic reuse
- **services/**: External API integration layers

### State Management
- **React Context**: For authentication and user state
- **Local State**: Component-level state with useState/useReducer
- **Custom Hooks**: For shared stateful logic

### Data Flow
```
Views → Hooks → Services → External APIs
  ↓       ↓        ↓
Contexts ← Components ← Types
```

## 🔧 Development Guidelines

### Code Organization
- One component per file
- Co-locate related files
- Use TypeScript for all new code
- Follow React best practices

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase with `Service` suffix (`authService.ts`)
- **Types**: PascalCase (`UserRole`, `StudentData`)

### Component Structure
```typescript
// Component imports
import React from 'react';

// Type imports
import type { ComponentProps } from '../types';

// Service imports
import { someService } from '../services';

// Component definition
export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div className="component-styles">
      {/* JSX content */}
    </div>
  );
};
```

## 🎨 Styling Approach

- **Tailwind CSS**: Utility-first CSS framework loaded via CDN
- **Component-Scoped**: Styles defined within components
- **Responsive Design**: Mobile-first approach
- **Design System**: Consistent spacing, colors, and typography

## 🧪 Testing Strategy

- **Unit Tests**: Individual component testing
- **Integration Tests**: User interaction flows
- **E2E Tests**: Complete user journeys
- **Accessibility Tests**: WCAG compliance

## 📱 User Roles & Views

### Students (`views/students/`)
- **StudentView.tsx**: Main dashboard with AI tutor
- **StudentSetupView.tsx**: Onboarding and profile setup
- **StudentProfileModal.tsx**: Profile management

### Teachers (`views/teacher/`)
- **TeacherView.tsx**: Classroom analytics and student insights

### School Heads (`views/school_head/`)
- **SchoolHeadView.tsx**: School-wide operational analytics

### County Officers (`views/county_officer/`)
- **CountyOfficeView.tsx**: Regional education insights
- **AddSchoolView.tsx**: New school registration

### Authentication (`views/auth/`)
- **ResetPasswordView.tsx**: Password reset functionality

## 🔌 API Integration

### Services Layer
- **authService.ts**: Supabase authentication
- **hederaJavaBackendService.ts**: Hedera AI backend
- **geminiService.ts**: Google Gemini AI
- **schoolService.ts**: School data management
- **dataService.ts**: General data operations

### Error Handling
- Global error boundaries for React errors
- Service-level error handling with user-friendly messages
- Network error retry mechanisms

## 🚀 Deployment

### Build Process
```bash
npm run build
```
Generates optimized static files in `dist/` directory.

### Netlify Configuration
- **netlify.toml**: Deployment and redirect rules
- **Environment Variables**: Set in Netlify dashboard
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

## 📈 Performance Considerations

- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Vite's built-in optimizations
- **Asset Optimization**: Automatic image and CSS optimization
- **Caching Strategy**: Service worker for offline capabilities

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Test your changes thoroughly
5. Update documentation as needed

---

**Built with ❤️ for Kenya's Education System**  
**Powered by Hedera Moonscape AI & Supabase**