# SyncSenta: Kenya Education Ecosystem

A modern web application designed to enhance Kenya's education system through technology. Built with React, TypeScript, and Vite.

## Core Features

- Multi-role system (Students, Teachers, School Heads, County Officers)
- AI-powered learning assistance with Google's Gemini
- Real-time data synchronization with Supabase
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
- `VITE_GEMINI_API_KEY` - Your Google Gemini API key
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
  <!-- TAILWIND CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- IMPORTMAP - NO BUNDLERS -->
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@19.0.0",
        "react-dom": "https://esm.sh/react-dom@19.0.0",
        "recharts": "https://esm.sh/recharts@2.12.7",
        "supabase": "https://esm.sh/@supabase/supabase-js@2.42.4",
        "gemini": "https://esm.sh/@google/generative-ai@0.15.0"
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
```

**`authService.ts`**
```javascript
// CONTRACT: All methods return Promise<{ data: any, error: string | null }>
export const authService = {
  signUp: (email: string, password: string, role: 'STUDENT'|'TEACHER'|'SCHOOL_HEAD') => {
    // VALIDATION RULES (NON-NEGOTIABLE):
    // 1. Email must be @kenya.go.ke or @school.ac.ke for non-students
    // 2. Password min 12 chars with 1 number + 1 symbol
    // 3. Role must be ENUM (no strings)
  },
  signInWithWallet: (walletAddress: string) => {
    // MOCK IMPLEMENTATION: 
    // - Returns { role: 'COUNTY_OFFICER', school_id: 'CO-KE-001' } 
    // - ONLY for walletAddress starting with "0xKENYA"
  },
  getProfile: () => {
    // RETURNS: 
    // { 
    //   id: "user_123", 
    //   role: "TEACHER", 
    //   school_id: "SCH-KE-456", 
    //   resource_level: "low" | "medium" | "high" 
    // }
  }
}
```

**`dataService.ts`**
```javascript
// RULE: ALL MOCK DATA MUST BE DETERMINISTIC BASED ON school_id
export const dataService = {
  // STUDENT VIEW
  getStudentContext: (school_id: string) => ({
    resource_level: school_id.endsWith('LR') ? 'low' : 'medium', // LR = Low Resource
    current_subject: 'Mathematics', // Rotates daily
    grade_level: parseInt(school_id.slice(-2)) % 8 + 1 // 1-8
  }),
  
  // TEACHER VIEW
  getTeacherData: (school_id: string) => ({
    classes: [
      { id: 'cls_1', name: `Grade ${Math.floor(Math.random()*3)+4} - Stream A`, student_count: 42 },
      { id: 'cls_2', name: `Grade ${Math.floor(Math.random()*3)+4} - Stream B`, student_count: 38 }
    ],
    // ATTENDANCE: 70% present by default (mocks real-world absenteeism)
    attendance: Array(30).fill({ 
      name: `Student ${String.fromCharCode(65 + i)}`, 
      morning: Math.random() > 0.3, 
      evening: Math.random() > 0.5 
    })
  }),
  
  // COUNTY OFFICER VIEW
  getCountyData: (county_id: string) => ({
    schools: Array(15).fill(null).map((_, i) => ({
      id: `SCH-${county_id}-${i}`,
      name: `School ${i+1}`,
      resource_level: ['low','medium','high'][i % 3],
      avg_score: 45 + Math.floor(Math.random() * 30) // 45-75%
    }))
  })
}
```

**`geminiService.ts`**
```javascript
// RULE: ALL PROMPTS MUST INCLUDE CBC CURRICULUM REFERENCES
export const geminiService = {
  createTutorChat: (studentContext: ReturnType<typeof dataService.getStudentContext>) => ({
    systemInstruction: `
      ROLE: Socratic Tutor for Kenyan CBC Curriculum
      RULES:
      1. NEVER provide answers - only guiding questions
      2. ADAPT to resource_level: 
         - low: Use storytelling ("Imagine you're dividing mangoes...")
         - medium: Relatable analogies ("Think of fractions like sharing chapati...")
         - high: Textbook-aligned methods
      3. ALWAYS reference CBC code: e.g. "As per CBC Strand 3.2.1..."
      4. MAX 2 sentences per response
      CURRENT CONTEXT: Grade ${studentContext.grade_level}, ${studentContext.current_subject}
    `,
    stream: (query: string) => /* ... */
  }),
  
  generateEquityHeatmap: (countyData: any) => ({
    // CRITICAL: Must return EXACTLY this structure
    responseSchema: {
      type: 'object',
      properties: {
        heatmap: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ward: { type: 'string' },
              resource_level: { enum: ['low','medium','high'] },
              avg_score: { type: 'number', minimum: 0, maximum: 100 },
              correlation: { type: 'string', enum: ['strong','moderate','weak'] }
            }
          }
        }
      }
    },
    prompt: `
      Analyze correlation between resource levels and student scores for ${countyData.schools.length} schools.
      OUTPUT FORMAT: JSON matching responseSchema. NO EXPLANATIONS.
      CBC REFERENCE: Use EMIS data guidelines section 4.2
    `
  })
}
```

### StudentView.tsx
```javascript
// VALIDATION CHECKLIST (MUST PASS):
// [ ] Full-screen (100vh) with NO sidebar
// [ ] Text size ≥16px (test on mobile)
// [ ] Every response ends with question mark
// [ ] Resource adaptation verified via console.log("ADAPT: low-resource mode")

