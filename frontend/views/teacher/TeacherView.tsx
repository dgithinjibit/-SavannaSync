import * as React from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as dataService from '../../services/dataService';
import DataCard from '../../components/DataCard';
import { SchoolIcon, CheckCircleIcon, ArrowUpIcon } from '../../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

// --- Sub-components defined outside to prevent re-rendering issues ---

interface Student {
  id: string;
  name: string;
  attendance: { morning: boolean; evening: boolean };
}

interface StudentRegisterProps {
  classId: string;
  onBack: () => void;
}

const StudentRegister = ({ classId, onBack }: StudentRegisterProps) => {
    const storageKey = `attendance_${classId}`;
    const [students, setStudents] = React.useState<Student[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        const initialStudents = dataService.getStudentRegister(classId);
        try {
            const savedAttendance = localStorage.getItem(storageKey);
            if (savedAttendance) {
                const parsedAttendance = JSON.parse(savedAttendance);
                const mergedStudents = initialStudents.map(student => ({
                    ...student,
                    attendance: parsedAttendance[student.id] || student.attendance,
                }));
                setStudents(mergedStudents);
            } else {
                setStudents(initialStudents);
            }
        } catch (error) {
            console.error("Failed to parse attendance from localStorage", error);
            setStudents(initialStudents);
        }
        setLoading(false);
    }, [classId, storageKey]);

    const toggleAttendance = (studentId: string, session: 'morning' | 'evening') => {
        setStudents((prevStudents: any[]) => {
            const newStudents = prevStudents.map(s =>
                s.id === studentId
                ? { ...s, attendance: { ...s.attendance, [session]: !s.attendance[session] } }
                : s
            );

            // Save to localStorage
            const attendanceToSave = newStudents.reduce((acc, student) => {
                acc[student.id] = student.attendance;
                return acc;
            }, {} as Record<string, { morning: boolean; evening: boolean }>);
            
            localStorage.setItem(storageKey, JSON.stringify(attendanceToSave));

            return newStudents;
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="mb-4 text-primary font-semibold">&larr; Back to My Classes</button>
            <h3 className="text-xl font-bold mb-4">Student Register for Class {classId.slice(0, 8)}</h3>
            <div className="bg-surface rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Morning</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Evening</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student: Student) => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{student.name}</td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={student.attendance.morning} onChange={() => toggleAttendance(student.id, 'morning')} className="h-5 w-5 text-primary rounded focus:ring-primary" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <input type="checkbox" checked={student.attendance.evening} onChange={() => toggleAttendance(student.id, 'evening')} className="h-5 w-5 text-primary rounded focus:ring-primary" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MyClassesView = () => {
    const { userData } = useAuth();
    const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);

    if (!userData) return null;

    const classes = dataService.getTeacherClasses(userData.uid);

    if (selectedClassId) {
        return <StudentRegister classId={selectedClassId} onBack={() => setSelectedClassId(null)} />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(c => (
                <div key={c.id} onClick={() => setSelectedClassId(c.id)} className="bg-surface p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                    <h4 className="text-lg font-bold text-primary">{c.name}</h4>
                    <p className="text-text-secondary">{c.studentCount} Students</p>
                </div>
            ))}
        </div>
    );
};

const TeacherDashboard = () => {
    const { userData } = useAuth();
    if (!userData) return <LoadingSpinner />;

    const dashboardData = dataService.getTeacherDashboardData(userData.uid);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.kpis.map(kpi => (
                    <DataCard 
                        key={kpi.title}
                        icon={kpi.title.includes('Class') ? <SchoolIcon className="w-6 h-6 text-primary" /> : kpi.title.includes('Performance') ? <ArrowUpIcon className="w-6 h-6 text-primary" /> : <CheckCircleIcon className="w-6 h-6 text-primary" />}
                        title={kpi.title}
                        value={kpi.value}
                        change={kpi.change}
                    />
                ))}
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-text-primary mb-4">Class Performance Comparison</h3>
                <div style={{ width: '100%', height: 300 }}>
                     <ResponsiveContainer>
                        <BarChart data={dashboardData.performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="performance" fill="#007A33" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const AiCustomizationView = () => {
    const { userData } = useAuth();
    // A teacher sets customizations for students who are linked to them.
    // In our mock setup, a student is linked to a "teacher" with the same UID.
    const storageKey = `teacher_ai_customization_${userData?.uid}`;
    const [customInstruction, setCustomInstruction] = React.useState('');
    const [saved, setSaved] = React.useState(false);

    React.useEffect(() => {
        const savedInstruction = localStorage.getItem(storageKey);
        if (savedInstruction) {
            setCustomInstruction(savedInstruction);
        }
    }, [storageKey]);

    const handleSave = () => {
        localStorage.setItem(storageKey, customInstruction);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000); // Show confirmation for 2s
    };

    if (!userData) return null;

    return (
        <div className="bg-surface p-6 rounded-lg shadow-md animate-fade-in max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-text-primary mb-2">Tune Mwalimu AI for Your Students</h3>
            <p className="text-text-secondary mb-4">
                Add your personal teaching philosophy, specific examples, or reminders about class projects. 
                Your students will see these instructions when they interact with their AI tutor.
            </p>
            <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="e.g., 'Remember to relate your math problems to our ongoing class project on building a model bridge. Always encourage creative thinking!'"
            />
            <div className="mt-4 flex items-center justify-end space-x-4">
                {saved && <span className="text-green-600 text-sm font-medium animate-pulse">Saved successfully!</span>}
                <button 
                    onClick={handleSave} 
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                    Save Instructions
                </button>
            </div>
        </div>
    );
};


// --- Main Teacher View Component ---

const TeacherView = ({ initialView = 'Dashboard' }: { initialView?: string }) => {
    const [activeTab, setActiveTab] = React.useState(initialView);

    const tabs = ['Dashboard', 'My Hub', 'AI Tuner'];

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <TeacherDashboard />;
            case 'My Hub':
                return <MyClassesView />;
            case 'AI Tuner':
                return <AiCustomizationView />;
            default:
                return <TeacherDashboard />;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="p-1">
                {renderContent()}
            </div>
        </div>
    );
};

export default TeacherView;