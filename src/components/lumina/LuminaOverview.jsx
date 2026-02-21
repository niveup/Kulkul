import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Bell, Command, ChevronRight, Check, Hash, ExternalLink, ArrowRight, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GlassCard } from './GlassCard';
import { StatsGroup } from './StatsGroup';
import { QuickAccess } from './QuickAccess';
import { getISTDate } from '../../utils/dateUtils';
import { useSoundManager } from '../../utils/soundManager';

// Get greeting based on time
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

// Get formatted date
const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
};

// Motivational quotes - Premium, concise, and editorial
const QUOTES = [
    "Your potential is restricted only by the walls you build yourself.",
    "The disciplined mind is the ultimate competitive advantage.",
    "Excellence is not an act, but a habit that builds empires.",
    "Stay patient. The best things happen unexpectedly.",
    "Focus is the art of knowing what to ignore.",
    "Simplicity is the ultimate sophistication in work."
];

// Static Sections for Search
const SECTIONS = [
    { id: 'overview', title: 'Overview', type: 'section' },
    { id: 'study-tools', title: 'Study Tools', type: 'section' },
    { id: 'progress', title: 'Progress', type: 'section' },
    { id: 'resources', title: 'Resources', type: 'section' },
    { id: 'ai-assistant', title: 'AI Assistant', type: 'section' },
];

/**
 * Creative Fuzzy Matching Logic
 * Handles: Exact match, Acronyms (PW -> Physics Wallah), and Typos
 */
const getLevenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

const fuzzyMatch = (query, target) => {
    if (!target || !query) return 0;
    const q = (query || '').toLowerCase().trim();
    const t = (target || '').toLowerCase();

    // 1. Exact Includes (Highest Priority)
    if (t.includes(q)) return 100 - (t.length - q.length); // Favor shorter target matches

    // 2. Acronym Match (e.g. "pw" -> "Physics Wallah")
    const acronym = t.split(' ').map(w => w[0]).join('');
    if (acronym.includes(q)) return 80;

    // 3. Typo Tolerance (Levenshtein)
    // Only for queries 3 chars or longer to avoid noise
    if (q.length >= 3) {
        const distance = getLevenshteinDistance(q, t);
        const threshold = q.length > 5 ? 2 : 1; // Allow 2 errors for long words, 1 for med

        // If distance is within threshold, it's a match
        // But we must also check if it's "close enough" relative to word length
        if (distance <= threshold) {
            return 60 - distance; // Lower priority than exact
        }
    }

    return 0; // No match
};

// ============================================================================
// SORTABLE DASHBOARD SECTION WRAPPER
// ============================================================================
const SortableSection = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    // Don't render empty containers
    if (!children) return null;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/section w-full">
            {/* Drag Handle Overlay - Visible on hover, positioned to left */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover/section:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-50 text-white/30 hover:text-white/70 bg-white/5 rounded-lg border border-white/10 hidden xl:flex items-center justify-center backdrop-blur-md shadow-lg"
            >
                <GripVertical size={20} />
            </div>
            {children}
        </div>
    );
};

