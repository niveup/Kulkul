/**
 * DifficultyBadge - Visual indicator for concept difficulty
 * 
 * Displays a color-coded badge with icon showing:
 * - Easy (Green) - Basic concepts
 * - Medium (Yellow) - Intermediate
 * - Hard (Red) - Advanced concepts
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { DIFFICULTY_LEVELS } from '../../data/tags';

/**
 * DifficultyBadge Component
 * @param {string} difficulty - "Easy" | "Medium" | "Hard"
 * @param {boolean} isDarkMode - Theme mode
 * @param {boolean} showLabel - Whether to show text label
 * @param {string} size - "sm" | "md" | "lg"
 */
const DifficultyBadge = memo(({
    difficulty = 'Medium',
    isDarkMode = false,
    showLabel = true,
    size = 'sm'
}) => {
    const config = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.Medium;

    // Size variants
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    // Color classes based on difficulty
    const colorClasses = {
        Easy: isDarkMode
            ? 'bg-green-500/20 text-green-300 border-green-500/30'
            : 'bg-green-100 text-green-700 border-green-200',
        Medium: isDarkMode
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-amber-100 text-amber-700 border-amber-200',
        Hard: isDarkMode
            ? 'bg-red-500/20 text-red-300 border-red-500/30'
            : 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                inline-flex items-center gap-1 rounded-full border font-medium
                ${sizeClasses[size]}
                ${colorClasses[difficulty] || colorClasses.Medium}
            `}
            title={config.description}
        >
            <span className="text-[10px]">{config.icon}</span>
            {showLabel && <span>{config.label}</span>}
        </motion.span>
    );
});

DifficultyBadge.displayName = 'DifficultyBadge';

export default DifficultyBadge;
