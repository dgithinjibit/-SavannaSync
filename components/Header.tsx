import * as React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserIcon, LogoutIcon, ChevronDownIcon } from './Icons';

interface HeaderProps {
    title: string;
}

export const Header = ({ title }: HeaderProps) => {
    const { userData, signOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-surface shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            {userData?.avatarUrl ? (
                                <img src={userData.avatarUrl} alt={userData.fullName || 'Profile'} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <UserIcon className="w-8 h-8 text-gray-500 bg-gray-200 rounded-full p-1" />
                            )}
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium text-gray-700">{userData?.fullName || 'User'}</span>
                                <span className="text-xs text-gray-500">{userData?.email}</span>
                            </div>
                            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <LogoutIcon className="w-4 h-4" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;