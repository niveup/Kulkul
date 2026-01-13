import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Bell, Command, ChevronRight, Check, Hash, ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { StatsGroup } from './StatsGroup';
import { QuickAccess } from './QuickAccess';

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

// Motivational quotes
const QUOTES = [
    "Push yourself, because no one else is going to do it for you.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret of getting ahead is getting started."
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
    if (!target) return 0;
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();

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

export const LuminaOverview = ({
    sessions = [],
    tasks = [],
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

    // Calculate stats from real data
    const todaysSessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime).toDateString();
        return sessionDate === new Date().toDateString();
    });

    const focusTimeMinutes = todaysSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;

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
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050510]">
                {/* Top Left: Purple Ambiance */}
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-500/15 rounded-full blur-[120px] mix-blend-screen" />

                {/* Bottom Right: Blue Depth */}
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-500/15 rounded-full blur-[120px] mix-blend-screen" />

                {/* Top Center: Ambient Light Source (The "Light" user asked for) */}
                <div className="absolute top-[-30%] left-[20%] right-[20%] h-[50vw] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
            </div>

            <div className="relative z-10 pb-32"> {/* Structure handled by App layout */}

                {/* Header - Sticky & Adaptive */}
                <header
                    className={`
                        sticky top-0 z-40 mb-8 py-4 px-4 -mx-4
                        flex justify-between items-center
                        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                        ${isScrolled
                            ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
                            : 'bg-transparent border-transparent'
                        }
                    `}
                >
                    {/* Animated Background Curtain for smooth entry */}
                    {isScrolled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-50 pointer-events-none" />
                    )}

                    <div className={`transition-all duration-500 ${isScrolled ? 'translate-x-1' : ''}`}>
                        <p className={`
                            text-white/50 text-xs mb-0.5 font-semibold tracking-wider uppercase pl-1 transition-all duration-500
                            ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}
                        `}>
                            {getFormattedDate()}
                        </p>
                        <h1 className={`
                            font-bold text-white tracking-tight drop-shadow-lg transition-all duration-500
                            ${isScrolled ? 'text-xl' : 'text-3xl'}
                        `}>
                            {getGreeting()}, <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{userName}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        {/* Premium Global Search Bar */}
                        <div
                            ref={searchRef}
                            className={`
                                relative group z-50 transition-all duration-500
                                ${isScrolled ? 'w-64' : 'w-80'}
                            `}
                        >
                            <div className={`
                                relative overflow-hidden rounded-2xl transition-all duration-300
                                ${searchFocused
                                    ? 'bg-black/80 shadow-[0_0_40px_-5px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/30'
                                    : isScrolled
                                        ? 'bg-white/10 ring-1 ring-white/10 hover:bg-white/15'
                                        : 'bg-white/5 hover:bg-white/10 ring-1 ring-white/5 hover:ring-white/10'
                                }
                            `}>
                                {/* Input Container */}
                                <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search size={18} className={`transition-colors duration-300 ${searchFocused ? 'text-blue-400' : 'text-white/40'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        placeholder={isScrolled ? "Search..." : "Search apps, tasks, sections..."}
                                        className="
                                            pl-12 pr-12 py-3.5 w-full bg-transparent border-none
                                            text-sm text-white placeholder-white/30 
                                            focus:outline-none focus:ring-0
                                        "
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 h-6 border border-white/10 rounded-lg text-[10px] font-bold text-white/30 bg-white/5">
                                            <Command size={10} /> K
                                        </kbd>
                                    </div>
                                </div>
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
                        <button className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-95 relative group">
                            <Bell size={20} className="text-white/70 group-hover:text-white transition-colors" />
                            <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Quote Section - Clean, borderless design */}
                <div className="mb-10">
                    <div className="p-10 relative overflow-hidden min-h-[140px] flex items-center">
                        {/* Subtle background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-blue-500/5 rounded-3xl" />

                        <div className="relative z-10 max-w-3xl">
                            <p className="text-2xl md:text-3xl bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent font-medium leading-relaxed tracking-tight">
                                "{quote}"
                            </p>
                            <p className="mt-4 text-sm text-white/40 font-medium tracking-wide">— Daily Wisdom</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Row */}
                <StatsGroup
                    focusTime={focusTimeMinutes}
                    completedTasks={completedTasks}
                    totalTasks={totalTasks}
                    streak={streak}
                    sessions={sessions}
                />

                {/* Main Content Grid: Hero */}
                <div className="mb-8">
                    {/* Large Gradient Card - No external image for performance */}
                    <GlassCard className="p-0 h-[350px] relative overflow-hidden" hoverEffect={false}>
                        {/* Pure CSS gradient background instead of external image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-10 w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-xs font-semibold text-blue-200">
                                    Today's Focus
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
                                    onClick={onStartSession}
                                    className="px-8 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2 group/btn"
                                >
                                    Start Session
                                    <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                </button>
                                <button
                                    onClick={onViewPlan}
                                    className="px-8 py-3.5 bg-white/5 backdrop-blur-xl text-white font-semibold rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 active:scale-95"
                                >
                                    View Plan
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Quick Access Grid */}
                <QuickAccess apps={apps} onAddApp={onAddApp} onEditApp={onEditApp} onDeleteApp={onDeleteApp} />

            </div>
        </div>
    );
};

export default LuminaOverview;
