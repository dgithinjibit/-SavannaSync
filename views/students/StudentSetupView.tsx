import * as React from 'react';

interface StudentSetupViewProps {
    onSave: (grade: number, subject: string) => void;
}

const subjects = ['Mathematics', 'English', 'Science', 'Swahili', 'Social Studies'];
const grades = Array.from({ length: 8 }, (_, i) => i + 1); // Grades 1 to 8

const StudentSetupView: React.FC<StudentSetupViewProps> = ({ onSave }) => {
    const [selectedGrade, setSelectedGrade] = React.useState<number>(4);
    const [selectedSubject, setSelectedSubject] = React.useState<string>(subjects[0]);

    const handleSubmit = () => {
        onSave(selectedGrade, selectedSubject);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-surface rounded-2xl shadow-xl p-8 space-y-8 text-center animate-fade-in">
                <div>
                    <h1 className="text-4xl font-bold text-primary">Let's Get Started!</h1>
                    <p className="text-text-secondary mt-2 text-lg">
                        Choose your grade and subject to begin your learning adventure.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary mb-3">Select Your Grade</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {grades.map(grade => (
                                <button
                                    key={grade}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={`px-6 py-3 rounded-lg font-bold text-lg transition-transform transform hover:scale-105 ${
                                        selectedGrade === grade
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                                    }`}
                                >
                                    {`Grade ${grade}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-text-primary mb-3">Select Your Subject</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                             {subjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => setSelectedSubject(subject)}
                                    className={`px-6 py-3 rounded-lg font-bold text-lg transition-transform transform hover:scale-105 ${
                                        selectedSubject === subject
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                                    }`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full max-w-sm mx-auto py-4 bg-accent text-white rounded-lg font-semibold text-xl hover:bg-red-700 transition shadow-lg hover:shadow-xl"
                >
                    Start Learning! 🚀
                </button>
            </div>
        </div>
    );
};

export default StudentSetupView;
