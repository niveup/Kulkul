/**
 * TagChip - Individual tag display component
 * 
 * Used in concept cards and filters to display tags
 * with consistent styling and interaction
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PHYSICS_TAGS, getTagClasses } from '../../data/tags';

/**
 * TagChip Component
 * @param {string} tagId - Tag identifier from PHYSICS_TAGS
 * @param {boolean} isDarkMode - Theme mode
 * @param {boolean} isSelected - Whether tag is currently selected
 * @param {boolean} isRemovable - Show remove button
 * @param {function} onClick - Click handler
 * @param {function} onRemove - Remove handler
 * @param {string} size - "xs" | "sm" | "md"
 */
const TagChip = memo(({
    tagId,
    isDarkMode = false,
    isSelected = false,
    isRemovable = false,
    onClick,
    onRemove,
    size = 'sm'
}) => {
    const tag = PHYSICS_TAGS[tagId];
    const label = tag?.label || tagId;

    // Size variants
    const sizeClasses = {
        xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-2.5 py-1 gap-1.5',
    };

    const baseClasses = getTagClasses(tagId, isDarkMode);
    const selectedRing = isSelected
        ? isDarkMode
            ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-900'
            : 'ring-2 ring-blue-500 ring-offset-1'
        : '';

    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.(tagId);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onRemove?.(tagId);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`
                inline-flex items-center rounded-full border font-medium
                transition-all duration-200 cursor-pointer
                ${sizeClasses[size]}
                ${baseClasses}
                ${selectedRing}
                ${onClick ? 'hover:opacity-80' : 'cursor-default'}
            `}
        >
            <span>{label}</span>
            {isRemovable && (
                <button
                    onClick={handleRemove}
                    className={`
                        ml-0.5 p-0.5 rounded-full transition-colors
                        ${isDarkMode
                            ? 'hover:bg-white/20'
                            : 'hover:bg-black/10'
                        }
                    `}
                >
                    <X size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />
                </button>
            )}
        </motion.button>
    );
});

TagChip.displayName = 'TagChip';

export default TagChip;