export const LuminaOverview = ({
    sessions = [],
    tasks = [], // Daily Objectives
    mainTodos = [], // Main Todo List
    streak = 0,
    apps = [],
    onAddApp,
    onEditApp,
    onDeleteApp,
    onStartSession,
    onViewPlan,
    userName = 'User',
    onNavigate // New prop to handle navigation requests
}) => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const searchRef = useRef(null);
    const { playHover, playClick } = useSoundManager();

    // Bento Grid Layout State
    const [layoutOrder, setLayoutOrder] = useState(() => {
        try {
            const saved = localStorage.getItem('lumina-layout-v1');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return ['motivation', 'stats', 'hero', 'quickAccess'];
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setLayoutOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);
                localStorage.setItem('lumina-layout-v1', JSON.stringify(newArray));
                return newArray;
            });
        }
    };

    // Calculate stats from real data
    const todaysSessions = sessions.filter(s => {
        const sessionDate = new Date(s.timestamp || s.startTime).toDateString();
        return sessionDate === new Date().toDateString();
    });

    const focusTimeMinutes = todaysSessions.reduce((acc, s) => {
        if (s.status === 'completed') {
            return acc + (s.minutes || s.duration || 0);
        } else if (s.status === 'failed' && s.elapsedSeconds) {
            return acc + Math.floor(s.elapsedSeconds / 60);
        }
        return acc;
    }, 0);

    // Aggregate both Daily Objectives (Filtered for Today) and Main Todo List
    const todayStr = getISTDate().toDateString();
    const filteredTasks = tasks.filter(t => new Date(t.createdAt || t.created_at).toDateString() === todayStr);
    const allTasks = [...filteredTasks, ...mainTodos];
    const completedTasks = allTasks.filter(t => t.completed).length;
    const totalTasks = allTasks.length;

    // Search Logic with Fuzzy Sorting
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];

        const results = [];

        // Helper to process and push
        const processItem = (item, type, matchType) => {
            const title = item.name || item.title || item.text || '';
            const score = fuzzyMatch(searchTerm, title);
            if (score > 0) {
                results.push({ ...item, type, matchType, title, score });
            }
        };

        // Filter Apps
        apps.forEach(app => processItem(app, 'app', 'Application'));

        // Filter Sections
        SECTIONS.forEach(sec => processItem(sec, 'section', 'Section'));

        // Filter Tasks
        tasks.filter(t => !t.completed).forEach(task => processItem(task, 'task', 'To-Do'));

        // Sort by Relevancy Score (Descending)
        return results.sort((a, b) => b.score - a.score).slice(0, 5);
    }, [searchTerm, apps, tasks]);

    // Handle Search Selection
    const handleResultClick = (result) => {
        playClick();
        if (result.type === 'app') {
            window.open(result.url, '_blank');
        } else if (result.type === 'section') {
            // Trigger navigation if handler exists, otherwise simulate hash change for now
            if (onNavigate) onNavigate(result.id);
            else console.log('Navigate to:', result.id);
        }
        setSearchTerm('');
        setSearchFocused(false);
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll detection for sticky header state (Performance Optimized)
    const [isScrolled, setIsScrolled] = useState(false);
    const sentinelRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsScrolled(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '-20px 0px 0px 0px' } // Slight offset to trigger effect *after* scrolling starts
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative">
            {/* Scroll Sentinel - Invisible pixel to detect scroll start */}
            <div ref={sentinelRef} className="absolute top-0 left-0 w-full h-px -translate-y-4 bg-transparent pointer-events-none" />

            {/* Premium Ambient Background - Optimized Performance */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-void">
                {/* Top Right: Warm Amber Glow (Desk Lamp feel) */}
                <div
                    className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.04) 0%, transparent 60%)' }}
                />

                {/* Left: Deep Cosmic Indigo */}
                <div
                    className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full pointer-events-none animate-pulse-glow"
                    style={{ background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.06) 0%, transparent 60%)' }}
                />

                {/* Top Center: Angelic White Highlight */}
                <div
                    className="absolute top-[-30%] left-[20%] right-[20%] h-[50vw] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, transparent 60%)' }}
                />

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            <div className="relative z-10 pb-32"> {/* Structure handled by App layout */}

                {/* Header - Sticky & Adaptive */}
                <header
                    className={`
                        sticky top-0 z-40 mb-8 py-4 px-4 -mx-4
                        flex justify-between items-center
                        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                        ${isScrolled
                            ? 'bg-obsidian/60 backdrop-blur-xl border-b border-white/5 shadow-2xl'
                            : 'bg-transparent border-transparent'
                        }
                    `}
                >
                    {/* Animated Background Curtain */}
                    {isScrolled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-slate-500/5 opacity-50 pointer-events-none" />
                    )}

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                        className={`transition-all duration-500 ${isScrolled ? 'translate-x-1' : ''}`}
                    >
                        <p className={`
                            text-white/40 text-[10px] mb-1 font-bold tracking-[0.2em] uppercase pl-1 transition-all duration-500
                            ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}
                        `}>
                            {getFormattedDate()}
                        </p>
                        <h1 className={`
                            font-bold text-white tracking-tight transition-all duration-700
                            ${isScrolled ? 'text-lg' : 'text-2xl md:text-3xl'}
                        `}>
                            {getGreeting()}, <span className="text-white/60">{userName}</span>
                        </h1>
                    </motion.div>

                    <div className="flex items-center gap-4 relative z-10">
                        {/* Premium Global Search Bar */}
                        <div
                            ref={searchRef}
                            className={`
                                relative group z-50 transition-all duration-500
                                ${isScrolled ? 'w-64' : 'w-80'}
                            `}
                        >
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    required
                                    className="input"
                                />
                                <label className="user-label">
                                    {isScrolled ? "Search..." : "Search apps, tasks, sections..."}
                                </label>
                            </div>

                            {/* Floating Results Dropdown - Absolute Overlay */}
                            <AnimatePresence>
                                {(searchFocused && searchTerm) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 right-0 mt-3 p-2
                                                   bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl
                                                   border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                                    >
                                        {searchResults.length > 0 ? (
                                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {searchResults.map((result, idx) => (
                                                    <button
                                                        key={`${result.type}-${result.id || idx}`}
                                                        onClick={() => handleResultClick(result)}
                                                        onMouseEnter={playHover}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group text-left"
                                                    >
                                                        {/* Icon based on type */}
                                                        <div className={`
                                                            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                                                            ${result.score >= 80 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/60'}
                                                        `}>
                                                            {result.type === 'app' && <ExternalLink size={14} />}
                                                            {result.type === 'task' && <Check size={14} />}
                                                            {result.type === 'section' && <Hash size={14} />}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-medium text-white truncate">
                                                                    {result.name || result.title}
                                                                </h4>
                                                                {/* Visual cue for fuzzy matches */}
                                                                {result.score < 80 && (
                                                                    <span className="text-[10px] text-white/30 italic">
                                                                        (Related)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-white/40 uppercase tracking-wider">
                                                                {result.matchType}
                                                            </p>
                                                        </div>

                                                        <ArrowRight size={14} className="text-white/20 group-hover:text-white opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-white/30 text-xs text-white/40">
                                                No results found for "{searchTerm}"
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notification Bell */}
                        <button
                            onClick={playClick}
                            onMouseEnter={playHover}
                            className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-95 relative group"
                        >
                            <Bell size={20} className="text-white/70 group-hover:text-white transition-colors" />
                            <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Main Sortable Bento Grid */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={layoutOrder} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-4 pb-32">
                            {layoutOrder.map((sectionId) => {
                                let content = null;
                                if (sectionId === 'motivation' && !isScrolled) {
                                    content = (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                                            className="mb-8"
                                        >
                                            <div className="relative group p-12 rounded-[2.5rem] overflow-hidden">
                                                {/* Card Background - Deep Glass with shimmer */}
                                                <div className="absolute inset-0 bg-white/[0.02] border border-white/[0.05] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-3xl rounded-[2.5rem]" />

                                                {/* Animated Shimmer Beam */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)" />

                                                {/* Content */}
                                                <div className="relative z-10">
                                                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-8">
                                                        Editorial Memo
                                                    </span>
                                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] max-w-4xl mb-6 italic">
                                                        "{quote}"
                                                    </h2>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-px w-12 bg-white/10" />
                                                        <p className="text-[10px] text-white/30 font-black tracking-[0.3em] uppercase">The Lumina Collective</p>
                                                    </div>
                                                </div>

                                                {/* Decorative Edge Glow */}
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                            </div>
                                        </motion.div>
                                    );
                                } else if (sectionId === 'stats') {
                                    content = (
                                        <div className="mb-4">
                                            <StatsGroup
                                                focusTime={focusTimeMinutes}
                                                completedTasks={completedTasks}
                                                totalTasks={totalTasks}
                                                streak={streak}
                                                sessions={sessions}
                                            />
                                        </div>
                                    );
                                } else if (sectionId === 'hero') {
                                    content = (
                                        <div className="mb-4 relative z-10 w-full">
                                            {/* Large Gradient Card - No external image for performance */}
                                            <GlassCard className="p-0 h-[350px] relative overflow-hidden" hoverEffect={false}>
                                                {/* Soft Editorial Gradient - Study Studio */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#121826] via-[#0a0d14] to-[#080a10]" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                                <div className="absolute bottom-0 left-0 p-10 w-full">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-xs font-semibold text-indigo-200">
                                                            Study Session
                                                        </span>
                                                    </div>
                                                    <h2 className="text-5xl font-bold text-white mb-3 tracking-tighter drop-shadow-xl">
                                                        Deep Work Session
                                                    </h2>
                                                    <p className="text-white/70 max-w-lg text-lg font-light leading-relaxed mb-8">
                                                        Early bird catches the worm. You have {totalTasks - completedTasks} pending tasks scheduled for today.
                                                    </p>

                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => { playClick(); onStartSession(); }}
                                                            onMouseEnter={playHover}
                                                            className="px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2 group/btn"
                                                        >
                                                            Start Session
                                                            <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                                        </button>
                                                        <button
                                                            onClick={() => { playClick(); onViewPlan(); }}
                                                            onMouseEnter={playHover}
                                                            className="px-8 py-3.5 bg-white/5 backdrop-blur-xl text-white font-semibold rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 active:scale-95"
                                                        >
                                                            View Plan
                                                        </button>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </div>
                                    );
                                } else if (sectionId === 'quickAccess') {
                                    content = (
                                        <div className="mt-4">
                                            <QuickAccess apps={apps} onAddApp={onAddApp} onEditApp={onEditApp} onDeleteApp={onDeleteApp} />
                                        </div>
                                    );
                                }

                                return <SortableSection key={sectionId} id={sectionId}>{content}</SortableSection>;
                            })}
                        </div>
                    </SortableContext>
                </DndContext>

            </div>
        </div >
    );
};

export default LuminaOverview;
