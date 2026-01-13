/**
 * Premium Sidebar Component
 * 
 * Features:
 * - Glassmorphism design
 * - Dynamic Expansion on Hover (Apple-style)
 * - Smooth Spring Animations
 * - Keyboard navigation
 * - Accessibility compliant
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import {
    LayoutGrid,       // Safer than LayoutTemplate
    BookOpen,         // Replacing Brain for "Study Tools"
    TrendingUp,
    Layers,
    MessageSquare,    // Safer than MessageSquareStar
    ShieldCheck,      // Safer than Fingerprint
    Settings,
    Moon,
    Sun,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme, useNavigation } from '../store';
import { useHotkey } from '../hooks';

// =============================================================================
// Menu Configuration
// =============================================================================

// "Product Manager" Note:
// We are moving away from generic icons to "Identity-First" icons.
// Each section represents a distinct "mode" of the user's brain.
// - Overview -> Structure (Blue)
// - study-tools -> Processing/Brain (Amber)
// - Progress -> Growth (Emerald)
// - Resources -> Depth/Layers (Rose)
// - AI -> Magic (Violet)
// - Admin -> Identity/Security (Slate)

const MENU_ITEMS = [
    {
        id: 'overview',
        icon: LayoutGrid,
        label: 'Overview',
        shortcut: '1',
        color: 'text-blue-500',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        activeBorder: 'border-blue-500/20'
    },
    {
        id: 'study-tools',
        icon: BookOpen,
        label: 'Study Tools',
        shortcut: '2',
        color: 'text-amber-500',
        gradient: 'from-amber-500/20 to-orange-500/20',
        activeBorder: 'border-amber-500/20'
    },
    {
        id: 'progress',
        icon: TrendingUp,
        label: 'Progress',
        shortcut: '3',
        color: 'text-emerald-500',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        activeBorder: 'border-emerald-500/20'
    },
    {
        id: 'resources',
        icon: Layers,
        label: 'Resources',
        shortcut: '4',
        color: 'text-pink-500',
        gradient: 'from-pink-500/20 to-rose-500/20',
        activeBorder: 'border-pink-500/20'
    },
    {
        id: 'ai-assistant',
        icon: MessageSquare,
        label: 'AI Assistant',
        shortcut: '5',
        color: 'text-violet-500',
        gradient: 'from-violet-500/20 to-purple-500/20',
        activeBorder: 'border-violet-500/20'
    },
    {
        id: 'admin',
        icon: ShieldCheck,
        label: 'Admin',
        shortcut: '6',
        badge: '⚠️',
        color: 'text-slate-500',
        gradient: 'from-slate-500/20 to-gray-500/20',
        activeBorder: 'border-slate-500/20'
    },
];

// =============================================================================
// NavItem Component
// =============================================================================

// =============================================================================
// NavItem Component
// =============================================================================

// =============================================================================
// NavItem Component
// =============================================================================

const NavItem = ({
    item,
    isActive,
    isExpanded,
    onSelect,
    index,
    isFocused
}) => {
    const Icon = item.icon;
    const itemRef = useRef(null);

    useEffect(() => {
        if (isFocused && itemRef.current) {
            itemRef.current.focus();
        }
    }, [isFocused]);

    // Enhanced color logic for active states
    const activeColorClass = item.color || 'text-indigo-500';
    const bgClass = activeColorClass.replace('text-', 'bg-');

    return (
        <motion.button
            ref={itemRef}
            layout="position"
            onClick={() => onSelect(item.id)}
            className={cn(
                'group relative flex items-center gap-4 rounded-[18px]', // Slightly softer radius
                isExpanded
                    ? 'w-full px-4 py-3.5 justify-start'
                    : 'w-12 h-12 mx-auto justify-center p-0',
                'transition-all duration-300 outline-none select-none',
                'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                isActive
                    ? 'shadow-md shadow-black/5 dark:shadow-none' // Depth for active item
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
            )}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{
                layout: { duration: 0.2, ease: "easeOut" }
            }}
        >
            {/* Active Background - The "Pill" */}
            {isActive && (
                <motion.div
                    layoutId="activeGlow"
                    className={cn(
                        "absolute inset-0 rounded-[18px] border border-white/50 dark:border-white/5",
                        "bg-white dark:bg-white/10", // Glassy background
                        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    )}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                >
                    {/* Subtle Gradient Overlay respective to the item color */}
                    <div className={cn(
                        "absolute inset-0 opacity-20 dark:opacity-30 rounded-[18px] bg-gradient-to-r",
                        item.gradient
                    )} />
                </motion.div>
            )}

            {/* Icon Container */}
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center">
                <Icon
                    size={22} // Slightly smaller for elegance
                    className={cn(
                        'transition-colors duration-300',
                        isActive
                            ? activeColorClass
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    )}
                />

                {/* Active "Breathing" Glow behind Icon */}
                {isActive && (
                    <motion.div
                        className={cn(
                            "absolute -inset-3 rounded-full blur-xl opacity-40",
                            bgClass
                        )}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: [0.3, 0.5, 0.3],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}
            </div>

            {/* Text Label - Expanding Reveal */}
            <AnimatePresence mode="popLayout">
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, x: -8, filter: 'blur(4px)' }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            filter: 'blur(0px)',
                            transition: {
                                delay: 0.1, // Stagger text slightly
                                duration: 0.3,
                                ease: "easeOut"
                            }
                        }}
                        exit={{ opacity: 0, x: -8, filter: 'blur(4px)', transition: { duration: 0.15 } }}
                        className="flex-1 overflow-hidden whitespace-nowrap text-left pl-1"
                    >
                        <span className={cn(
                            "font-semibold text-[15px] block truncate tracking-wide",
                            isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"
                        )}>
                            {item.label}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shortcut Hint */}
            <AnimatePresence>
                {isExpanded && item.shortcut && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4, transition: { delay: 0.3 } }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-mono font-medium ml-auto mr-1"
                    >
                        {item.shortcut}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// =============================================================================
