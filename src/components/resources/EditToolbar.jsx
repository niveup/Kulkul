/**
 * EditToolbar - Floating Edit Controls
 * 
 * Features:
 * - Collapsible to draggable circle
 * - Can snap to 4 corners
 * - Smooth expand/collapse transitions
 * - Edit mode toggle
 * - Theme customizer
 * - Reset to default
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import { useIsEditMode, useTheme, useResourceActions } from '../../store/resourceStore';
import { cn } from '../../lib/utils';
import {
    Edit3,
    RotateCcw,
    Check,
    Sliders,
    X,
    Sparkles
} from 'lucide-react';

// =============================================================================
// CORNER POSITIONS
// =============================================================================
const CORNER_POSITIONS = {
    'bottom-center': { bottom: 24, left: '50%', x: '-50%', y: 0 },
    'bottom-left': { bottom: 24, left: 24, x: 0, y: 0 },
    'bottom-right': { bottom: 24, right: 24, x: 0, y: 0 },
    'top-left': { top: 80, left: 24, x: 0, y: 0 },
    'top-right': { top: 80, right: 24, x: 0, y: 0 },
};

// =============================================================================
// ACCENT COLOR PRESETS
// =============================================================================
const ACCENT_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Sky', value: '#0ea5e9' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const EditToolbar = ({ isDarkMode }) => {
    const isEditMode = useIsEditMode();
    const theme = useTheme();
    const { setEditMode, updateTheme, resetToDefault } = useResourceActions();
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [corner, setCorner] = useState('bottom-center');

    // Get position styles for current corner
    const getPositionStyles = () => {
        const pos = CORNER_POSITIONS[corner];
        const styles = {};
        if (pos.bottom !== undefined) styles.bottom = pos.bottom;
        if (pos.top !== undefined) styles.top = pos.top;
        if (pos.left !== undefined) styles.left = pos.left;
        if (pos.right !== undefined) styles.right = pos.right;
        return styles;
    };

    // Cycle to next corner position
    const cycleCorner = () => {
        const corners = Object.keys(CORNER_POSITIONS);
        const currentIndex = corners.indexOf(corner);
        const nextIndex = (currentIndex + 1) % corners.length;
        setCorner(corners[nextIndex]);
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isCollapsed ? (
                    /* ============ COLLAPSED CIRCLE ============ */
                    <motion.div
                        key="collapsed"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={getPositionStyles()}
                        className={cn(
                            'fixed z-50',
                            corner === 'bottom-center' && '-translate-x-1/2'
                        )}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCollapsed(false)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                cycleCorner();
                            }}
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center',
                                'backdrop-blur-xl border shadow-2xl',
                                'cursor-pointer group relative',
                                isDarkMode
                                    ? 'bg-slate-900/90 border-slate-700/50 shadow-black/30'
                                    : 'bg-white/90 border-slate-200/50 shadow-slate-300/50'
                            )}
                            style={{
                                background: `linear-gradient(135deg, ${theme.accent}20, ${isDarkMode ? '#0f172a' : '#ffffff'}90)`
                            }}
                        >
                            {/* Animated ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                animate={{
                                    boxShadow: [
                                        `0 0 0 0px ${theme.accent}40`,
                                        `0 0 0 8px ${theme.accent}00`,
                                    ]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeOut'
                                }}
                            />
                            <Sparkles
                                size={24}
                                className="text-indigo-500 group-hover:rotate-12 transition-transform"
                                style={{ color: theme.accent }}
                            />

                            {/* Corner indicator tooltip */}
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    'absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap',
                                    isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                )}
                            >
                                Right-click to move
                            </motion.span>
                        </motion.button>
                    </motion.div>
                ) : (
                    /* ============ EXPANDED TOOLBAR ============ */
                    <motion.div
                        key="expanded"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={getPositionStyles()}
                        className={cn(
                            'fixed z-50',
                            'flex items-center gap-2 p-2 rounded-2xl',
                            'backdrop-blur-xl border shadow-2xl',
                            corner === 'bottom-center' && '-translate-x-1/2',
                            isDarkMode
                                ? 'bg-slate-900/90 border-slate-700/50 shadow-black/20'
                                : 'bg-white/90 border-slate-200/50 shadow-slate-200/50'
                        )}
                    >
                        {/* Collapse Button (X) */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsCollapsed(true)}
                            className={cn(
                                'p-2 rounded-xl transition-colors',
                                isDarkMode
                                    ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            )}
                            title="Minimize toolbar"
                        >
                            <X size={16} />
                        </motion.button>

                        {/* Divider */}
                        <div className={cn('h-8 w-px', isDarkMode ? 'bg-slate-700' : 'bg-slate-300')} />

                        {/* Edit Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditMode(!isEditMode)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all',
                                isEditMode
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                    : isDarkMode
                                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            )}
                        >
                            {isEditMode ? (
                                <>
                                    <Check size={16} />
                                    Done Editing
                                </>
                            ) : (
                                <>
                                    <Edit3 size={16} />
                                    Edit Layout
                                </>
                            )}
                        </motion.button>

                        {/* Divider */}
                        <div className={cn('h-8 w-px', isDarkMode ? 'bg-slate-700' : 'bg-slate-300')} />

                        {/* Theme Customizer */}
                        <Popover.Root open={isThemeOpen} onOpenChange={setIsThemeOpen}>
                            <Popover.Trigger asChild>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                                        isDarkMode
                                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    )}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{
                                            backgroundColor: theme.accent,
                                            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Sliders size={16} />
                                </motion.button>
                            </Popover.Trigger>

                            <Popover.Portal>
                                <Popover.Content
                                    side="top"
                                    sideOffset={12}
                                    className={cn(
                                        'w-72 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl z-50',
                                        isDarkMode
                                            ? 'bg-slate-900/95 border-slate-700'
                                            : 'bg-white/95 border-slate-200'
                                    )}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={cn('font-bold', isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            Theme Settings
                                        </h3>
                                        <button
                                            onClick={() => setIsThemeOpen(false)}
                                            className={cn(
                                                'p-1 rounded-lg transition-colors',
                                                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                                            )}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Accent Color */}
                                    <div className="mb-4">
                                        <label className={cn('text-xs font-semibold uppercase tracking-wider mb-2 block', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                                            Accent Color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ACCENT_COLORS.map((color) => (
                                                <button
                                                    key={color.name}
                                                    onClick={() => updateTheme({ accent: color.value })}
                                                    className={cn(
                                                        'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                                                        theme.accent === color.value
                                                            ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                                                            : ''
                                                    )}
                                                    style={{
                                                        backgroundColor: color.value,
                                                        borderColor: theme.accent === color.value ? color.value : 'transparent',
                                                        ringColor: color.value
                                                    }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Glass Intensity */}
                                    <div className="mb-4">
                                        <label className={cn('text-xs font-semibold uppercase tracking-wider mb-2 block', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                                            Glass Intensity: {Math.round(theme.glassIntensity * 100)}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={theme.glassIntensity * 100}
                                            onChange={(e) => updateTheme({ glassIntensity: parseInt(e.target.value) / 100 })}
                                            className={cn(
                                                'w-full h-2 rounded-full appearance-none cursor-pointer',
                                                isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                                            )}
                                            style={{
                                                accentColor: theme.accent
                                            }}
                                        />
                                    </div>

                                    {/* Border Radius */}
                                    <div className="mb-4">
                                        <label className={cn('text-xs font-semibold uppercase tracking-wider mb-2 block', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                                            Card Roundness: {theme.borderRadius}px
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="32"
                                            value={theme.borderRadius}
                                            onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                                            className={cn(
                                                'w-full h-2 rounded-full appearance-none cursor-pointer',
                                                isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                                            )}
                                            style={{
                                                accentColor: theme.accent
                                            }}
                                        />
                                    </div>

                                    {/* Density */}
                                    <div>
                                        <label className={cn('text-xs font-semibold uppercase tracking-wider mb-2 block', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                                            Density
                                        </label>
                                        <div className="flex gap-2">
                                            {['compact', 'comfortable', 'spacious'].map((density) => (
                                                <button
                                                    key={density}
                                                    onClick={() => updateTheme({ density })}
                                                    className={cn(
                                                        'flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all',
                                                        theme.density === density
                                                            ? 'bg-indigo-500 text-white'
                                                            : isDarkMode
                                                                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    )}
                                                >
                                                    {density}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Popover.Arrow className={isDarkMode ? 'fill-slate-700' : 'fill-slate-200'} />
                                </Popover.Content>
                            </Popover.Portal>
                        </Popover.Root>

                        {/* Reset Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (confirm('Reset all customizations to default? This cannot be undone.')) {
                                    resetToDefault();
                                }
                            }}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                                isDarkMode
                                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                            )}
                        >
                            <RotateCcw size={16} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Mode Banner */}
            <AnimatePresence>
                {isEditMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                            'fixed top-20 left-1/2 -translate-x-1/2 z-40',
                            'px-4 py-2 rounded-full',
                            'bg-indigo-500 text-white text-sm font-semibold',
                            'shadow-lg shadow-indigo-500/25'
                        )}
                    >
                        ✨ Edit Mode Active — Drag cards to reorder, right-click for options
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EditToolbar;
