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
\`\`\`bash
git clone https://github.com/dgithinjibit/dgithinjibit.github.io.git
cd syncsenta
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Add your API keys to `.env`:
- `VITE_JAVA_AI_SERVICE_URL` - Your Hedera Java AI service URL
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking

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