// Main Sidebar Component
// =============================================================================

const Sidebar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { activeTab, setActiveTab } = useNavigation();
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const [isExpanded, setIsExpanded] = useState(false);
    const sidebarRef = useRef(null);

    // Mouse Spotlight Logic - Optimized with useMotionTemplate and direct ref manipulation where possible
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = useCallback(({ clientX, clientY, currentTarget }) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }, [mouseX, mouseY]);

    // Number key shortcuts
    MENU_ITEMS.forEach((item, index) => {
        useHotkey(item.shortcut, () => setActiveTab(item.id), [setActiveTab]);
    });

    // Arrow key navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => Math.min(prev + 1, MENU_ITEMS.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
            setActiveTab(MENU_ITEMS[focusedIndex].id);
        }
    }, [focusedIndex, setActiveTab]);


    return (
        <motion.aside
            ref={sidebarRef}
            initial={false}
            animate={{
                width: isExpanded ? 280 : 88, // Refined widths
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            onKeyDown={handleKeyDown}
            className={cn(
                'fixed left-0 top-0 h-screen z-[9999]', // Full Height
                'flex flex-col pb-6',
                // Interior padding handle dynamically to avoid layout shifts
                'bg-white/70 dark:bg-[#050510]/60 backdrop-blur-2xl', // Richer custom blur
                'border-r border-white/20 dark:border-white/5',
                'shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_40px_-4px_rgba(0,0,0,0.2)]',
                'overflow-hidden will-change-[width]',
                'group/sidebar'
            )}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Dynamic Spotlight Effect - Subtle and Premium */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover/sidebar:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            600px circle at ${mouseX}px ${mouseY}px,
                            rgba(var(--color-primary-500-rgb), 0.06),
                            transparent 80%
                        )
                    `
                }}
            />

            {/* Logo Section - The "Crown Jewel" */}
            <div className="flex items-center gap-4 mb-2 mt-6 px-5 relative z-10 h-16 shrink-0">
                <motion.div
                    className="relative cursor-pointer group/logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Refined Logo Container */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 relative overflow-hidden isolate">
                        {/* Internal Gloss */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-60 mix-blend-overlay" />

                        {/* Shimmer Effect Interval */}
                        <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_3s_infinite_2s] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                        {/* Logo Icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 drop-shadow-md">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                </motion.div>

                <AnimatePresence mode="popLayout">
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -4, filter: 'blur(4px)' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="whitespace-nowrap flex flex-col justify-center"
                        >
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                                StudyHub
                            </h1>
                            <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 tracking-[0.2em] uppercase opacity-90 pl-0.5 mt-1.5">
                                Workspace
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-2 w-full relative z-10 px-3 py-4 overflow-y-auto scrollbar-hide">
                {MENU_ITEMS.map((item, index) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isActive={activeTab === item.id}
                        isExpanded={isExpanded}
                        onSelect={setActiveTab}
                        index={index}
                        isFocused={focusedIndex === index}
                    />
                ))}
            </nav>

            {/* Bottom Actions - Refined */}
            <div className="mt-auto pt-4 px-3 pb-2 space-y-1 border-t border-slate-200/50 dark:border-white/5 w-full relative z-10">
                {/* Theme Toggle */}
                <motion.button
                    onClick={toggleTheme}
                    className={cn(
                        'group flex items-center gap-3 rounded-2xl relative overflow-hidden',
                        isExpanded ? 'w-full px-4 py-3.5' : 'w-12 h-12 justify-center mx-auto',
                        'hover:bg-slate-100/50 dark:hover:bg-white/5',
                        'transition-all duration-300'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="relative z-10 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        <AnimatePresence mode="wait" initial={false}>
                            {isDarkMode ? (
                                <motion.div
                                    key="sun"
                                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Sun size={20} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="moon"
                                    initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                    exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Moon size={20} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-medium text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap overflow-hidden"
                            >
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Settings */}
                <motion.button
                    className={cn(
                        'group flex items-center gap-3 rounded-2xl relative overflow-hidden',
                        isExpanded ? 'w-full px-4 py-3.5' : 'w-12 h-12 justify-center mx-auto',
                        'hover:bg-slate-100/50 dark:hover:bg-white/5',
                        'transition-all duration-300'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="relative z-10 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        <Settings size={20} className="transform group-hover:rotate-90 transition-transform duration-500" />
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-medium text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap overflow-hidden"
                            >
                                Settings
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
