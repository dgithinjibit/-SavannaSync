import * as React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addSchool } from '../../services/schoolService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AddSchoolView: React.FC = () => {
    const { userData } = useAuth();
    const [schoolName, setSchoolName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolName.trim() || !userData?.county) {
            setError('School name is required.');
            return;
        }
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            const newSchool = await addSchool(schoolName, userData.county);
            setMessage(`Successfully added school: ${newSchool.name}`);
            setSchoolName('');
        } catch (err: any) {
            setError(err.message || 'Failed to add school.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-surface p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Add New School to {userData?.county}</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="schoolName" className="block text-sm font-medium text-text-secondary mb-1">School Name</label>
                    <input
                        id="schoolName"
                        type="text"
                        value={schoolName}
                        onChange={e => setSchoolName(e.target.value)}
                        placeholder="e.g., Nairobi Primary School"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                </div>
                 <div>
                    <label htmlFor="county" className="block text-sm font-medium text-text-secondary mb-1">County</label>
                    <input
                        id="county"
                        type="text"
                        value={userData?.county || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                    {loading ? <LoadingSpinner /> : 'Add School'}
                </button>
            </form>
        </div>
    );
};

export default AddSchoolView;
