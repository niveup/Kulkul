import React from 'react';
import { motion } from 'framer-motion';

// =============================================================================
// Premium Spinner Component
// =============================================================================

export const Spinner = ({
    size = 'md',
    className = '',
    color = 'primary'
}) => {
    const sizes = {
        xs: 'w-4 h-4 border',
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4',
    };

    const colors = {
        primary: 'border-indigo-500',
        white: 'border-white',
        neutral: 'border-slate-400',
    };

    return (
        <div
            className={`
        ${sizes[size]}
        rounded-full
        border-t-transparent
        ${colors[color]}
        animate-spin
        ${className}
      `}
        />
    );
};

// =============================================================================
// Branded Loading Spinner with Logo
// =============================================================================

export const BrandedSpinner = ({ className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            {/* Outer ring */}
            <motion.div
                className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-900"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner ring */}
            <motion.div
                className="absolute inset-1 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    S
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// Three Dots Loading
// =============================================================================

export const DotsLoader = ({
    size = 'md',
    color = 'primary',
    className = ''
}) => {
    const sizes = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    const colors = {
        primary: 'bg-indigo-500',
        white: 'bg-white',
        neutral: 'bg-slate-400',
    };

    return (
        <div className={`flex gap-1 ${className}`}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={`${sizes[size]} ${colors[color]} rounded-full`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};

// =============================================================================
// Pulse Loader
// =============================================================================

export const PulseLoader = ({ className = '' }) => {
    return (
        <div className={`relative w-12 h-12 ${className}`}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-indigo-500"
                    animate={{
                        scale: [1, 2],
                        opacity: [0.8, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeOut',
                    }}
                />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
            </div>
        </div>
    );
};

// =============================================================================
// Skeleton Loaders
// =============================================================================

export const Skeleton = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'shimmer'
}) => {
    const baseClasses = 'bg-slate-200 dark:bg-slate-700';

    const variants = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
    };

    const animations = {
        shimmer: 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]',
        pulse: 'animate-pulse',
        none: '',
    };

    return (
        <div
            className={`
        ${baseClasses}
        ${variants[variant]}
        ${animations[animation]}
        ${className}
      `}
            style={{ width, height }}
        />
    );
};

// Skeleton for text content
export const SkeletonText = ({ lines = 3, className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
};

// Skeleton for cards
export const SkeletonCard = ({ className = '' }) => {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    );
};

// Skeleton for avatar with name
export const SkeletonAvatar = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
};

// =============================================================================
// Full Page Loading Overlay
// =============================================================================

export const LoadingOverlay = ({
    message = 'Loading...',
    showLogo = true
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-md"
        >
            {showLogo ? <BrandedSpinner /> : <Spinner size="lg" />}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
                {message}
            </motion.p>
        </motion.div>
    );
};

// =============================================================================
// Inline Loading Indicator
// =============================================================================

export const InlineLoading = ({
    text = 'Loading',
    className = ''
}) => {
    return (
        <div className={`inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 ${className}`}>
            <Spinner size="xs" color="neutral" />
            <span>{text}</span>
        </div>
    );
};

// =============================================================================
// Button Loading State
// =============================================================================

export const ButtonLoading = ({
    loading = false,
    children,
    loadingText = 'Loading...',
    className = ''
}) => {
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            {loading ? (
                <>
                    <Spinner size="xs" color="white" />
                    <span>{loadingText}</span>
                </>
            ) : (
                children
            )}
        </span>
    );
};

// =============================================================================
// Progress Bar
// =============================================================================

export const ProgressBar = ({
    value = 0,
    max = 100,
    showLabel = false,
    color = 'primary',
    size = 'md',
    className = ''
}) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    const colors = {
        primary: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        success: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
        warning: 'bg-gradient-to-r from-amber-400 to-amber-600',
        error: 'bg-gradient-to-r from-rose-400 to-rose-600',
    };

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={className}>
            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${sizes[size]}`}>
                <motion.div
                    className={`${sizes[size]} ${colors[color]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
            {showLabel && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-right">
                    {Math.round(percent)}%
                </p>
            )}
        </div>
    );
};

// =============================================================================
// Circular Progress
// =============================================================================

export const CircularProgress = ({
    value = 0,
    max = 100,
    size = 60,
    strokeWidth = 4,
    showValue = true,
    color = 'primary',
    className = ''
}) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    const colors = {
        primary: 'stroke-indigo-500',
        success: 'stroke-emerald-500',
        warning: 'stroke-amber-500',
        error: 'stroke-rose-500',
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className={colors[color]}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </svg>
            {showValue && (
                <span className="absolute text-sm font-bold text-slate-700 dark:text-slate-200">
                    {Math.round(percent)}%
                </span>
            )}
        </div>
    );
};

export default {
    Spinner,
    BrandedSpinner,
    DotsLoader,
    PulseLoader,
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonAvatar,
    LoadingOverlay,
    InlineLoading,
    ButtonLoading,
    ProgressBar,
    CircularProgress,
};
