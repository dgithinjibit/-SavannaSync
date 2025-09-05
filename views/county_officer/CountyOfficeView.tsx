
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as dataService from '../../services/dataService';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SchoolIcon } from '../../components/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as geminiService from '../../services/geminiService';

const EquityHeatmap = () => {
    const { userData } = useAuth();
    const [heatmapData, setHeatmapData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateHeatmap = async () => {
        if (!userData) return;
        setLoading(true);
        setError('');
        setHeatmapData(null);
        try {
            const data = await geminiService.getEquityAnalysis(userData.county);
            setHeatmapData(data);
        } catch (err) {
            setError('Failed to generate equity analysis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getColor = (level: 'low' | 'medium' | 'high') => {
        switch (level) {
            case 'high': return 'bg-green-500';
            case 'medium': return 'bg-yellow-300';
            case 'low': return 'bg-red-400';
            default: return 'bg-gray-300';
        }
    };

    return (
        <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-text-primary mb-4">AI Equity Heatmap</h3>
            <p className="text-text-secondary mb-4">Generate an AI-powered analysis of resource equity vs. student performance across wards in {userData?.county}.</p>
            <button onClick={generateHeatmap} disabled={loading} className="px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-black/80 transition disabled:bg-gray-400">
                {loading ? 'Generating...' : 'Generate Analysis'}
            </button>
            {loading && <LoadingSpinner />}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {heatmapData && heatmapData.heatmap && (
                <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {heatmapData.heatmap.map((item: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg flex flex-col justify-between">
                                <h4 className="font-bold">{item.ward}</h4>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Resources:</span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getColor(item.resource_level)} text-black/70`}>
                                          {item.resource_level}
                                        </span>
                                    </div>
                                     <div className="flex justify-between items-center">
                                        <span className="text-sm">Performance:</span>
                                        <span className="font-semibold">{item.avg_score}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 capitalize pt-2 border-t">
                                    <span className="font-semibold">Correlation:</span> {item.correlation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const CountyOfficerView: React.FC = () => {
    const { userData } = useAuth();
    if (!userData) return <LoadingSpinner fullScreen />;

    const dashboardData = dataService.getCountyOfficerDashboardData(userData.county);

    return (
        <div className="space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-surface p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Student Engagement Trends</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={dashboardData.engagementData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="students" stroke="#007A33" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-text-primary mb-4">County-Wide Initiatives</h3>
                    <div className="space-y-4">
                        {dashboardData.initiatives.map(item => (
                            <div key={item.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-text-primary">{item.name}</span>
                                    <span className="text-sm font-medium text-text-secondary">{item.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full" style={{width: `${item.progress}%`}}></div>
                                </div>
                                <p className="text-xs text-right text-gray-500 mt-1">{item.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <EquityHeatmap />
        </div>
    );
};

export default CountyOfficerView;