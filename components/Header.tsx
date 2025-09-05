import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserIcon, LogoutIcon, ChevronDownIcon } from './icons';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const { userData, signOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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