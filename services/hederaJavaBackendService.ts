// Hedera Java Backend AI Service
// This service replaces Google Gemini with calls to our Java Spring Boot microservice

interface StudentContext {
    gradeLevel: number;
    currentSubject: string;
    resourceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    schoolId?: string;
    teacherCustomization?: string;
}

interface ChatRequest {
    message: string;
    studentContext: StudentContext;
    streamResponse?: boolean;
}

interface ChatResponse {
    response: string;
    sessionId: string;
    timestamp: number;
}

interface AnalysisRequest {
    query: string;
    schoolId: string;
    contextData: Record<string, any>;
    analysisType: 'SCHOOL_HEAD_OPERATIONAL' | 'TEACHER_PERFORMANCE' | 'COUNTY_EQUITY' | 'COUNTY_STRATEGIC';
}

interface AnalysisResponse {
    analysis: string;
    recommendations: string;
    timestamp: number;
    analysisId: string;
}

interface EquityAnalysisResponse {
    heatmap: {
        ward: string;
        resourceLevel: string;
        avgScore: number;
        correlation: string;
    }[];
    timestamp: number;
}

class HederaJavaBackendError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'HederaJavaBackendError';
    }
}

// Base configuration
const JAVA_BACKEND_BASE_URL = import.meta.env.VITE_JAVA_AI_SERVICE_URL || 'http://localhost:8081/api';

const getApiClient = () => {
    if (!JAVA_BACKEND_BASE_URL) {
        throw new HederaJavaBackendError(
            "Java AI service URL not configured. Please set VITE_JAVA_AI_SERVICE_URL",
            "CONFIG_ERROR"
        );
    }
    return { baseUrl: JAVA_BACKEND_BASE_URL };
};

// --- Student: Mwalimu AI Tutor ---
export const createTutorChat = (studentContext: StudentContext, teacherCustomization?: string) => {
    const { baseUrl } = getApiClient();
    
    const context: StudentContext = {
        ...studentContext,
        teacherCustomization: teacherCustomization || undefined
    };
    
    if (studentContext.resourceLevel === 'LOW') {
        console.log("ADAPT: low-resource mode activated for student tutor.");
    }

    return {
        sendMessage: async (message: string): Promise<string> => {
            try {
                const request: ChatRequest = {
                    message,
                    studentContext: context,
                    streamResponse: false
                };

                const response = await fetch(`${baseUrl}/tutor/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request)
                });

                if (!response.ok) {
                    throw new Error(`Java AI Backend error: ${response.status}`);
                }

                const data: ChatResponse = await response.json();
                return data.response || 'I had trouble thinking about that. Could you ask me again?';
            } catch (error) {
                console.error('Java AI Backend Error:', error);
                throw new HederaJavaBackendError(
                    'Failed to get response from Mwalimu AI. Please try again.',
                    'API_ERROR'
                );
            }
        },
        
        sendMessageStream: async function* (message: string): AsyncGenerator<{ text: string }, void, unknown> {
            try {
                const request: ChatRequest = {
                    message,
                    studentContext: context,
                    streamResponse: true
                };

                const response = await fetch(`${baseUrl}/tutor/chat/stream`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request)
                });

                if (!response.ok) {
                    throw new Error(`Java AI Backend error: ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No response stream available');
                }

                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data && data !== '[DONE]') {
                                yield { text: data };
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Java AI Backend Streaming Error:', error);
                yield { text: 'I had trouble thinking about that. Could you ask me again?' };
            }
        }
    };
};

// --- School Head: AI Operational Consultant ---
export const getSchoolHeadAnalysis = async (prompt: string, schoolData: any): Promise<string> => {
    const { baseUrl } = getApiClient();
    
    try {
        const request: AnalysisRequest = {
            query: prompt,
            schoolId: schoolData.schoolId || 'unknown',
            contextData: schoolData,
            analysisType: 'SCHOOL_HEAD_OPERATIONAL'
        };

        const response = await fetch(`${baseUrl}/analysis/school-head`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`Java AI Backend error: ${response.status}`);
        }

        const data: AnalysisResponse = await response.json();
        return data.analysis || 'Unable to analyze the data at this time.';
    } catch (error) {
        console.error('Java AI Backend Analysis Error:', error);
        throw new HederaJavaBackendError(
            'Failed to generate analysis. Please try again.',
            'ANALYSIS_ERROR'
        );
    }
};

// --- County Officer: AI Equity Heatmap ---
export const getEquityAnalysis = async (county: string): Promise<EquityAnalysisResponse> => {
    const { baseUrl } = getApiClient();
    
    try {
        const response = await fetch(`${baseUrl}/analysis/equity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ county })
        });

        if (!response.ok) {
            throw new Error(`Java AI Backend error: ${response.status}`);
        }

        const data: EquityAnalysisResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Java AI Backend Equity Analysis Error:', error);
        throw new HederaJavaBackendError(
            'Failed to generate equity analysis. Please try again.',
            'EQUITY_ANALYSIS_ERROR'
        );
    }
};

// --- County Officer: AI Strategic Advisor ---
export const getCountyOfficerReport = async (prompt: string, countyData: any): Promise<string> => {
    const { baseUrl } = getApiClient();
    
    try {
        const request: AnalysisRequest = {
            query: prompt,
            schoolId: countyData.countyId || 'unknown',
            contextData: countyData,
            analysisType: 'COUNTY_STRATEGIC'
        };

        const response = await fetch(`${baseUrl}/analysis/county-strategic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`Java AI Backend error: ${response.status}`);
        }

        const data: AnalysisResponse = await response.json();
        return data.analysis || 'Unable to generate report at this time.';
    } catch (error) {
        console.error('Java AI Backend County Report Error:', error);
        throw new HederaJavaBackendError(
            'Failed to generate county report. Please try again.',
            'COUNTY_REPORT_ERROR'
        );
    }
};

// --- Teacher: AI Performance Insights ---
export const getTeacherInsights = async (prompt: string, classData: any): Promise<string> => {
    const { baseUrl } = getApiClient();
    
    try {
        const request: AnalysisRequest = {
            query: prompt,
            schoolId: classData.schoolId || 'unknown',
            contextData: classData,
            analysisType: 'TEACHER_PERFORMANCE'
        };

        const response = await fetch(`${baseUrl}/analysis/teacher`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`Java AI Backend error: ${response.status}`);
        }

        const data: AnalysisResponse = await response.json();
        return data.analysis || 'Unable to generate insights at this time.';
    } catch (error) {
        console.error('Java AI Backend Teacher Insights Error:', error);
        throw new HederaJavaBackendError(
            'Failed to generate teacher insights. Please try again.',
            'TEACHER_INSIGHTS_ERROR'
        );
    }
};

// --- Health Check ---
export const checkServiceHealth = async (): Promise<boolean> => {
    const { baseUrl } = getApiClient();
    
    try {
        const [tutorHealth, analysisHealth] = await Promise.all([
            fetch(`${baseUrl}/tutor/health`),
            fetch(`${baseUrl}/analysis/health`)
        ]);
        
        return tutorHealth.ok && analysisHealth.ok;
    } catch (error) {
        console.error('Java AI Backend Health Check Failed:', error);
        return false;
    }
};
