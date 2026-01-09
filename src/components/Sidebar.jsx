/**
 * Premium Sidebar Component
 * 
 * Features:
 * - Glassmorphism design
 * - Smooth animations with Framer Motion
 * - Keyboard navigation (arrow keys)
 * - Accessibility compliant (ARIA)
 * - Radix UI Tooltip for collapsed state
 * - Active state with glow effects
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
    Home,
    BookOpen,
    PieChart,
    LayoutGrid,
    Bot,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    LogOut,
    User,
    Shield
} from 'lucide-react';
import { cn, getGreeting } from '../lib/utils';
import { useAppStore, useSidebar, useTheme, useNavigation } from '../store';
import { useHotkey, useKeyPress } from '../hooks';

// =============================================================================
// Menu Configuration
// =============================================================================

const MENU_ITEMS = [
    { id: 'overview', icon: Home, label: 'Overview', shortcut: '1' },
    { id: 'study-tools', icon: BookOpen, label: 'Study Tools', shortcut: '2' },
    { id: 'progress', icon: PieChart, label: 'Progress', shortcut: '3' },
    { id: 'resources', icon: LayoutGrid, label: 'Resources', shortcut: '4' },
    { id: 'ai-assistant', icon: Bot, label: 'AI Assistant', shortcut: '5' },
    { id: 'admin', icon: Shield, label: 'Admin', shortcut: '6', badge: '⚠️' },
];

// =============================================================================
// NavItem Component
// =============================================================================

const NavItem = ({
    item,
    isActive,
    isCollapsed,
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

    const content = (
        <motion.button
            ref={itemRef}
            onClick={() => onSelect(item.id)}
            className={cn(
                'group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl',
                'transition-all duration-200 outline-none',
                'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                isCollapsed ? 'justify-center' : '',
                isActive
                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Active Indicator Glow */}
            {isActive && (
                <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
            )}

            {/* Icon */}
            <div className="relative z-10">
                <Icon
                    size={20}
                    className={cn(
                        'transition-all duration-200',
                        isActive
                            ? 'text-indigo-500 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                />
                {isActive && (
                    <motion.div
                        className="absolute -inset-1 rounded-full bg-indigo-500/20 dark:bg-indigo-400/30 blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    />
                )}
            </div>

            {/* Label */}
            <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.span
                        className="relative z-10 font-medium truncate flex-1 text-left"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Badge */}
            {!isCollapsed && item.badge && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full"
                >
                    {item.badge}
                </motion.span>
            )}

            {/* Keyboard Shortcut Hint */}
            {!isCollapsed && (
                <span className="text-xs text-slate-300 dark:text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                </span>
            )}
        </motion.button>
    );

    // Wrap in tooltip when collapsed
    if (isCollapsed) {
        return (
            <Tooltip.Root delayDuration={100}>
                <Tooltip.Trigger asChild>
                    {content}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        side="right"
                        sideOffset={12}
                        className={cn(
                            'z-50 px-3 py-2 text-sm font-medium',
                            'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                            'rounded-lg shadow-lg',
                            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                            'data-[side=right]:slide-in-from-left-2'
                        )}
                    >
                        {item.label}
                        <Tooltip.Arrow className="fill-slate-900 dark:fill-white" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        );
    }

    return content;
};

// =============================================================================
// Main Sidebar Component
// =============================================================================

const Sidebar = () => {
    const { collapsed, toggle } = useSidebar();
    const { isDarkMode, toggleTheme } = useTheme();
    const { activeTab, setActiveTab } = useNavigation();
    const [focusedIndex, setFocusedIndex] = React.useState(-1);

    // Keyboard navigation shortcuts
    useHotkey('ctrl+b', () => toggle(), [toggle]);
    useHotkey('ctrl+\\', () => toggle(), [toggle]);

    // Number key shortcuts
    MENU_ITEMS.forEach((item, index) => {
        useHotkey(item.shortcut, () => setActiveTab(item.id), [setActiveTab]);
    });

    // Arrow key navigation when sidebar is focused
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
        <Tooltip.Provider>
            <>
                {/* Backdrop - visible when expanded on mobile */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                            onClick={toggle}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: collapsed ? 64 : 256 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={cn(
                        'fixed left-0 top-0 h-screen z-50',
                        'flex flex-col p-3',
                        'bg-white/80 dark:bg-slate-900/90',
                        'backdrop-blur-xl',
                        'border-r border-slate-200/50 dark:border-white/5',
                        'shadow-xl shadow-slate-200/50 dark:shadow-none'
                    )}
                    onKeyDown={handleKeyDown}
                    role="navigation"
                    aria-label="Main navigation"
                >
                    {/* Logo Area */}
                    <div className={cn(
                        'flex items-center mb-8 mt-1',
                        collapsed ? 'justify-center px-0' : 'gap-3 px-2'
                    )}>
                        <motion.div
                            className="relative flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                                <Sparkles size={20} />
                            </div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 blur-lg opacity-40 -z-10" />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="overflow-hidden"
                                >
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        StudyHub
                                    </h1>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        v1.0.0 • Pro
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Section (when expanded) */}
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mb-6 px-2"
                            >
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-white/5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-emerald-500/20">
                                        U
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                            {getGreeting()}!
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            JEE 2026 Aspirant
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Menu */}
                    <nav className="flex-1 space-y-1">
                        {MENU_ITEMS.map((item, index) => (
                            <NavItem
                                key={item.id}
                                item={item}
                                isActive={activeTab === item.id}
                                isCollapsed={collapsed}
                                onSelect={setActiveTab}
                                index={index}
                                isFocused={focusedIndex === index}
                            />
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="pt-4 space-y-1 border-t border-slate-200/50 dark:border-white/5">
                        {/* Theme Toggle */}
                        <motion.button
                            onClick={toggleTheme}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
                                'text-slate-500 dark:text-slate-400',
                                'hover:bg-white/60 dark:hover:bg-white/5',
                                'hover:text-slate-700 dark:hover:text-slate-200',
                                'transition-colors duration-200',
                                collapsed ? 'justify-center' : ''
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <AnimatePresence mode="wait">
                                {isDarkMode ? (
                                    <motion.div
                                        key="sun"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Sun size={20} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="moon"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Moon size={20} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!collapsed && <span className="font-medium">
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </span>}
                        </motion.button>

                        {/* Settings */}
                        <motion.button
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
                                'text-slate-500 dark:text-slate-400',
                                'hover:bg-white/60 dark:hover:bg-white/5',
                                'hover:text-slate-700 dark:hover:text-slate-200',
                                'transition-colors duration-200',
                                collapsed ? 'justify-center' : ''
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Settings size={20} />
                            {!collapsed && <span className="font-medium">Settings</span>}
                        </motion.button>
                    </div>

                    {/* Collapse Toggle */}
                    <motion.button
                        onClick={toggle}
                        className={cn(
                            'absolute -right-3 top-20',
                            'w-6 h-6 rounded-full',
                            'bg-white dark:bg-slate-800',
                            'border border-slate-200 dark:border-slate-700',
                            'shadow-sm',
                            'flex items-center justify-center',
                            'text-slate-400 dark:text-slate-500',
                            'hover:text-indigo-600 dark:hover:text-indigo-400',
                            'hover:border-indigo-300 dark:hover:border-indigo-700',
                            'transition-colors duration-200',
                            'z-50'
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <motion.div
                            animate={{ rotate: collapsed ? 0 : 180 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronRight size={14} />
                        </motion.div>
                    </motion.button>
                </motion.aside>
            </>
        </Tooltip.Provider>
    );
};

export default Sidebar;
