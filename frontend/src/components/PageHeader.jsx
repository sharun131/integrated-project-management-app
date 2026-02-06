import React from 'react';

const PageHeader = ({ title, subtitle, children }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-slate-500 font-medium mt-2 italic">{subtitle}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-4">
                    {children}
                </div>
            )}
        </div>
    );
};


export default PageHeader;
