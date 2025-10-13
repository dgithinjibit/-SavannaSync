import * as React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';

import AuthPage from './components/AuthPage';
import LoadingSpinner from './components/LoadingSpinner';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import StudentView from './views/students/StudentView';
import TeacherView from './views/teacher/TeacherView';
import SchoolHeadView from './views/school_head/SchoolHeadView';
import CountyOfficerView from './views/county_officer/CountyOfficeView';
import AddSchoolView from './views/county_officer/AddSchoolView';
import ResetPasswordView from './views/auth/ResetPasswordView';

const AppContent: React.FC = () => {
    const { userData, loading } = useAuth();
    const [activeView, setActiveView] = React.useState('');
    const [isResetFlow, setIsResetFlow] = React.useState(false);

    React.useEffect(() => {
        // Hash routing for password reset
        const handleHashChange = () => {
            const hash = window.location.hash;
            // Supabase redirects with #access_token=...&token_type=bearer&type=recovery
            if (hash.includes('type=recovery') && hash.includes('access_token')) {
                setIsResetFlow(true);
            }
        };
        
        window.addEventListener('hashchange', handleHashChange, false);
        handleHashChange(); // Check on initial load

        return () => {
            window.removeEventListener('hashchange', handleHashChange, false);
        };
    }, []);

    React.useEffect(() => {
        if (userData) {
            // Set default view when user logs in or role changes
            switch (userData.role) {
                case UserRole.TEACHER:
                    setActiveView('TeacherDashboard');
                    break;
                case UserRole.SCHOOL_HEAD:
                    setActiveView('SchoolHeadDashboard');
                    break;
                case UserRole.COUNTY_OFFICER:
                    setActiveView('CountyOfficerDashboard');
                    break;
                default:
                    setActiveView('');
            }
        }
    }, [userData]);
    
    // Render password reset view if in that flow. This takes priority.
    if (isResetFlow) {
        return <ResetPasswordView />;
    }

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!userData) {
        return <AuthPage />;
    }

    const renderView = () => {
        switch (activeView) {
            case 'TeacherDashboard':
            case 'TeacherHub':
                const initialTab = activeView === 'TeacherHub' ? 'My Hub' : 'Dashboard';
                return <TeacherView initialView={initialTab} />;
            case 'SchoolHeadDashboard':
                return <SchoolHeadView />;
            case 'CountyOfficerDashboard':
                return <CountyOfficerView />;
            case 'CountyAddSchool':
                return <AddSchoolView />;
            default:
                // Fallback for initial render or unrecognized view
                return null;
        }
    };

    const getHeaderTitle = () => {
        switch (activeView) {
            case 'TeacherDashboard': return "Teacher Dashboard";
            case 'TeacherHub': return "My Hub";
            case 'SchoolHeadDashboard': return "School Dashboard";
            case 'CountyOfficerDashboard': return "County Dashboard";
            case 'CountyAddSchool': return "Add New School";
            default:
                // Fallback title based on role
                switch (userData.role) {
                    case UserRole.TEACHER: return "Teacher Dashboard";
                    case UserRole.SCHOOL_HEAD: return "School Dashboard";
                    case UserRole.COUNTY_OFFICER: return "County Dashboard";
                    default: return "SyncSenta";
                }
        }
    }

    // Student has a full-screen view without sidebar/header
    if (userData.role === UserRole.STUDENT) {
        return <StudentView />;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col ml-64">
                <Header title={getHeaderTitle()} />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <GlobalErrorBoundary>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </GlobalErrorBoundary>
    );
};

export default App;