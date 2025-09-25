import * as React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface DataCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: number;
}

const DataCard = ({ icon, title, value, change }: DataCardProps) => {
    const isPositive = change !== undefined && change >= 0;
    
    return (
        <div className="bg-surface p-6 rounded-lg shadow-md flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-text-primary">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataCard;
