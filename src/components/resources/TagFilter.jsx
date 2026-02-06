/**
 * TagFilter - Tag-based filtering component
 * 
 * Features:
 * - Tag cloud visualization
 * - Multi-tag selection with AND/OR logic
 * - Category-based grouping
 * - Mobile responsive design
 */

import React, { memo, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PHYSICS_TAGS, TAG_CATEGORIES, getTagsByCategory } from '../../data/tags';
import TagChip from './TagChip';

/**
 * TagFilter Component
 * @param {Array} selectedTags - Currently selected tag IDs
 * @param {function} onTagsChange - Callback when tags change
 * @param {Array} availableTags - Tags to show (filters visible tags)
 * @param {boolean} isDarkMode - Theme mode
 * @param {string} filterMode - "AND" | "OR" logic for multiple tags
 * @param {function} onFilterModeChange - Callback when filter mode changes
 */
const TagFilter = memo(({
    selectedTags = [],
    onTagsChange,
    availableTags = null, // null = show all
    isDarkMode = false,
    filterMode = 'OR',
    onFilterModeChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Get tags to display (either filtered or all)
    const displayTags = useMemo(() => {
        if (availableTags) {
            return availableTags.filter(tag => PHYSICS_TAGS[tag]);
        }
        return Object.keys(PHYSICS_TAGS);
    }, [availableTags]);

    // Group tags by category
    const tagsByCategory = useMemo(() => {
        const grouped = {};

        displayTags.forEach(tagId => {
            const tag = PHYSICS_TAGS[tagId];
            if (tag) {
                const category = tag.category || 'other';
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(tagId);
            }
        });

        // Sort categories by order
        return Object.entries(grouped)
            .sort((a, b) => {
                const orderA = TAG_CATEGORIES[a[0]]?.order || 999;
                const orderB = TAG_CATEGORIES[b[0]]?.order || 999;
                return orderA - orderB;
            });
    }, [displayTags]);

    // Toggle tag selection
    const toggleTag = useCallback((tagId) => {
        const newTags = selectedTags.includes(tagId)
            ? selectedTags.filter(t => t !== tagId)
            : [...selectedTags, tagId];

        onTagsChange?.(newTags);
    }, [selectedTags, onTagsChange]);

    // Clear all selected tags
    const clearTags = useCallback(() => {
        onTagsChange?.([]);
    }, [onTagsChange]);

    // Toggle filter mode (AND/OR)
    const toggleFilterMode = useCallback(() => {
        onFilterModeChange?.(filterMode === 'AND' ? 'OR' : 'AND');
    }, [filterMode, onFilterModeChange]);

    return (
        <div className={`
            rounded-xl border transition-colors
            ${isDarkMode
                ? 'bg-slate-900/50 border-slate-700/50'
                : 'bg-white/50 border-slate-200/50'
            }
        `}>
            {/* Header - Always visible */}
            <div
                className={`
                    flex items-center justify-between px-4 py-3 cursor-pointer
                    ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}
                `}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Filter size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                    <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Filter by Tags
                    </span>
                    {selectedTags.length > 0 && (
                        <span className={`
                            px-2 py-0.5 rounded-full text-xs font-bold
                            ${isDarkMode
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-blue-100 text-blue-700'
                            }
                        `}>
                            {selectedTags.length}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Filter Mode Toggle */}
                    {selectedTags.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFilterMode(); }}
                            className={`
                                px-2 py-1 rounded text-xs font-medium transition-colors
                                ${isDarkMode
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }
                            `}
                        >
                            {filterMode}
                        </button>
                    )}

                    {/* Clear Button */}
                    {selectedTags.length > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); clearTags(); }}
                            className={`
                                p-1 rounded transition-colors
                                ${isDarkMode
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }
                            `}
                        >
                            <X size={16} />
                        </button>
                    )}

                    {/* Expand/Collapse */}
                    {isExpanded
                        ? <ChevronUp size={18} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                        : <ChevronDown size={18} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                    }
                </div>
            </div>

            {/* Selected Tags Preview (when collapsed) */}
            {!isExpanded && selectedTags.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                    {selectedTags.slice(0, 5).map(tagId => (
                        <TagChip
                            key={tagId}
                            tagId={tagId}
                            isDarkMode={isDarkMode}
                            isSelected
                            isRemovable
                            size="xs"
                            onRemove={() => toggleTag(tagId)}
                        />
                    ))}
                    {selectedTags.length > 5 && (
                        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            +{selectedTags.length - 5} more
                        </span>
                    )}
                </div>
            )}

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className={`
                            px-4 pb-4 border-t
                            ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}
                        `}>
                            {/* Categories */}
                            <div className="mt-3 space-y-3">
                                {tagsByCategory.map(([categoryId, tags]) => (
                                    <div key={categoryId}>
                                        {/* Category Header */}
                                        <button
                                            onClick={() => setExpandedCategory(
                                                expandedCategory === categoryId ? null : categoryId
                                            )}
                                            className={`
                                                flex items-center gap-1 text-xs font-semibold uppercase tracking-wider mb-2
                                                ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}
                                            `}
                                        >
                                            <span>{TAG_CATEGORIES[categoryId]?.label || categoryId}</span>
                                            <span className="text-[10px] opacity-60">({tags.length})</span>
                                        </button>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {tags.map(tagId => (
                                                <TagChip
                                                    key={tagId}
                                                    tagId={tagId}
                                                    isDarkMode={isDarkMode}
                                                    isSelected={selectedTags.includes(tagId)}
                                                    size="sm"
                                                    onClick={() => toggleTag(tagId)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

TagFilter.displayName = 'TagFilter';

export default TagFilter;
