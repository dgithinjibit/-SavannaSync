import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as dataService from '../../services/dataService';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getSchoolHeadAnalysis } from '../../services/hederaJavaBackendService'; // Update function typing if needed
import { SchoolIcon, CheckCircleIcon } from '../../components/icons';

const AI_REQUEST_TIMEOUT_MS = 30000; // 30 seconds, adjust as needed

const SchoolHeadView: React.FC = () => {
    const { userData } = useAuth();
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // Track the current AbortController for cancellation/timeout
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!userData) return <LoadingSpinner fullScreen />;

    const dashboardData = dataService.getSchoolHeadDashboardData(userData.schoolId);

    // --- Construct minimal payload ---
    const minimalPayload = {
        schoolId: userData.schoolId,
        // If you have termId in the user/session, include it; otherwise, null or placeholder
        termId: userData.termId || null,
        requiredAggregates: {
            complianceStatus: dashboardData.kpis.find(kpi => kpi.title === "Compliance Status")?.value,
            studentTeacherRatio: dashboardData.kpis.find(kpi => kpi.title === "Student-Teacher Ratio")?.value,
            resourceLevels: dashboardData.kpis.find(kpi => kpi.title === "Resource Levels")?.value,
            staffAttendance: dashboardData.kpis.find(kpi => kpi.title === "Staff Attendance")?.value,
        }
    };

    const handleAiQuery = async () => {
        if (!aiQuery.trim()) return;

        // Cancel any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Set up per-request timeout
        timeoutRef.current = window.setTimeout(() => {
            controller.abort();
        }, AI_REQUEST_TIMEOUT_MS);

        setIsLoadingAi(true);
        setAiResponse('');
        try {
            // Pass minimalPayload instead of dashboardData
            const response = await getSchoolHeadAnalysis(aiQuery, minimalPayload, { signal: controller.signal });
            setAiResponse(response);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setAiResponse("Request was cancelled or timed out.");
            } else {
                console.error(error);
                setAiResponse("Sorry, I couldn't process that request. Please try again.");
            }
        } finally {
            setIsLoadingAi(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    };

    // ...rest of your component unchanged...
};

export default SchoolHeadView;
