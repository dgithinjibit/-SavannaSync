import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as authService from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { UserRole, School } from '../types';
import { KENYAN_COUNTIES } from '../constants';
import { getAllSchools, addSchool } from '../services/schoolService';
import LoadingSpinner from './LoadingSpinner';
import { Link } from 'react-router-dom';

const ForgotPasswordForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [resetTab, setResetTab] = useState<'staff' | 'student'>('staff');
    const [email, setEmail] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStaffReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');
        try {
            await authService.sendPasswordResetEmail(email);
            setMessage('Password reset link sent! Please check your email.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send reset link.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match.");
            setLoading(false);
            return;
        }
        try {
            await authService.resetStudentPassword(email, studentCode, newPassword);
            setMessage('Password has been reset successfully! You can now sign in.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to reset password.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">Reset Password</h1>
                <p className="text-text-secondary mt-2">
                    Select your role to continue.
                </p>
            </div>
             <div className="flex border border-gray-200 rounded-lg p-1">
                <button
                    onClick={() => setResetTab('staff')}
                    className={`w-1/2 py-2 rounded-md text-sm font-medium transition ${resetTab === 'staff' ? 'bg-primary text-white shadow' : 'text-text-secondary'}`}
                >
                    Staff / Teacher
                </button>
                <button
                    onClick={() => setResetTab('student')}
                    className={`w-1/2 py-2 rounded-md text-sm font-medium transition ${resetTab === 'student' ? 'bg-primary text-white shadow' : 'text-text-secondary'}`}
                >
                    Student
                </button>
            </div>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{message}</div>}

            {resetTab === 'staff' ? (
                <form className="space-y-4" onSubmit={handleStaffReset}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email Address" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                        {loading ? <LoadingSpinner /> : 'Send Reset Link'}
                    </button>
                </form>
            ) : (
                <form className="space-y-4" onSubmit={handleStudentReset}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email Address" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    <input type="text" value={studentCode} onChange={e => setStudentCode(e.target.value)} placeholder="Student Reset Code" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required minLength={12} autoComplete="new-password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required minLength={12} autoComplete="new-password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                        {loading ? <LoadingSpinner /> : 'Reset Password'}
                    </button>
                </form>
            )}
            <button onClick={onBack} className="w-full text-center text-sm font-medium text-primary hover:underline">
                &larr; Back to Sign In
            </button>
        </>
    );
};