export default function StudentView() {
  const { school_id } = useAuth(); // From AuthContext
  const studentContext = dataService.getStudentContext(school_id);
  const { messages, sendMessage } = useChat(
    geminiService.createTutorChat(studentContext)
  );

  return (
    <div className="h-screen p-4 bg-white">
      {/* STRICT RULE: NO NAVIGATION ELEMENTS */}
      {messages.map((m) => (
        <div key={m.id} className="mb-4">
          <div className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'ml-auto bg-blue-100' : 'bg-gray-100'}`}>
            {m.content}
          </div>
        </div>
      ))}
      <ChatInput 
        onSubmit={sendMessage}
        placeholder="Ask your Mwalimu tutor..." 
      />
    </div>
  );
}
```

### TeacherView.tsx
```javascript
// VALIDATION CHECKLIST:
// [ ] Dashboard shows EXACTLY 4 DataCards (no more/less)
// [ ] Attendance state persists on page refresh
// [ ] All AI requests include grade level + subject

export default function TeacherView() {
  const [activeTab, setActiveTab] = useState<'dashboard'|'classes'|'tasks'|'ai'>('dashboard');
  const { school_id } = useAuth();
  const teacherData = dataService.getTeacherData(school_id);

  return (
    <div className="flex h-screen">
      <Sidebar 
        items={[
          { label: "Dashboard", icon: "📊", active: activeTab === 'dashboard', onClick: () => setActiveTab('dashboard') },
          { label: "My Hub", icon: "🏫", active: ['classes','tasks','ai'].includes(activeTab), 
            subItems: [
              { label: "My Classes", onClick: () => setActiveTab('classes') },
              { label: "Tasks", onClick: () => setActiveTab('tasks') },
              { label: "AI Assistant", onClick: () => setActiveTab('ai') }
            ]
          }
        ]}
      />
      
      <main className="flex-1 p-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataCard title="Total Classes" value={teacherData.classes.length} icon="📚" />
            <DataCard title="Total Students" value={teacherData.classes.reduce((sum, c) => sum + c.student_count, 0)} icon="🎓" />
            <DataCard title="Upcoming Tasks" value="3" icon="✅" />
            <DataCard title="Avg. Performance" value="68%" icon="📈" change="+2.1%" />
            
            <div className="col-span-full h-80">
              <BarChart 
                data={teacherData.classes.map(c => ({
                  name: c.name,
                  score: 65 + Math.random() * 20 // Mock performance
                }))}
                // RECHARTS CONFIG (NON-NEGOTIABLE)
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teacherData.classes.map(cls => (
              <ClassCard 
                key={cls.id}
                className={cls.name}
                studentCount={cls.student_count}
                onClick={() => navigate(`/register/${cls.id}`)}
              />
            ))}
          </div>
        )}
        
        {activeTab === 'classes_detail' && (
          <StudentRegister 
            students={teacherData.attendance}
            // PERSISTENCE RULE: Uses localStorage for attendance
            onAttendanceChange={(studentId, session, present) => {
              const updated = /* ... */;
              localStorage.setItem(`attendance_${school_id}`, JSON.stringify(updated));
            }}
          />
        )}
      </main>
    </div>
  );
}
```

### PHASE 4: FUTURE ENHANCEMENTS (Post-MVP)

**AI-Powered Biometric Attendance**
- **Goal**: Replace manual class registers with a seamless, AI-driven attendance system.
- **Implementation**:
  1.  **Data Collection**: Leverage the student profile feature where students upload their photos. These images will be stored securely in a dedicated Supabase Storage bucket (`profile-pictures`).
  2.  **Model Training**: Use the collected student photos to train a facial recognition model. This can be achieved using a cloud vision API or a custom-trained model.
  3.  **Classroom Integration**: A teacher-facing interface on a tablet or school device will use the camera to scan the classroom. The AI model will identify students present and mark the register automatically.
- **Validation**:
  - [ ] Accuracy of >98% in various lighting conditions.
  - [ ] System provides a confirmation screen for the teacher to manually correct any errors.
  - [ ] Adherence to Kenyan data privacy and child protection laws (e.g., K-DPP).
