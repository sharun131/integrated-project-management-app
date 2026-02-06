import React from 'react';

const GlassPanel = ({ children, className = "", onClick, ...props }) => {
    return (
        <div
            className={`card rounded-lg p-6 ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassPanel;
