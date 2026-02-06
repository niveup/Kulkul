/**
 * SearchHistory - Recent searches display component
 * 
 * Features:
 * - Shows recent search queries
 * - Click to re-run search
 * - Clear history option
 * - Animated appearance
 */

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Search, Trash2 } from 'lucide-react';

/**
 * Format timestamp to relative time
 */
const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
};

/**
 * SearchHistory Component
 * @param {Array} history - Array of { query, timestamp } objects
 * @param {function} onSelect - Callback when a history item is clicked
 * @param {function} onClear - Callback to clear all history
 * @param {function} onRemove - Callback to remove single item
 * @param {boolean} isDarkMode - Theme mode
 * @param {boolean} isVisible - Whether component is visible
 * @param {number} maxItems - Maximum items to display
 */
const SearchHistory = memo(({
    history = [],
    onSelect,
    onClear,
    onRemove,
    isDarkMode = false,
    isVisible = true,
    maxItems = 8,
}) => {
    if (!isVisible || history.length === 0) return null;

    const displayHistory = history.slice(0, maxItems);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
                absolute top-full left-0 right-0 mt-2 z-50
                rounded-xl border shadow-xl overflow-hidden
                ${isDarkMode
                    ? 'bg-slate-900/95 border-slate-700/50 backdrop-blur-xl'
                    : 'bg-white/95 border-slate-200/50 backdrop-blur-xl'
                }
            `}
        >
            {/* Header */}
            <div className={`
                flex items-center justify-between px-4 py-2 border-b
                ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}
            `}>
                <div className="flex items-center gap-2">
                    <Clock size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Recent Searches
                    </span>
                </div>

                {onClear && (
                    <button
                        onClick={onClear}
                        className={`
                            flex items-center gap-1 px-2 py-1 rounded text-xs
                            transition-colors
                            ${isDarkMode
                                ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                                : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                            }
                        `}
                    >
                        <Trash2 size={12} />
                        Clear
                    </button>
                )}
            </div>

            {/* History Items */}
            <div className="max-h-[300px] overflow-y-auto">
                <AnimatePresence>
                    {displayHistory.map((item, index) => (
                        <motion.div
                            key={`${item.query}-${item.timestamp}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <div
                                className={`
                                    flex items-center justify-between px-4 py-2.5 group
                                    cursor-pointer transition-colors
                                    ${isDarkMode
                                        ? 'hover:bg-slate-800/50'
                                        : 'hover:bg-slate-50'
                                    }
                                `}
                                onClick={() => onSelect?.(item.query)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Search size={14} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                                    <span className={`
                                        text-sm truncate
                                        ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}
                                    `}>
                                        {item.query}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`
                                        text-xs opacity-0 group-hover:opacity-100 transition-opacity
                                        ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}
                                    `}>
                                        {formatRelativeTime(item.timestamp)}
                                    </span>

                                    {onRemove && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemove(item.query);
                                            }}
                                            className={`
                                                p-1 rounded opacity-0 group-hover:opacity-100 transition-all
                                                ${isDarkMode
                                                    ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                }
                                            `}
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* More indicator */}
            {history.length > maxItems && (
                <div className={`
                    px-4 py-2 text-center text-xs border-t
                    ${isDarkMode
                        ? 'text-slate-500 border-slate-700/50'
                        : 'text-slate-400 border-slate-200/50'
                    }
                `}>
                    +{history.length - maxItems} more searches
                </div>
            )}
        </motion.div>
    );
});

SearchHistory.displayName = 'SearchHistory';

export default SearchHistory;
