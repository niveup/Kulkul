/**
 * Breadcrumb - Navigation path component
 * 
 * Shows hierarchical navigation path:
 * Class 12 > Physics > Electrostatics > Gauss's Law
 * 
 * Features:
 * - Clickable navigation
 * - Truncation for long paths
 * - Mobile responsive
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Component
 * @param {Array} items - Array of { label, onClick, isActive } objects
 * @param {boolean} isDarkMode - Theme mode
 * @param {boolean} showHome - Whether to show home icon at start
 * @param {function} onHomeClick - Click handler for home
 */
const Breadcrumb = memo(({
    items = [],
    isDarkMode = false,
    showHome = true,
    onHomeClick,
}) => {
    if (items.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb navigation"
            className="flex items-center flex-wrap gap-1"
        >
            {/* Home Icon */}
            {showHome && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onHomeClick}
                        className={`
                            p-1.5 rounded-lg transition-colors
                            ${isDarkMode
                                ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }
                        `}
                        aria-label="Home"
                    >
                        <Home size={16} />
                    </motion.button>
                    <ChevronRight
                        size={14}
                        className={isDarkMode ? 'text-slate-600' : 'text-slate-300'}
                    />
                </>
            )}

            {/* Breadcrumb Items */}
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        <motion.button
                            whileHover={!isLast ? { scale: 1.02 } : {}}
                            whileTap={!isLast ? { scale: 0.98 } : {}}
                            onClick={!isLast ? item.onClick : undefined}
                            disabled={isLast}
                            className={`
                                px-2 py-1 rounded-lg text-sm font-medium
                                transition-colors max-w-[150px] truncate
                                ${isLast
                                    ? isDarkMode
                                        ? 'text-white cursor-default'
                                        : 'text-slate-900 cursor-default'
                                    : isDarkMode
                                        ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer'
                                        : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                }
                            `}
                            title={item.label}
                        >
                            {item.label}
                        </motion.button>

                        {!isLast && (
                            <ChevronRight
                                size={14}
                                className={isDarkMode ? 'text-slate-600' : 'text-slate-300'}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