const AuthPage: React.FC = () => {
    const [view, setView] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.TEACHER);
    const [county, setCounty] = useState(KENYAN_COUNTIES[0]);
    
    const [schoolId, setSchoolId] = useState<string | null>(null);
    const [schoolSearchText, setSchoolSearchText] = useState('');
    const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
    const schoolInputRef = useRef<HTMLDivElement>(null);

    const [schools, setSchools] = useState<School[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { signIn, signUp, signInWithGoogle, signInWithWallet } = useAuth();

    const fetchSchools = useCallback(async () => {
        setLoading(true);
        try {
            const allSchools = await getAllSchools();
            setSchools(allSchools);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load schools. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (schoolInputRef.current && !schoolInputRef.current.contains(event.target as Node)) {
                setIsSchoolDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateAndSelectSchool = async () => {
        if (!schoolSearchText.trim()) {
            setError("School name cannot be empty.");
            return;
        }
        setLoading(true);
        setError(null);
        setIsSchoolDropdownOpen(false);
        try {
            const newSchool = await addSchool(schoolSearchText, county);
            setMessage(`Successfully added ${newSchool.name}!`);
            await fetchSchools();
            setSchoolId(newSchool.id);
            setSchoolSearchText(newSchool.name);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to add new school.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            if (view === 'signUp') {
                if (role !== UserRole.COUNTY_OFFICER && !schoolId) {
                    setError("Please select a school or add a new one.");
                    setLoading(false);
                    return;
                }
                const finalSchoolId = role === UserRole.COUNTY_OFFICER ? '' : schoolId!;
                await signUp(email, password, role, finalSchoolId, county);
                setMessage('Sign up successful! Please check your email to verify your account.');
            } else {
                await signIn(email, password);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : `Failed to ${view === 'signUp' ? 'sign up' : 'sign in'}.`;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const schoolsInCounty = useMemo(() => schools.filter(s => s.county === county), [schools, county]);
    
    const searchedSchools = useMemo(() => {
        if (!schoolSearchText) return schoolsInCounty;
        return schoolsInCounty.filter(s => s.name.toLowerCase().includes(schoolSearchText.toLowerCase()));
    }, [schoolSearchText, schoolsInCounty]);

    const showAddSchoolOption = useMemo(() => {
        if (!schoolSearchText) return false;
        const exactMatch = schoolsInCounty.some(s => s.name.toLowerCase() === schoolSearchText.toLowerCase());
        return !exactMatch;
    }, [schoolSearchText, schoolsInCounty]);

    const handleSchoolSelect = (school: School) => {
        setSchoolId(school.id);
        setSchoolSearchText(school.name);
        setIsSchoolDropdownOpen(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 space-y-6">
                {view === 'forgotPassword' ? (
                    <ForgotPasswordForm onBack={() => setView('signIn')} />
                ) : (
                    <>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-primary">Welcome to SyncSenta</h1>
                            <p className="text-text-secondary mt-2">
                                {view === 'signUp' ? 'Create your account to get started' : 'Sign in to your account'}
                            </p>
                        </div>

                        <div className="flex border border-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setView('signIn')}
                                className={`w-1/2 py-2 rounded-md text-sm font-medium transition ${view === 'signIn' ? 'bg-primary text-white shadow' : 'text-text-secondary'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setView('signUp')}
                                className={`w-1/2 py-2 rounded-md text-sm font-medium transition ${view === 'signUp' ? 'bg-primary text-white shadow' : 'text-text-secondary'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                        
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{message}</div>}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    minLength={12}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                                {view === 'signIn' && (
                                     <button type="button" onClick={() => setView('forgotPassword')} className="text-xs text-primary hover:underline text-right w-full mt-1">Forgot Password?</button>
                                )}
                            </div>

                            {view === 'signUp' && (
                                <>
                                    <select
                                        value={role}
                                        onChange={e => {
                                            const newRole = e.target.value as UserRole;
                                            setRole(newRole);
                                            if (newRole === UserRole.COUNTY_OFFICER) {
                                                setSchoolId(null);
                                                setSchoolSearchText('');
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    >
                                        {Object.values(UserRole)
                                            .filter(v => typeof v === 'string')
                                            .filter(r => !['PARENT', 'MINISTRY_OFFICIAL'].includes(r as string))
                                            .map(r => <option key={r as string} value={r as string}>{(r as string).replace('_', ' ')}</option>)}
                                    </select>
                                    <select 
                                        value={county} 
                                        onChange={e => {
                                            setCounty(e.target.value); 
                                            setSchoolId(null);
                                            setSchoolSearchText('');
                                        }} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                                        {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    
                                    {role !== UserRole.COUNTY_OFFICER && (
                                        <div className="relative" ref={schoolInputRef}>
                                            <input 
                                                type="text"
                                                value={schoolSearchText}
                                                onChange={e => {
                                                    setSchoolSearchText(e.target.value)
                                                    setSchoolId(null);
                                                    if(!isSchoolDropdownOpen) setIsSchoolDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsSchoolDropdownOpen(true)}
                                                placeholder="Type to find or add your school"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            />
                                            {isSchoolDropdownOpen && (
                                                <ul className="absolute z-10 w-full mt-1 bg-surface border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {searchedSchools.map(s => (
                                                        <li 
                                                            key={s.id} 
                                                            onClick={() => handleSchoolSelect(s)}
                                                            className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
                                                        >
                                                            {s.name}
                                                        </li>
                                                    ))}
                                                    {showAddSchoolOption && (
                                                        <li 
                                                            onClick={handleCreateAndSelectSchool}
                                                            className="px-4 py-2 text-primary font-semibold hover:bg-primary/10 cursor-pointer"
                                                        >
                                                            + Add "{schoolSearchText}" as a new school
                                                        </li>
                                                    )}
                                                    {searchedSchools.length === 0 && !showAddSchoolOption && (
                                                         <li className="px-4 py-2 text-text-secondary">No schools found in {county}.</li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                                {loading ? <LoadingSpinner /> : (view === 'signUp' ? 'Sign Up' : 'Sign In')}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-surface px-2 text-text-secondary">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <button onClick={signInWithGoogle} className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                Google
                            </button>
                             <button onClick={signInWithWallet} className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                Wallet
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthPage;