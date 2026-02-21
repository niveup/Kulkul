import React, { useState, useEffect, useMemo } from 'react';
import {
    Video, Search, Play, Clock,
    FileText, ExternalLink, Filter,
    ChevronRight, Home, FolderOpen,
    Atom, Zap, Calculator, BookOpen,
    AlertCircle, Pencil, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoStatusStore, DEFAULT_VIDEO_STATUS } from './store';

// Premium Subject Configuration - "Neural Glass" Edition
const SUBJECT_CONFIG = {
    'Chemistry': {
        id: 'chem',
        color: 'text-fuchsia-400',
        accent: 'fuchsia',
        gradient: 'from-fuchsia-500 via-purple-500 to-fuchsia-600',
        glass: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20',
        Icon: Atom,
        glow: 'shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)]'
    },
    'Physics': {
        id: 'phy',
        color: 'text-cyan-400',
        accent: 'cyan',
        gradient: 'from-cyan-500 via-blue-500 to-cyan-600',
        glass: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        Icon: Zap,
        glow: 'shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]'
    },
    'Mathematics': {
        id: 'math',
        color: 'text-emerald-400',
        accent: 'emerald',
        gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
        glass: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        Icon: Calculator,
        glow: 'shadow-[0_0_30px_-5px_rgba(52,211,153,0.3)]'
    },
    'General': {
        id: 'gen',
        color: 'text-amber-400',
        accent: 'amber',
        gradient: 'from-amber-500 via-orange-500 to-amber-600',
        glass: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        Icon: BookOpen,
        glow: 'shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]'
    }
};

// Orchestration Variants - Fixed to be always visible
const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', damping: 25, stiffness: 300 }
    }
};

