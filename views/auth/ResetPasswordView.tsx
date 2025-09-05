import React, { useState } from 'react';
import * as authService from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ResetPasswordView: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 12) {
             setError("Password must be at least 12 characters long.");
             return;
        }
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            await authService.updateUserPassword(password);
            setMessage('Your password has been successfully updated! You can now sign in with your new password.');
        } catch (err: any) {
            setError(err.message || 'Failed to update password. The reset link may have expired.');
        } finally {
            setLoading(false);
        }
    };
    
    // Don't show the form if the process is complete
    if (message) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 space-y-6 text-center">
                    <h1 className="text-3xl font-bold text-primary">Password Reset</h1>
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">{message}</div>
                     <a href="/" className="inline-block w-full py-3 mt-4 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition">
                        Back to Sign In
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">Set Your New Password</h1>
                    <p className="text-text-secondary mt-2">
                        Please enter and confirm your new password below.
                    </p>
                </div>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="New Password" 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" 
                    />
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder="Confirm New Password" 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" 
                    />
                    <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                        {loading ? <LoadingSpinner /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordView;
