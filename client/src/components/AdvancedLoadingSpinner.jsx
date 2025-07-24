import React from 'react';

const AdvancedLoadingSpinner = ({
    variant = 'default',
    text = 'Loading...',
    size = 'large',
    showProgress = false,
    progress = 0
}) => {
    const variants = {
        default: (
            <div className="relative">
                {/* Main ring */}
                <div className="w-20 h-20 border-4 border-gray-200 border-t-[#10b981] rounded-full animate-spin"></div>

                {/* Secondary ring */}
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[#059669] rounded-full animate-spin-slow"></div>

                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#10b981] rounded-full animate-pulse-glow"></div>
            </div>
        ),

        dots: (
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-[#10b981] rounded-full animate-bounce-stagger" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-[#059669] rounded-full animate-bounce-stagger" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-[#047857] rounded-full animate-bounce-stagger" style={{ animationDelay: '300ms' }}></div>
            </div>
        ),

        bars: (
            <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="w-1 h-8 bg-gradient-to-t from-[#10b981] to-[#059669] rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                    ></div>
                ))}
            </div>
        ),

        pulse: (
            <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full animate-pulse-glow"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full"></div>
            </div>
        ),

        gradient: (
            <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full animate-pulse-glow"></div>
            </div>
        )
    };

    const sizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xlarge: 'text-xl'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 loading-backdrop z-50 flex items-center justify-center">
            <div className="text-center">
                {/* Spinner */}
                <div className="flex justify-center mb-6">
                    {variants[variant]}
                </div>

                {/* Text */}
                <div className="mb-4">
                    <p className={`${sizeClasses[size]} font-medium gradient-text-green`}>
                        {text}
                    </p>
                </div>

                {/* Progress bar (optional) */}
                {showProgress && (
                    <div className="w-64 mx-auto">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-[#10b981] to-[#059669] h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{progress}%</p>
                    </div>
                )}

                {/* Animated dots */}
                <div className="flex justify-center mt-4 space-x-1">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#047857] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};

// Compact loading component for inline use
export const CompactLoader = ({ size = 'medium', variant = 'dots' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
    };

    const compactVariants = {
        dots: (
            <div className="flex space-x-1">
                <div className="w-1 h-1 bg-[#10b981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-[#047857] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        ),
        spinner: (
            <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-[#10b981] rounded-full animate-spin`}></div>
        )
    };

    return (
        <div className="flex items-center justify-center">
            {compactVariants[variant]}
        </div>
    );
};

// Skeleton loading with shimmer effect
export const ShimmerLoader = ({ lines = 3, className = '' }) => (
    <div className={`animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2 bg-shimmer"></div>
        ))}
    </div>
);

export default AdvancedLoadingSpinner; 