export default function VideoApp() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [globalTitles, setGlobalTitles] = useState({});

    // Load Global Titles
    const loadGlobalTitles = async () => {
        try {
            const res = await fetch('/api/video-titles');
            if (res.ok) {
                const titles = await res.json();
                setGlobalTitles(titles);
            }
        } catch (err) {
            console.error('Failed to load global titles:', err);
        }
    };

    const handleRename = async (id, newTitle) => {
        try {
            const res = await fetch('/api/video-titles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title: newTitle })
            });

            if (res.ok) {
                setGlobalTitles(prev => ({ ...prev, [id]: newTitle }));
                return true;
            }
        } catch (err) {
            console.error('Failed to save title:', err);
        }
        return false;
    };

    useEffect(() => {
        loadGlobalTitles();
    }, []);

    // Load Video Statuses
    useEffect(() => {
        const loadVideoStatuses = async () => {
            try {
                const res = await fetch('/api/video-status');
                if (res.ok) {
                    const statuses = await res.json();
                    useVideoStatusStore.getState().setVideoStatuses(statuses);
                }
            } catch (err) {
                console.error('Failed to load video statuses:', err);
            }
        };
        loadVideoStatuses();
    }, []);

    // Load Data
    useEffect(() => {
        const load = async () => {
            try {
                // Fetch shared data file
                const res = await fetch('/videos-data.json?t=' + Date.now());
                if (!res.ok) throw new Error('Failed to load video library');
                const json = await res.json();

                // Transform the data structure: JSON has {subjects: {...}, videos: [...]}
                // Component expects {SubjectName: {chapters: [], videos: {chapterName: [...]}}}}
                const transformed = {};
                const subjects = json.subjects || {};
                const allVideos = json.videos || [];

                Object.entries(subjects).forEach(([subjectName, subjectData]) => {
                    transformed[subjectName] = {
                        chapters: subjectData.chapters || [],
                        chapterCounts: subjectData.chapterCounts || {},
                        count: subjectData.count || 0,
                        videos: {}
                    };

                    // Group videos by chapter for this subject
                    (subjectData.chapters || []).forEach(chapter => {
                        transformed[subjectName].videos[chapter] = allVideos.filter(
                            v => v.subject === subjectName && v.chapter === chapter
                        ).map(v => ({
                            ...v,
                            caption: v.lesson || v.caption || 'Untitled'
                        }));
                    });
                });

                setData(transformed);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Filter Logic
    const filteredContent = useMemo(() => {
        if (!data) return null;

        if (searchQuery) {
            // Global Search Mode
            let results = [];
            Object.entries(data).forEach(([subject, subjectData]) => {
                // Search in chapters
                subjectData.chapters.forEach(chapter => {
                    if (chapter.toLowerCase().includes(searchQuery.toLowerCase())) {
                        results.push({ type: 'chapter', name: chapter, subject });
                    }
                });

                // Search in videos
                Object.entries(subjectData.videos || {}).forEach(([chapterName, videos]) => {
                    videos.forEach(video => {
                        if (video.caption?.toLowerCase().includes(searchQuery.toLowerCase())) {
                            results.push({ type: 'video', video, subject, chapter: chapterName });
                        }
                    });
                });
            });
            return { type: 'search', results };
        }

        if (selectedChapter) {
            // Video List Mode
            const videos = data[selectedSubject]?.videos[selectedChapter] || [];
            return { type: 'videos', items: videos };
        }

        if (selectedSubject) {
            // Chapter List Mode
            const chapters = data[selectedSubject]?.chapters || [];
            return { type: 'chapters', items: chapters };
        }

        // Subject List Mode
        return { type: 'subjects', items: Object.keys(data) };

    }, [data, selectedSubject, selectedChapter, searchQuery]);

    // Handlers
    const handleSubjectClick = (sub) => {
        setSelectedSubject(sub);
        setSelectedChapter(null);
        setSearchQuery('');
    };

    const handleChapterClick = (chap) => {
        setSelectedChapter(chap);
        setSearchQuery('');
    };

    const handleBack = () => {
        if (selectedChapter) {
            setSelectedChapter(null);
        } else if (selectedSubject) {
            setSelectedSubject(null);
        }
    };

    // Render Helpers
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-t-2 border-fuchsia-500 animate-spin" />
                <div className="absolute inset-0 w-24 h-24 rounded-full border-r-2 border-cyan-500 animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-4 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 blur-xl animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase font-syne">Initializing Quantum Library</h2>
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-syne tracking-tight">Sync Error</h2>
            <p className="text-slate-400 max-w-sm mb-8 font-inter opacity-80">Unable to establish connection with the Intelligence Library. Please verify your neural uplink.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-semibold transition-all"
            >
                Re-establish Link
            </button>
        </div>
    );

    return (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 pt-4 px-4 h-24 pointer-events-none">
                <div className="max-w-7xl mx-auto h-16 pointer-events-auto bg-black/20 backdrop-blur-2xl border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        {(selectedSubject || selectedChapter) && (
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={handleBack}
                                className="p-2 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-white/10 active:scale-95"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180 text-white" />
                            </motion.button>
                        )}

                        {/* Premium Logo */}
                        <div
                            onClick={() => { setSelectedSubject(null); setSelectedChapter(null); setSearchQuery(''); }}
                            className="group/avatar relative cursor-pointer"
                        >
                            <div className="logo-liquid-metal scale-75 -ml-2">
                                <div className="logo-outline" />
                                <div className="relative z-10 flex items-center justify-center">
                                    <Video className="w-5 h-5 text-white/80 group-hover/avatar:text-white transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight font-inter">
                            <span
                                onClick={() => { setSelectedSubject(null); setSelectedChapter(null); setSearchQuery(''); }}
                                className={`cursor-pointer transition-colors ${!selectedSubject ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Intelligence Library
                            </span>
                            {selectedSubject && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-slate-700" />
                                    <span
                                        onClick={() => setSelectedChapter(null)}
                                        className={`cursor-pointer transition-colors font-inter tracking-tight font-semibold ${!selectedChapter ? SUBJECT_CONFIG[selectedSubject]?.color : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {selectedSubject}
                                    </span>
                                </>
                            )}
                            {selectedChapter && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-slate-700" />
                                    <span className="text-white truncate max-w-[200px] font-inter font-bold tracking-tight opacity-90">{selectedChapter}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Command Search */}
                    <div className="relative group">
                        {/* Intelligent Ambient Glow - Ultra Subtle */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />

                        <div className="relative flex items-center bg-white/[0.04] backdrop-blur-3xl border border-white/5 rounded-xl transition-all duration-500 group-focus-within:border-white/20 group-focus-within:bg-white/[0.08] group-focus-within:w-96 w-72">
                            <Search className="absolute left-4 w-4 h-4 text-white/20 group-focus-within:text-cyan-400/80 transition-colors duration-500" />
                            <input
                                type="text"
                                placeholder="Search Intel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent pl-11 pr-5 py-2.5 text-sm font-medium focus:outline-none placeholder:text-white/20 text-white selection:bg-cyan-500/30 font-inter"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">

                    {/* SEARCH RESULTS */}
                    {filteredContent.type === 'search' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden" animate="visible"
                            className="space-y-12 pb-20"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h2 className="text-2xl font-bold text-white tracking-tighter flex items-center gap-3 font-syne">
                                    <div className="w-1.5 h-6 rounded-full bg-fuchsia-500" />
                                    Quantum Discovery
                                    <span className="text-sm font-medium text-slate-500 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 uppercase tracking-widest ml-4 font-mono">
                                        {filteredContent.results.length} Matches
                                    </span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredContent.results.map((item, idx) => {
                                    if (item.type === 'chapter') {
                                        const config = SUBJECT_CONFIG[item.subject];
                                        return (
                                            <motion.div
                                                key={`search-ch-${idx}`}
                                                variants={itemVariants}
                                                onClick={() => { setSelectedSubject(item.subject); setSelectedChapter(item.name); setSearchQuery(''); }}
                                                className="relative group cursor-pointer"
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 blur-xl transition-all duration-500`} />
                                                <div className="relative p-5 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${config.color} transition-transform`}>
                                                            <FolderOpen className="w-5 h-5" />
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color} opacity-80`}>
                                                            {item.subject}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white leading-tight mb-2 transition-all font-inter tracking-tight">
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Chapter Sector</span>
                                                        <div className={`p-1.5 rounded-full bg-white/5 transition-colors`}>
                                                            <ChevronRight className="w-3 h-3 text-white/40" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    } else {
                                        return (
                                            <motion.div key={`search-vid-${idx}`} variants={itemVariants}>
                                                <VideoCard
                                                    video={item.video}
                                                    subject={item.subject}
                                                    customTitle={globalTitles[item.video.id]}
                                                    onRename={handleRename}
                                                />
                                            </motion.div>
                                        );
                                    }
                                })}
                            </div>

                            {filteredContent.results.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-32 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                                        <Search className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-syne tracking-tight">No Quantum Clusters Found</h3>
                                    <p className="text-white/60 max-w-xs font-inter opacity-80">Your coordinates didn't match any known sectors in the intelligence library.</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* SUBJECTS GRID */}
                    {filteredContent.type === 'subjects' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden" animate="visible" exit="hidden"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {filteredContent.items.map(subject => {
                                const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG['General'];
                                const SubjectIcon = config.Icon;

                                return (
                                    <motion.div
                                        key={subject}
                                        variants={itemVariants}
                                        onClick={() => handleSubjectClick(subject)}
                                        className="group relative h-80 rounded-[2rem] bg-black/20 border border-white/5 overflow-hidden cursor-pointer"
                                    >
                                        {/* Dynamic Background Glow - Static */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10 transition-opacity duration-700 blur-2xl`} />

                                        {/* Glass Surface */}
                                        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm transition-all duration-500" />

                                        {/* Border Gradient - Static */}
                                        <div className={`absolute inset-0 rounded-[2rem] border border-white/10 transition-colors duration-500`} />

                                        {/* Content Wrapper */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-between relative z-10">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md ${config.color} transition-transform duration-500 ${config.glow}`}>
                                                    <SubjectIcon className="w-8 h-8" />
                                                </div>
                                                <div className="p-2 rounded-full bg-white/5 border border-white/10 opacity-40">
                                                    <ChevronRight className="w-5 h-5 text-white" />
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="space-y-4">
                                                <h3 className="text-4xl font-extrabold text-white tracking-tighter transition-all font-syne">
                                                    {subject}
                                                </h3>

                                                <div className="flex items-center gap-3">
                                                    <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${config.gradient}`} />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white/90 tracking-wider font-mono">
                                                            {data[subject]?.chapters?.length || 0}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest font-inter">
                                                            Portals Active
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* CHAPTERS MATRIX */}
                    {filteredContent.type === 'chapters' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden" animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredContent.items.map((chapter, idx) => {
                                const subjectConfig = SUBJECT_CONFIG[selectedSubject];
                                return (
                                    <motion.div
                                        key={chapter}
                                        variants={itemVariants}
                                        onClick={() => handleChapterClick(chapter)}
                                        className="relative overflow-hidden rounded-2xl bg-black/20 backdrop-blur-lg border border-white/5 transition-all cursor-pointer"
                                    >
                                        {/* Background Gradient - Static */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${subjectConfig.gradient} opacity-5 transition-opacity duration-500`} />

                                        <div className="relative p-6 flex items-start gap-4">
                                            <div className={`mt-1 p-3 rounded-xl bg-black/40 border border-white/10 ${subjectConfig.color} shadow-lg shrink-0`}>
                                                <FolderOpen className="w-6 h-6" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-bold text-white mb-2 leading-snug transition-all font-inter tracking-tight">
                                                    {chapter}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5`}>
                                                        <Play className={`w-3 h-3 ${subjectConfig.color} fill-current`} />
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                                                            {data[selectedSubject].videos[chapter]?.length || 0} Modules
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="self-center opacity-30 transition-all duration-300">
                                                <ChevronRight className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* VIDEOS GRID */}
                    {filteredContent.type === 'videos' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden" animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            {filteredContent.items.map(video => (
                                <motion.div key={video.id} variants={itemVariants}>
                                    <VideoCard
                                        video={video}
                                        subject={selectedSubject}
                                        customTitle={globalTitles[video.id]}
                                        onRename={handleRename}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}

// --- Cinematic Components ---

const StatusFlipButton = ({ active, onToggle, frontLabel, backLabel, activeGlow, ariaLabel }) => {
    return (
        <div
            role="button"
            aria-pressed={active}
            aria-label={ariaLabel || (active ? backLabel : frontLabel)}
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onToggle(); } }}
            className={`relative h-10 w-28 cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-black/20 backdrop-blur-md group shadow-lg transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${active ? 'border-white/20' : 'hover:border-white/10'}`}
        >
            {/* Front Face (Inactive) */}
            <motion.div
                initial={false}
                animate={{
                    y: active ? '100%' : '0%',
                    rotateX: active ? 60 : 0,
                    opacity: active ? 0 : 1
                }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 flex items-center justify-center bg-[#1d1d20] text-[9px] font-bold uppercase tracking-[0.1em] text-[#71717a] font-inter"
            >
                {frontLabel}
            </motion.div>

            {/* Back Face (Active) */}
            <motion.div
                initial={false}
                animate={{
                    y: active ? '0%' : '-100%',
                    rotateX: active ? 0 : -60,
                    opacity: active ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={`absolute inset-0 flex flex-col items-center justify-center ${activeGlow} text-[10px] font-bold uppercase tracking-[0.05em] text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] font-inter`}
            >
                <div className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{backLabel}</div>
                {/* Glass Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
            </motion.div>
        </div>
    );
};

const VideoCard = ({ video, subject, chapter, searchQuery, onRename }) => {
    const videoStatus = useVideoStatusStore(state => state.videoStatuses[video.id] || DEFAULT_VIDEO_STATUS);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(video.caption || '');
    const [customTitle, setCustomTitle] = useState(null);

    useEffect(() => {
        const fetchTitle = async () => {
            try {
                const res = await fetch('/api/video-titles');
                if (res.ok) {
                    const titles = await res.json();
                    if (titles[video.id]) setCustomTitle(titles[video.id]);
                }
            } catch (err) { console.error('Failed to fetch video title:', err); }
        };
        fetchTitle();
    }, [video.id]);

    const handleMarkStatus = (type) => {
        const field = type === 'done' ? 'isDone' : 'hasConcept';
        const newValue = !videoStatus[field];

        // Instant Optimistic Update for Lag-Free UI
        useVideoStatusStore.getState().updateVideoStatus(video.id, { [field]: newValue });

        // Silent Background Cloud Sync for Cross-Device Consistency
        fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoId: video.id,
                type: type,
                value: newValue
            })
        }).catch(err => {
            console.error('[Sync] Failed to persist status update:', err);
        });
    };

    const config = (subject && SUBJECT_CONFIG[subject]) || {
        gradient: 'from-cyan-500 to-blue-500',
        accent: 'cyan',
        color: 'text-cyan-400',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]'
    };
    const isPDF = video.type === 'pdf' || video.file?.toLowerCase().endsWith('.pdf') || video.caption?.toLowerCase().includes('.pdf');

    const openInTelegram = () => {
        if (isPDF) {
            window.open(video.file || video.url, '_blank');
        } else {
            const channelUsername = 'kulkuljujum';
            const msgId = video.id;
            // Use tg:// protocol to open directly in Telegram Desktop
            window.location.href = `tg://resolve?domain=${channelUsername}&post=${msgId}`;
        }
    };

    const startEditing = (e) => {
        e.stopPropagation();
        setEditValue(customTitle || video.caption.replace(/\[.*?\]/g, '').trim());
        setIsEditing(true);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        if (!editValue.trim()) return;

        try {
            const res = await fetch('/api/video-titles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: video.id, title: editValue.trim() })
            });

            if (res.ok) {
                setCustomTitle(editValue.trim());
                setIsEditing(false);
                if (onRename) onRename(video.id, editValue.trim());
            }
        } catch (err) {
            console.error('Failed to save title:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-black/20 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer hover:border-white/20"
            onClick={openInTelegram}
        >
            {/* Ambient Accent Light */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />



            {/* Thumbnail Area */}
            <div className="relative aspect-video bg-black/40 overflow-hidden">
                {/* Dynamic Noise Mesh */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-[0.12]`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150" />

                {/* Main Action Hub */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div
                        className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 ${config.glow} transition-all duration-300`}
                    >
                        {isPDF ? (
                            <FileText size={32} className="text-white/90" />
                        ) : (
                            <Play size={32} className="text-white/90 fill-white/90 ml-1" />
                        )}
                    </div>
                </div>


                {/* Rename Tool */}
                {!isEditing && (
                    <button
                        onClick={startEditing}
                        className="absolute bottom-4 right-4 z-30 p-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/5 rounded-xl text-white/30 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Pencil size={12} strokeWidth={3} />
                    </button>
                )}

                {/* High-Contrast Badges */}
                <div className="absolute top-5 left-5 flex gap-2 z-20">
                    <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.gradient} animate-pulse`} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/90 font-inter">
                            {isPDF ? 'PDF' : 'MKV'}
                        </span>
                    </div>
                </div>

                {!isPDF && video.duration && (
                    <div className="absolute top-5 right-5 z-20">
                        <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 text-[10px] font-bold text-white/40 tracking-widest leading-none font-mono">
                            {video.duration}
                        </div>
                    </div>
                )}
            </div>

            {/* Information Layer */}
            <div className="p-8 pb-7">
                {isEditing ? (
                    <div className="flex flex-col gap-3 mb-6" onClick={e => e.stopPropagation()}>
                        <input
                            type="text"
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleSave(e);
                                if (e.key === 'Escape') handleCancel(e);
                            }}
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/40 focus:bg-white/[0.07] transition-all"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={handleCancel} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400">
                                <X size={14} />
                            </button>
                            <button onClick={handleSave} className={`p-1.5 rounded-lg text-white ${subject ? `bg-gradient-to-r ${config.gradient}` : 'bg-cyan-500'}`}>
                                <Check size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <h4 className="text-xl font-bold text-white leading-[1.3] line-clamp-2 mb-6 tracking-tight font-inter">
                        {customTitle || video.caption.replace(/\[.*?\]/g, '').trim() || 'Untitled Session'}
                    </h4>
                )}

                {/* Surgical Control Panel */}
                <div className="flex items-center gap-2.5 pt-6 border-t border-white/5">
                    <StatusFlipButton
                        active={videoStatus.isDone}
                        onToggle={() => handleMarkStatus('done')}
                        frontLabel="NOT DONE"
                        backLabel="DONE"
                        activeGlow="bg-gradient-to-r from-emerald-400 to-cyan-400"
                        ariaLabel="Toggle done status"
                    />
                    <StatusFlipButton
                        active={videoStatus.hasConcept}
                        onToggle={() => handleMarkStatus('new_concept')}
                        frontLabel="NO CONCEPT"
                        backLabel="CONCEPT"
                        activeGlow="bg-gradient-to-r from-amber-400 to-orange-400"
                        ariaLabel="Toggle concept status"
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); openInTelegram(); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all shrink-0"
                    >
                        <ExternalLink size={14} className="text-white/70" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
