import { GoogleGenAI, Type, Chat } from '@google/genai';
import { UserData } from '../types';

let ai: GoogleGenAI | null = null;

// This is a local type for the student context data.
interface StudentContext {
    resourceLevel: 'low' | 'medium' | 'high';
    currentSubject: string;
    gradeLevel: number;
}

class AIServiceError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'AIServiceError';
    }
}

const getClient = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new AIServiceError(
                "API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.",
                "CONFIG_ERROR"
            );
        }
        try {
            ai = new GoogleGenAI({ apiKey });
        } catch (error) {
            throw new AIServiceError(
                "Failed to initialize AI client: " + (error instanceof Error ? error.message : String(error)),
                "INIT_ERROR"
            );
        }
    }
    return ai;
};

// --- Student: Mwalimu AI Tutor ---
export const createTutorChat = (studentContext: StudentContext, teacherCustomization?: string): Chat => {
    const client = getClient();
    const isLowResource = studentContext.resourceLevel === 'low';
    
    if (isLowResource) {
        // Verification log as per specification
        console.log("ADAPT: low-resource mode activated for student tutor.");
    }

    const systemInstruction = `
ROLE: You are Mwalimu AI, a fun, curious, and super friendly learning buddy for a student in Kenya. Your goal is to make learning feel like an exciting adventure, not a boring class.
CURRENT CONTEXT: The student is in Grade ${studentContext.gradeLevel} and we're exploring ${studentContext.currentSubject}.
YOUR VIBE:
- Super encouraging and positive! Use emojis to keep it fun. 😉
- You're not a teacher, you're a co-explorer.
- Your language is simple, clear, and relatable.

YOUR CORE RULES (These are super important!):
1.  **NEVER, EVER give direct answers.** Your job is to guide, not to tell. Ask cool questions that make the student think and discover the answer themselves.
2.  **Adapt your examples.** If the student is in a 'low' resource setting, talk about everyday things like sharing fruit, playing games outside, or stories about animals. Avoid computers or complicated stuff. For 'medium' or 'high', you can use broader examples.
3.  **Keep it short & snappy.** 1-2 sentences is perfect.
4.  **Always end with a question.** This keeps the adventure going!

${teacherCustomization ? `
---
SECRET MISSION FROM YOUR TEACHER:
${teacherCustomization}
---
` : ''}
`;
    
    return client.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
    });
};

// --- Teacher: AI Assistant ---
export const getTeacherAssistantResponse = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
    const client = getClient();
    const chat = client.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: "You are a creative and highly-efficient AI assistant for a busy Kenyan teacher. Help with generating lesson plans, creating quiz questions, drafting parent communications, and providing creative ideas for CBC activities. Your tone should be professional, supportive, and practical."
        }
    });
    return chat.sendMessageStream({ message: prompt });
};

// --- School Head: AI Operational Consultant ---
export const getSchoolHeadAnalysis = async (prompt: string, schoolData: any) => {
    const client = getClient();
    const fullPrompt = `
      School Data Context:
      - KPIs: ${JSON.stringify(schoolData.kpis)}
      - Resource Inventory: ${JSON.stringify(schoolData.resourceInventory)}

      User's Question:
      ${prompt}
    `;

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            systemInstruction: "You are an AI operational consultant for a Kenyan school head. Analyze the provided school data to answer the user's questions. Connect operational data (e.g., high student-teacher ratio) to potential learning impacts (e.g., low engagement in math) and suggest practical, actionable solutions."
        }
    });

    return response.text;
};

// --- County Officer: AI Strategic Advisor ---
export const getCountyOfficerReport = async (prompt: string, countyData: any) => {
    const client = getClient();
    const fullPrompt = `
      County-Wide Data Context:
      - KPIs: ${JSON.stringify(countyData.kpis)}
      - Strategic Initiatives: ${JSON.stringify(countyData.initiatives)}

      User's Request:
      ${prompt}
    `;

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            systemInstruction: "You are an AI data analyst and strategic advisor for a Kenyan County Education Officer. Provide concise, data-driven, and actionable recommendations based on the provided county-wide data. Your insights should help in strategic planning and resource allocation."
        }
    });

    return response.text;
};

// --- County Officer: AI Equity Heatmap ---
export const getEquityAnalysis = async (county: string) => {
    const client = getClient();
    const prompt = `
      Analyze the correlation between resource levels and student scores for schools in ${county} County, Kenya. Group the analysis into fictional wards.
      OUTPUT FORMAT: JSON matching the provided schema. NO EXTRA TEXT OR EXPLANATIONS.
      CBC REFERENCE: Use EMIS data guidelines section 4.2
    `;

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    heatmap: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                ward: { type: Type.STRING },
                                resource_level: { 
                                    type: Type.STRING,
                                    description: "One of 'low', 'medium', or 'high'"
                                },
                                avg_score: { 
                                    type: Type.INTEGER,
                                    description: "An integer between 0 and 100"
                                },
                                correlation: { 
                                    type: Type.STRING,
                                    description: "One of 'strong', 'moderate', or 'weak'"
                                }
                            },
                            required: ["ward", "resource_level", "avg_score", "correlation"]
                        }
                    }
                }
            }
        }
    });

    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", e, "Raw response:", response.text);
        throw new Error("AI response was not valid JSON.");
    }
};