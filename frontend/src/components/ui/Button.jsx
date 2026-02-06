import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Advanced Button Component
 * Supports: Primary, Secondary, Danger, Ghost variants
 * Features: Loading state, RBAC visibility, Micro-interactions
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled,
    type = 'button',
    allowedRoles = [], // Array of roles allowed to see this button
    icon: Icon,
    onClick,
    ...props
}) => {
    const { user } = useAuth();

    // RBAC Check: If allowedRoles is provided and user doesn't have the role, return null (Hidden)
    if (allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
            return null;
        }
    }

    // Base Styles
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform active:scale-95";

    // Variants
    const variants = {
        primary: "bg-primary text-white shadow-md hover:shadow-lg hover:opacity-90 border border-transparent",
        secondary: "bg-gray-100 border border-gray-200 text-gray-900 hover:bg-gray-200 hover:border-gray-300",
        danger: "bg-red-100 text-red-700 border border-red-200 hover:bg-red-500 hover:text-white",
        ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        outline: "bg-transparent border border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-900"
    };

    // Sizes
    const sizes = {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-5 py-2 text-sm rounded-xl",
        lg: "h-12 px-8 text-base rounded-xl",
        icon: "h-10 w-10 p-2 rounded-xl flex items-center justify-center"
    };

    const classes = twMerge(
        clsx(
            baseStyles,
            variants[variant],
            sizes[size],
            className
        )
    );

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : Icon ? (
                <Icon size={18} className={children ? "mr-2" : ""} />
            ) : null}
            {children}
        </button>
    );
};

export default Button;
