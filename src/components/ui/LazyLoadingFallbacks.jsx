/**
 * Lazy Loading Fallback Components
 * 
 * Skeleton loaders for lazy-loaded components
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Shimmer animation for skeleton loading
const shimmerClass = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 bg-[length:400%_100%]';

/**
 * Generic Page Loading Skeleton
 */
export const PageLoadingSkeleton = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('w-full', className)}
    >
        {/* Header skeleton */}
        <div className="mb-8">
            <div className={cn('h-8 w-48 rounded-lg mb-2', shimmerClass)} />
            <div className={cn('h-4 w-72 rounded-lg', shimmerClass)} />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'h-48 rounded-2xl',
                        shimmerClass
                    )}
                    style={{ animationDelay: `${i * 0.1}s` }}
                />
            ))}
        </div>
    </motion.div>
);

/**
 * Chat Loading Skeleton
 */
export const ChatLoadingSkeleton = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col"
    >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/5">
            <div className={cn('h-6 w-32 rounded-lg', shimmerClass)} />
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={cn('flex gap-3', i % 2 === 0 ? '' : 'justify-end')}>
                    <div className={cn('w-8 h-8 rounded-full', shimmerClass)} />
                    <div className={cn('w-64 h-16 rounded-2xl', shimmerClass)} />
                </div>
            ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5">
            <div className={cn('h-12 rounded-xl', shimmerClass)} />
        </div>
    </motion.div>
);

/**
 * City Builder Loading Skeleton
 */
export const CityBuilderLoadingSkeleton = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full rounded-3xl overflow-hidden relative"
    >
        <div className={cn('w-full h-full', shimmerClass)} />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading 3D City...</p>
            </div>
        </div>
    </motion.div>
);

/**
 * Exam Loading Skeleton
 */
export const ExamLoadingSkeleton = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
    >
        {/* Timer bar */}
        <div className={cn('h-12 rounded-xl mb-6', shimmerClass)} />

        {/* Question area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg">
            <div className={cn('h-6 w-24 rounded-lg mb-4', shimmerClass)} />
            <div className={cn('h-24 rounded-xl mb-6', shimmerClass)} />

            {/* Options */}
            <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={cn('h-12 rounded-xl', shimmerClass)} />
                ))}
            </div>
        </div>
    </motion.div>
);

export default PageLoadingSkeleton;
