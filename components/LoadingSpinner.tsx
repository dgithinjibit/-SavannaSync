
import * as React from 'react';

const LoadingSpinner: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
    const wrapperClasses = fullScreen
        ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'
        : 'flex items-center justify-center py-8';

    return (
        <div className={wrapperClasses}>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            {fullScreen && <p className="mt-4 text-lg font-semibold text-text-primary">Loading SyncSenta...</p>}
        </div>
    );
};

export default LoadingSpinner;
