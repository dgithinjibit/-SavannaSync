import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserIcon } from '../../components/icons';
import LoadingSpinner from '../../components/LoadingSpinner';

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
    const { userData, signOut, uploadProfilePhoto, updateUserMetadata } = useAuth();
    const [fullName, setFullName] = useState(userData?.fullName || userData?.email?.split('@')[0] || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(userData?.avatarUrl || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFullName(userData?.fullName || userData?.email?.split('@')[0] || '');
        setPreviewUrl(userData?.avatarUrl || null);
        setError('');
        setMessage('');
        setSelectedFile(null);
    }, [isOpen, userData]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            let newAvatarUrl = userData?.avatarUrl;

            if (selectedFile) {
                newAvatarUrl = await uploadProfilePhoto(selectedFile);
            }

            if (newAvatarUrl !== userData?.avatarUrl || fullName !== userData?.fullName) {
                await updateUserMetadata({
                    full_name: fullName,
                    avatar_url: newAvatarUrl
                });
            }
            setMessage('Profile updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center text-text-primary">My Profile</h2>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                {message && <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{message}</div>}

                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-700 transition"
                            aria-label="Change profile picture"
                        >
                            ✏️
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                        />
                    </div>
                    
                    <div>
                         <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="Your name"
                        />
                    </div>
                </div>

                <div className="flex flex-col space-y-3">
                     <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center disabled:bg-gray-400"
                    >
                        {loading ? <LoadingSpinner /> : 'Save Changes'}
                    </button>
                    <button
                        onClick={signOut}
                        className="w-full py-2 bg-gray-200 text-text-secondary rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileModal;
