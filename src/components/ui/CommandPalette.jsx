/**
 * Command Palette (Cmd+K / Ctrl+K)
 * 
 * Spotlight-style command interface for power users.
 * Features:
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Fuzzy search across actions
 * - Quick navigation between tabs
 * - AI quick actions
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Home,
    BookOpen,
    PieChart,
    LayoutGrid,
    Bot,
    ClipboardCheck,
    Settings,
    Moon,
    Sun,
    Zap,
    ArrowRight,
    Command,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { springs } from '../../lib/motion';
import GlassPanel from './GlassPanel';

// Command categories and actions
const COMMANDS = [
    // Navigation
    { id: 'nav-overview', label: 'Go to Overview', icon: Home, category: 'Navigation', action: 'navigate', target: 'overview' },
    { id: 'nav-study', label: 'Go to Study Tools', icon: BookOpen, category: 'Navigation', action: 'navigate', target: 'study-tools' },
    { id: 'nav-progress', label: 'Go to Progress', icon: PieChart, category: 'Navigation', action: 'navigate', target: 'progress' },
    { id: 'nav-resources', label: 'Go to Resources', icon: LayoutGrid, category: 'Navigation', action: 'navigate', target: 'resources' },
    { id: 'nav-ai', label: 'Go to AI Assistant', icon: Bot, category: 'Navigation', action: 'navigate', target: 'ai-assistant' },
    { id: 'nav-test', label: 'Go to Practice Test', icon: ClipboardCheck, category: 'Navigation', action: 'navigate', target: 'test' },

    // Actions
    { id: 'action-theme', label: 'Toggle Dark Mode', icon: Moon, category: 'Actions', action: 'toggle-theme' },
    { id: 'action-timer', label: 'Start Pomodoro Timer', icon: Zap, category: 'Actions', action: 'start-timer' },
    { id: 'action-settings', label: 'Open Settings', icon: Settings, category: 'Actions', action: 'open-settings' },
];

const CommandPalette = ({
    isOpen,
    onClose,
    onNavigate,
    onToggleTheme,
    onStartTimer,
    isDarkMode,
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) return COMMANDS;

        const lowerQuery = query.toLowerCase();
        return COMMANDS.filter(cmd =>
            cmd.label.toLowerCase().includes(lowerQuery) ||
            cmd.category.toLowerCase().includes(lowerQuery)
        );
    }, [query]);

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const groups = {};
        filteredCommands.forEach(cmd => {
            if (!groups[cmd.category]) groups[cmd.category] = [];
            groups[cmd.category].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Execute command
    const executeCommand = useCallback((command) => {
        switch (command.action) {
            case 'navigate':
                onNavigate?.(command.target);
                break;
            case 'toggle-theme':
                onToggleTheme?.();
                break;
            case 'start-timer':
                onStartTimer?.();
                break;
            case 'open-settings':
                // TODO: Open settings modal
                break;
            default:
                break;
        }
        onClose();
    }, [onNavigate, onToggleTheme, onStartTimer, onClose]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
            default:
                break;
        }
    }, [filteredCommands, selectedIndex, onClose, executeCommand]);

    // Global keyboard shortcut
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // This would need to be handled by parent
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={springs.snappy}
                        className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-xl"
                    >
                        <GlassPanel variant="thick" padding={false} rounded="2xl" className="overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                                <Search size={20} className="text-slate-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setSelectedIndex(0);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a command or search..."
                                    className={cn(
                                        'flex-1 bg-transparent border-none outline-none',
                                        'text-white placeholder-slate-400',
                                        'text-lg font-medium'
                                    )}
                                />
                                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-mono text-slate-400 bg-white/5 rounded">
                                    ESC
                                </kbd>
                            </div>

                            {/* Results */}
                            <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
                                {filteredCommands.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400">
                                        No commands found
                                    </div>
                                ) : (
                                    Object.entries(groupedCommands).map(([category, commands]) => (
                                        <div key={category} className="mb-3">
                                            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {category}
                                            </div>
                                            {commands.map((command) => {
                                                const globalIndex = filteredCommands.indexOf(command);
                                                const isSelected = globalIndex === selectedIndex;
                                                const Icon = command.icon;

                                                return (
                                                    <motion.button
                                                        key={command.id}
                                                        onClick={() => executeCommand(command)}
                                                        className={cn(
                                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                                                            'text-left transition-colors',
                                                            isSelected
                                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                                : 'text-slate-300 hover:bg-white/5'
                                                        )}
                                                        whileHover={{ x: 4 }}
                                                        transition={{ duration: 0.1 }}
                                                    >
                                                        <div className={cn(
                                                            'w-8 h-8 rounded-lg flex items-center justify-center',
                                                            isSelected ? 'bg-cyan-500/20' : 'bg-white/5'
                                                        )}>
                                                            <Icon size={16} />
                                                        </div>
                                                        <span className="flex-1 font-medium">{command.label}</span>
                                                        {isSelected && (
                                                            <ArrowRight size={14} className="text-cyan-400" />
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-4 px-4 py-3 border-t border-white/10 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↵</kbd>
                                    Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">ESC</kbd>
                                    Close
                                </span>
                            </div>
                        </GlassPanel>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
