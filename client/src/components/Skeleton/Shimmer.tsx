import React from 'react';

interface ShimmerProps {
    className?: string;
}

const Shimmer = ({ className = "" }: ShimmerProps) => {
    return (
        <div className={`relative overflow-hidden bg-slate-200 ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
    );
};

export default Shimmer;
