
import * as React from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as dataService from '../../services/dataService';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import * as hederaService from '../../services/hederaJavaBackendService';
import { SchoolIcon, CheckCircleIcon } from '../../components/Icons';

const SchoolHeadView: React.FC = () => {
    const { userData } = useAuth();
    const [aiQuery, setAiQuery] = React.useState('');
    const [aiResponse, setAiResponse] = React.useState('');
    const [isLoadingAi, setIsLoadingAi] = React.useState(false);

    if (!userData) return <LoadingSpinner fullScreen />;

    const dashboardData = dataService.getSchoolHeadDashboardData(userData.schoolId);

    const handleAiQuery = async () => {
        if (!aiQuery.trim()) return;
        setIsLoadingAi(true);
        setAiResponse('');
        try {
            const response = await hederaService.getSchoolHeadAnalysis(aiQuery, dashboardData);
            setAiResponse(response);
        } catch (error) {
            console.error(error);
            setAiResponse("Sorry, I couldn't process that request. Please try again.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.kpis.map(kpi => (
                    <DataCard 
                        key={kpi.title}
                        icon={<SchoolIcon className="w-6 h-6 text-primary" />}
                        title={kpi.title}
                        value={kpi.value}
                        change={kpi.change}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Resource Inventory */}
                <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Resource Inventory</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Resource</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Level</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.resourceInventory.map(item => (
                                    <tr key={item.name}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status === 'Available' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.level}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Announcements */}
                <div className="bg-surface p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Announcements</h3>
                    <div className="space-y-4">
                        {dashboardData.announcements.map(ann => (
                            <div key={ann.id} className="border-l-4 border-primary pl-4">
                                <p className="font-bold">{ann.title}</p>
                                <p className="text-sm text-text-secondary">{ann.content}</p>
                                <p className="text-xs text-gray-400 mt-1">{ann.date}</p>
                            </div>
                        ))}
                         <button className="w-full mt-2 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition">
                            New Announcement
                        </button>
                    </div>
                </div>
            </div>

             {/* AI Operational Consultant */}
            <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-text-primary mb-4">AI Operational Consultant</h3>
                <div className="space-y-4">
                    <textarea 
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="Ask about your school's data, e.g., 'What is the impact of our current student-teacher ratio?'"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                    />
                    <button 
                        onClick={handleAiQuery}
                        disabled={isLoadingAi}
                        className="px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-black/80 transition disabled:bg-gray-400"
                    >
                        {isLoadingAi ? 'Analyzing...' : 'Ask AI'}
                    </button>
                    {isLoadingAi && <LoadingSpinner />}
                    {aiResponse && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-semibold mb-2">AI Analysis:</h4>
                            <p className="text-text-secondary whitespace-pre-wrap">{aiResponse}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchoolHeadView;
