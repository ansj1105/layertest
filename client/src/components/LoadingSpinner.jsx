import React from 'react';

const LoadingSpinner = ({ size = 'large', text = '로딩 중...' }) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16',
        xlarge: 'w-32 h-32'
    };

    const textSizes = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base',
        xlarge: 'text-lg'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="relative">
                {/* Outer ring */}
                <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-[#10b981] rounded-full animate-spin`}></div>

                {/* Inner ring */}
                <div className={`${sizeClasses[size]} absolute top-0 left-0 border-4 border-transparent border-t-[#059669] rounded-full animate-spin`}
                    style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>

                {/* Center dot */}
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#10b981] rounded-full animate-pulse`}></div>
            </div>

            {/* Loading text */}
            <div className="mt-6 text-center">
                <p className={`${textSizes[size]} text-gray-600 font-medium animate-pulse`}>
                    {text}
                </p>
                <div className="flex justify-center mt-2 space-x-1">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#047857] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};

// Full screen loading component
export const FullScreenLoader = ({ text = '페이지를 불러오는 중...' }) => (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
            <div className="relative inline-block">
                {/* Main spinner */}
                <div className="w-20 h-20 border-4 border-gray-200 border-t-[#10b981] rounded-full animate-spin"></div>

                {/* Secondary spinner */}
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[#059669] rounded-full animate-spin"
                    style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>

                {/* Center icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#10b981] rounded-full animate-pulse"></div>
            </div>

            <div className="mt-6">
                <p className="text-lg font-medium text-gray-700 mb-2">{text}</p>
                <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#047857] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    </div>
);

// Inline loading component
export const InlineLoader = ({ size = 'medium' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-[#10b981] rounded-full animate-spin`}></div>
        </div>
    );
};

// Skeleton loading component
export const SkeletonLoader = ({ lines = 3, className = '' }) => (
    <div className={`animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded mb-2"></div>
        ))}
    </div>
);

// Default export as FullScreenLoader for better UX
export default FullScreenLoader; 