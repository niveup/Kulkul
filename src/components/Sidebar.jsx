import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    BookOpen,
    TrendingUp,
    Layers,
    MessageSquare,
    ShieldCheck,
    Settings,
    Sun,
    Monitor,
    UserCircle2
} from 'lucide-react'; // Using standard Lucide icons
import { cn } from '../lib/utils';
import { useAppStore } from '../store';
import { useHotkey } from '../hooks';

// =============================================================================
// Designer Configuration
// =============================================================================
// "Human" touches: distinct names, thinner confident strokes
const MENU_ITEMS = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview', shortcut: '1' },
    { id: 'study-tools', icon: BookOpen, label: 'Workstation', shortcut: '2' }, // Renamed for "Pro" feel
    { id: 'progress', icon: TrendingUp, label: 'Analytics', shortcut: '3' },
    { id: 'resources', icon: Layers, label: 'Library', shortcut: '4' },
    { id: 'ai-assistant', icon: MessageSquare, label: 'Neural Link', shortcut: '5' }, // "Personal" naming
    { id: 'admin', icon: ShieldCheck, label: 'System', shortcut: '6' },
];

export const Sidebar = () => {
    const { activeTab, setActiveTab, toggleTheme } = useAppStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const sidebarRef = useRef(null);

    // Keyboard shortcuts
    MENU_ITEMS.forEach((item) => {
        useHotkey(item.shortcut, () => setActiveTab(item.id), [setActiveTab]);
    });

    // Spotlight & Mouse Tracking (Performance Optimized via CSS Vars)
    useEffect(() => {
        const sidebar = sidebarRef.current;
        if (!sidebar) return;

        const handleMouseMove = (e) => {
            const rect = sidebar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            sidebar.style.setProperty('--mouse-x', `${x}px`);
            sidebar.style.setProperty('--mouse-y', `${y}px`);
        };

        sidebar.addEventListener('mousemove', handleMouseMove);
        return () => sidebar.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <motion.aside
            ref={sidebarRef}
            initial={false}
            animate={{ width: isExpanded ? 280 : 88 }}
            transition={{ type: "spring", stiffness: 350, damping: 35, mass: 0.8 }} // Snappier, more "physical" feel
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="fixed top-4 left-4 h-[calc(100vh-2rem)] z-50 flex flex-col rounded-[24px] group/sidebar"
            style={{
                // "Porcelain" material
                background: 'linear-gradient(180deg, rgba(20,20,22,0.85) 0%, rgba(10,10,12,0.95) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
            }}
        >
            {/* Ambient Noise Texture (Subtle Human Imperfection) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] rounded-[24px] z-[-1]" />

            {/* Spotlight Layer (Interactive) */}
            <div
                className="absolute inset-0 rounded-[24px] z-[-1] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.04), transparent 40%)`
                }}
            />

            {/* Header: Personal Identity Card */}
            <div className="h-28 flex items-center px-6 mb-2 relative">
                <div className="flex items-center gap-4 w-full">
                    {/* Unique "Fingerprint" / Avatar */}
                    <div className="relative group/avatar cursor-pointer shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                            <Monitor size={18} strokeWidth={1.5} className="text-zinc-400 group-hover/avatar:text-white transition-colors" />
                        </div>
                        {/* Online Status Dot */}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#09090b]" />
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                                transition={{ duration: 0.25 }}
                                className="flex-1 overflow-hidden"
                            >
                                <h2 className="text-sm font-semibold text-white tracking-tight lead-none">Aspirant's Space</h2>
                                <p className="text-[11px] text-zinc-500 font-medium tracking-wide mt-0.5 group-hover/sidebar:text-zinc-400 transition-colors">
                                    Productive Flow
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide relative z-10 pb-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "relative w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group/item outline-none",
                                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                            )}
                        >
                            {/* Active Background - Subtle "Glass Inset" */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent border-l-2 border-indigo-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 flex items-center justify-center">
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2 : 1.5} // Thinner stroke = Premium feel
                                    className={cn(
                                        "shrink-0 transition-all duration-300",
                                        isActive
                                            ? "text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                                            : "group-hover/item:text-white group-hover/item:scale-105"
                                    )}
                                />
                            </div>

                            {/* Label */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className={cn(
                                            "text-[13px] font-medium whitespace-nowrap flex-1 text-left transition-colors duration-300",
                                            isActive ? "text-white" : "text-zinc-500 group-hover/item:text-zinc-300"
                                        )}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Keyboard Shortcut Hint (Shows on Hover) */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                                        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                                            <span className="text-xs">⌘</span>{item.shortcut}
                                        </kbd>
                                    </div>
                                )}
                            </AnimatePresence>

                        </button>
                    );
                })}
            </nav>

            {/* Footer / System Status */}
            <div className="p-5 mt-auto relative z-10">
                <div className="relative p-1 rounded-2xl overflow-hidden bg-white/5 border border-white/5 group/footer hover:bg-white/10 transition-colors duration-300">
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            "w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-300",
                            !isExpanded && "justify-center"
                        )}
                    >
                        <Sun size={18} strokeWidth={1.5} className="text-zinc-400 group-hover/footer:text-yellow-200 transition-colors" />
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex-1 flex justify-between items-center overflow-hidden whitespace-nowrap"
                                >
                                    <span className="text-xs font-medium text-zinc-400">Theme</span>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Settings - only show if expanded or extra space needed */}
                    {isExpanded && (
                        <button className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white transition-all text-left">
                            <Settings size={18} strokeWidth={1.5} />
                            <span className="text-xs font-medium">Preferences</span>
                        </button>
                    )}
                </div>
            </div>

        </motion.aside>
    );
};
export default Sidebar;
