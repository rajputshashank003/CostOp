import React from 'react';

interface ShimmerProps {
    className?: string;
    style?: React.CSSProperties;
}

const Shimmer = ({ className = "", style }: ShimmerProps) => {
    return (
        <div className={`relative overflow-hidden bg-slate-200 ${className}`} style={style}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
    );
};

export default Shimmer;
