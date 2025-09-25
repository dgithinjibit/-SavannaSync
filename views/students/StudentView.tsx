import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as geminiService from '../../services/geminiService';
import * as dataService from '../../services/dataService';
import { Chat } from '@google/genai';
import StudentSetupView from './StudentSetupView';
import LoadingSpinner from '../../components/LoadingSpinner';
import StudentProfileModal from './StudentProfileModal';
import { UserIcon } from '../../components/icons';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface StudentSettings {
    gradeLevel: number;
    currentSubject: string;
}

const StudentView: React.FC = () => {
    const { userData } = useAuth();
    const [settings, setSettings] = useState<StudentSettings | null>(null);
    const [isSetupVisible, setIsSetupVisible] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('studentLearningSettings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            } else {
                setIsSetupVisible(true);
            }
        } catch (error) {
            console.error("Failed to parse student settings from localStorage", error);
            localStorage.removeItem('studentLearningSettings');
            setIsSetupVisible(true);
        }
        setIsLoadingSettings(false);
    }, []);

    const handleSaveSettings = (grade: number, subject: string) => {
        const newSettings = { gradeLevel: grade, currentSubject: subject };
        try {
            localStorage.setItem('studentLearningSettings', JSON.stringify(newSettings));
            setSettings(newSettings);
            setIsSetupVisible(false); // Hide setup view after saving
        } catch (error) {
            console.error("Failed to save student settings to localStorage", error);
        }
    };

    useEffect(() => {
        if (userData && settings) {
            const studentContext = dataService.getStudentContext(userData.schoolId, settings.gradeLevel, settings.currentSubject);
            const teacherId = dataService.getTeacherIdForStudent(userData.uid);
            const teacherCustomization = localStorage.getItem(`teacher_ai_customization_${teacherId}`);

            if (teacherCustomization) {
                console.log("Teacher customization loaded for student.");
            }

            setChat(geminiService.createTutorChat(studentContext, teacherCustomization || undefined));
            // When settings change, reset the chat with a new welcome message
            setMessages([{ role: 'model', text: `Let's talk about ${settings.currentSubject}! What are you curious about today? 😊` }]);
        }
    }, [userData, settings]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // FIX 1: Remove await for sendMessageStream
            const stream = chat.sendMessageStream({ message: input });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Oops! I had a little trouble thinking. Could you ask me again?' }]);
        } finally {
            setIsLoading(false);
        }
    }, [chat, input, isLoading]);

    if (isLoadingSettings) {
        return <LoadingSpinner fullScreen />;
    }

    if (isSetupVisible || !settings) {
        return <StudentSetupView onSave={handleSaveSettings} />;
    }

    return (
        <>
            <StudentProfileModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
            <div className="flex flex-col h-screen bg-white">
                <header className="bg-surface shadow-sm p-4 flex justify-between items-center z-10">
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setIsSetupVisible(true)} 
                            className="p-2 rounded-md hover:bg-gray-100 transition"
                            aria-label="Change grade or subject"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <img src="https://picsum.photos/40/40" alt="Mwalimu AI" className="w-10 h-10 rounded-full" />
                        <div>
                            <h1 className="text-xl font-bold text-primary">Mwalimu AI Tutor</h1>
                            <p className="text-sm text-text-secondary">{`Grade ${settings.gradeLevel} | ${settings.currentSubject}`}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsProfileModalOpen(true)} className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition">
                        {userData?.avatarUrl ? (
                            <img src={userData.avatarUrl} alt={userData.fullName || 'Student profile picture'} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-gray-600" />
                        )}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-[80%] text-text-primary ${msg.role === 'user' ? 'ml-auto bg-blue-100' : 'bg-gray-100'}`}>
                                <p className="whitespace-pre-wrap text-base">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {/* FIX 2: Guard against empty messages before indexing */}
                    {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-gray-100">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="bg-surface p-4 border-t">
                    <div className="max-w-3xl mx-auto flex items-center space-x-4">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            placeholder="Ask your Mwalimu tutor..."
                            rows={1}
                            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-primary text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default StudentView;
