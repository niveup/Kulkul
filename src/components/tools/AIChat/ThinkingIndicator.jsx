/**
 * ThinkingIndicator - Premium "AI is thinking" animation
 * 
 * Features:
 * - Shimmer/pulse animation
 * - Skeleton-style loading
 * - Gentle spring physics
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

// Inline spring config
const springGentle = { type: 'spring', stiffness: 100, damping: 15, mass: 1 };

// =============================================================================
// Main Component
// =============================================================================

const ThinkingIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={springGentle}
            className="flex gap-3 justify-start"
        >
            {/* AI Avatar */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-xl',
                    'bg-gradient-to-br from-indigo-500 to-purple-600',
                    'flex items-center justify-center',
                    'shadow-lg shadow-indigo-500/30',
                )}
            >
                <span className="text-sm">✨</span>
            </motion.div>

            {/* Thinking Bubble */}
            <motion.div
                className={cn(
                    'relative overflow-hidden',
                    'px-5 py-4 rounded-2xl rounded-bl-md',
                    'bg-white/60 dark:bg-white/10',
                    'backdrop-blur-md',
                    'border border-white/30 dark:border-white/10',
                )}
            >
                {/* Shimmer Effect */}
                <motion.div
                    className="absolute inset-0 -translate-x-full"
                    animate={{ translateX: ['100%', '-100%'] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                </motion.div>

                {/* Animated Dots */}
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className={cn(
                                'w-2 h-2 rounded-full',
                                'bg-indigo-500 dark:bg-indigo-400',
                            )}
                            animate={{
                                y: [0, -6, 0],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* Label */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 text-xs text-slate-400 dark:text-slate-500"
                >
                    Thinking...
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default ThinkingIndicator;
