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
    UserCircle2,
    Cloud,
    FileText,
    Video,
    GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';
import { useHotkey } from '../hooks';
import { useAuth } from '../contexts/AuthContext';

// =============================================================================
// Designer Configuration
// =============================================================================
// Navigation Items Configuration
// Navigation Items Configuration
const MENU_ITEMS = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview', shortcut: '1' },
    { id: 'study-tools', icon: BookOpen, label: 'Workstation', shortcut: '2' },
    { id: 'progress', icon: TrendingUp, label: 'Analytics', shortcut: '3' },
    { id: 'videos', icon: Video, label: 'Videos', shortcut: '4' },
    { id: 'concept', icon: BookOpen, label: 'Notes', shortcut: '5' },
    { id: 'ai-assistant', icon: MessageSquare, label: 'Neural Link', shortcut: '7' },
    { id: 'vault', icon: Cloud, label: 'Vault', shortcut: '8' },
    { id: 'notion', icon: FileText, label: 'Notion', shortcut: '9' },
    { id: 'admin', icon: ShieldCheck, label: 'System', shortcut: '0' },
];

export const Sidebar = () => {
    const { activeTab, setActiveTab, toggleTheme } = useAppStore();
    const { isAuthenticated, isLoading } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const sidebarRef = useRef(null);

    // Keyboard shortcuts
    useHotkey('1', () => setActiveTab('overview'), [setActiveTab]);
    useHotkey('2', () => setActiveTab('study-tools'), [setActiveTab]);
    useHotkey('3', () => setActiveTab('progress'), [setActiveTab]);
    useHotkey('4', () => setActiveTab('videos'), [setActiveTab]);
    useHotkey('5', () => setActiveTab('concept'), [setActiveTab]);
    useHotkey('7', () => setActiveTab('ai-assistant'), [setActiveTab]);
    useHotkey('8', () => setActiveTab('vault'), [setActiveTab]);
    useHotkey('9', () => setActiveTab('notion'), [setActiveTab]);
    useHotkey('0', () => setActiveTab('admin'), [setActiveTab]);

    // Mouse Tracking for Spotlight
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
        <motion.div
            className="fixed inset-y-0 left-0 z-[100] flex items-center"
            animate={{ width: isExpanded ? 300 : 100 }} // Larger trigger area that grows with the sidebar
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <motion.aside
                ref={sidebarRef}
                initial={false}
                animate={{ width: isExpanded ? 260 : 80 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                    mass: 1
                }}
                className="ml-4 h-[calc(100vh-2rem)] flex flex-col rounded-[24px] group/sidebar relative overflow-visible"
            >
                {/* =================================================================
                   OBSIDIAN GLASS MATERIAL LAYER
                   ================================================================= */}
                <div className="absolute inset-0 rounded-[24px] overflow-hidden">
                    {/* 1. Base Blur Layer */}
                    <div className="absolute inset-0 bg-[#050508]/80 backdrop-blur-2xl" />

                    {/* 2. Noise Texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    {/* 3. Gradient Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                    {/* 4. Glass Border (Inner) */}
                    <div className="absolute inset-0 rounded-[24px] border border-white/5 pointer-events-none" />

                    {/* 5. Spotlight Effect (Mouse driven) */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{
                            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.08), transparent 40%)`
                        }}
                    />
                </div>

                {/* =================================================================
                   CONTENT LAYER
                   ================================================================= */}
                <div className="relative z-10 flex flex-col h-full">

                    {/* Header: Identity */}
                    <div className="h-24 flex items-center px-5 mb-2 relative">
                        {/* Removed overflow-hidden to prevent clipping of the metallic glow */}
                        <div className="flex items-center gap-4 w-full overflow-visible">
                            {/* Logo with User-Requested Liquid Metal Effect */}
                            <div className="relative group/avatar cursor-pointer shrink-0 p-1">
                                <div className="logo-liquid-metal">
                                    <div className="logo-outline" />
                                    <div className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden z-10 transition-transform group-hover/avatar:scale-105">
                                        <img src="/logo.png" alt="StudyHub" className="w-7 h-7 object-contain" />
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#050508] shadow-[0_0_8px_rgba(245,158,11,0.5)] z-20" />
                            </div>

                            {/* Name Info */}
                            <motion.div
                                animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col min-w-0"
                            >
                                <span className="text-sm font-bold text-white tracking-tight">Aspirant's Space</span>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Pro Plan</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
                        {MENU_ITEMS.filter(item => {
                            if (isLoading) return false;
                            if (!isAuthenticated) return item.id === 'videos';
                            return true;
                        }).map((item) => {
                            const isActive = activeTab === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "relative w-full flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 outline-none group/item",
                                        isActive ? "text-white" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {/* Active State Background */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabBg"
                                            className="absolute inset-0 rounded-xl bg-white/5 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    {/* Hover State (Subtle) */}
                                    {!isActive && (
                                        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover/item:bg-white/[0.02] transition-colors duration-200" />
                                    )}

                                    {/* Icon */}
                                    <div className="relative z-10 flex items-center justify-center">
                                        <Icon
                                            size={20}
                                            strokeWidth={1.5}
                                            className={cn(
                                                "shrink-0 transition-transform duration-300",
                                                isActive ? "text-indigo-400 scale-100" : "group-hover/item:scale-110"
                                            )}
                                        />
                                    </div>

                                    {/* Label */}
                                    <motion.span
                                        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                                        className="text-[13px] font-medium whitespace-nowrap z-10"
                                    >
                                        {item.label}
                                    </motion.span>

                                    {/* Shortcut Hint */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity"
                                        >
                                            <span className="text-[10px] font-mono text-white/20 border border-white/10 rounded px-1 py-0.5">
                                                {item.shortcut}
                                            </span>
                                        </motion.div>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-3 mt-auto">
                        <button
                            onClick={toggleTheme}
                            className={cn(
                                "w-full flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 group/footer hover:bg-white/5 border border-transparent hover:border-white/5",
                                !isExpanded && "justify-center"
                            )}
                        >
                            <Sun size={20} strokeWidth={1.5} className="text-white/40 group-hover/footer:text-amber-300 transition-colors" />

                            <motion.div
                                animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0 }}
                                className="flex-1 flex justify-between items-center overflow-hidden whitespace-nowrap"
                            >
                                <span className="text-[13px] font-medium text-white/60">Appearance</span>
                            </motion.div>
                        </button>

                        {/* Spacer for bottom aesthetic */}
                        <div className="h-2" />
                    </div>
                </div>
            </motion.aside>
        </motion.div>
    );
};
export default Sidebar;
