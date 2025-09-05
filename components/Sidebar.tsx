import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { DashboardIcon, ClassesIcon, AiAssistantIcon, ResourcesIcon, SchoolIcon } from './icons';

interface NavItem {
    label: string;
    // FIX: Specify that the icon element can receive a className prop to resolve cloneElement type error.
    icon: React.ReactElement<{ className?: string }>;
    role: UserRole[];
    action?: () => void;
    viewId: string;
}

const NavLink: React.FC<{ item: NavItem, isActive: boolean, onClick: () => void }> = ({ item, isActive, onClick }) => {
    return (
        <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}
           className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
               isActive
                   ? 'bg-primary text-white'
                   : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
           }`}
        >
            {React.cloneElement(item.icon, { className: 'w-6 h-6 mr-3' })}
            <span className="truncate">{item.label}</span>
        </a>
    );
};

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const { userData } = useAuth();
    const role = userData?.role;

    if (!role) return null;

    const navItems: NavItem[] = [
        // Teacher
        { label: 'Dashboard', icon: <DashboardIcon />, role: [UserRole.TEACHER], action: () => setActiveView('TeacherDashboard'), viewId: 'TeacherDashboard' },
        { label: 'My Hub', icon: <ClassesIcon />, role: [UserRole.TEACHER], action: () => setActiveView('TeacherHub'), viewId: 'TeacherHub' },
        // School Head
        { label: 'School Dashboard', icon: <DashboardIcon />, role: [UserRole.SCHOOL_HEAD], action: () => setActiveView('SchoolHeadDashboard'), viewId: 'SchoolHeadDashboard' },
        // County Officer
        { label: 'County Dashboard', icon: <DashboardIcon />, role: [UserRole.COUNTY_OFFICER], action: () => setActiveView('CountyOfficerDashboard'), viewId: 'CountyOfficerDashboard' },
        { label: 'Add New School', icon: <SchoolIcon />, role: [UserRole.COUNTY_OFFICER], action: () => setActiveView('CountyAddSchool'), viewId: 'CountyAddSchool' },
    ];

    const filteredNavItems = navItems.filter(item => item.role.includes(role));

    return (
        <div className="w-64 bg-surface h-screen fixed top-0 left-0 shadow-md flex flex-col p-4">
            <div className="flex items-center space-x-2 px-4 py-2 mb-6">
                 <img src="https://picsum.photos/40/40" alt="SyncSenta Logo" className="w-10 h-10 rounded-full" />
                 <h1 className="text-xl font-bold text-primary">SyncSenta</h1>
            </div>
            <nav className="flex-grow space-y-2">
                {filteredNavItems.map(item => (
                    <NavLink 
                        key={item.label} 
                        item={item} 
                        isActive={activeView === item.viewId}
                        onClick={item.action!}
                    />
                ))}
            </nav>
            <div className="mt-auto text-center text-xs text-gray-400">
                &copy; 2024 SyncSenta
            </div>
        </div>
    );
};

export default Sidebar;