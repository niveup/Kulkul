import React, { useState, useEffect, useMemo } from 'react';
import {
    Video, Search, Play, Clock,
    FileText, ExternalLink, Filter,
    ChevronRight, Home, FolderOpen,
    Atom, Zap, Calculator, BookOpen,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="min-h-screen bg-[#02040c] flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-t-2 border-fuchsia-500 animate-spin" />
                <div className="absolute inset-0 w-24 h-24 rounded-full border-r-2 border-cyan-500 animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-4 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 blur-xl animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase">Initializing Quantum Library</h2>
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
        <div className="min-h-screen bg-[#02040c] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sync Error</h2>
            <p className="text-slate-400 max-w-sm mb-8">Unable to establish connection with the Intelligence Library. Please verify your neural uplink.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-semibold transition-all"
            >
                Re-establish Link
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#02040c] text-slate-200 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 pt-4 px-4 h-24 pointer-events-none">
                <div className="max-w-7xl mx-auto h-16 pointer-events-auto bg-[#0a0f1d]/60 backdrop-blur-2xl border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-black/50">
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

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
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
                                        className={`cursor-pointer transition-colors ${!selectedChapter ? SUBJECT_CONFIG[selectedSubject]?.color : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {selectedSubject}
                                    </span>
                                </>
                            )}
                            {selectedChapter && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-slate-700" />
                                    <span className="text-white truncate max-w-[200px] font-medium opacity-80">{selectedChapter}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Command Search */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/40 to-cyan-500/40 rounded-xl blur-lg opacity-100 transition-opacity" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-4 h-4 text-white" />
                            <input
                                type="text"
                                placeholder="Command Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 md:w-80 bg-white/5 border border-white/10 rounded-xl pl-11 pr-14 py-2.5 text-sm font-medium focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-slate-600 text-white"
                            />
                            <div className="absolute right-3 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-slate-500 font-mono pointer-events-none group-focus-within:hidden">
                                ⌘K
                            </div>
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
                                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <div className="w-1.5 h-6 rounded-full bg-fuchsia-500" />
                                    Quantum Discovery
                                    <span className="text-sm font-medium text-slate-500 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 uppercase tracking-widest ml-4">
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
                                                whileHover={{ y: -4, scale: 1.02 }}
                                                onClick={() => { setSelectedSubject(item.subject); setSelectedChapter(item.name); setSearchQuery(''); }}
                                                className="relative group cursor-pointer"
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
                                                <div className="relative p-5 bg-[#0a0f1d]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${config.color} group-hover:scale-110 transition-transform`}>
                                                            <FolderOpen className="w-5 h-5" />
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color} opacity-80`}>
                                                            {item.subject}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Chapter Sector</span>
                                                        <div className={`p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors`}>
                                                            <ChevronRight className="w-3 h-3 text-white/60" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    } else {
                                        return (
                                            <motion.div key={`search-vid-${idx}`} variants={itemVariants}>
                                                <VideoCard video={item.video} subject={item.subject} />
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
                                    <h3 className="text-xl font-bold text-white mb-2">No Quantum Clusters Found</h3>
                                    <p className="text-white/60 max-w-xs">Your coordinates didn't match any known sectors in the intelligence library.</p>
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
                                        whileHover={{ y: -12, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSubjectClick(subject)}
                                        className="group relative h-80 rounded-[2rem] bg-[#0a0f1d] border border-white/5 overflow-hidden cursor-pointer transition-all duration-500"
                                    >
                                        {/* Dynamic Background Glow */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl`} />

                                        {/* Glass Surface */}
                                        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm group-hover:backdrop-blur-none transition-all duration-500" />

                                        {/* Border Gradient */}
                                        <div className={`absolute inset-0 rounded-[2rem] border border-white/5 group-hover:border-${config.accent}-500/50 transition-colors duration-500`} />

                                        {/* Content Wrapper */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-between relative z-10">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md ${config.color} group-hover:scale-110 transition-transform duration-500 ${config.glow}`}>
                                                    <SubjectIcon className="w-8 h-8" />
                                                </div>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    whileHover={{ opacity: 1 }}
                                                    className="p-2 rounded-full bg-white/5 border border-white/10"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-white" />
                                                </motion.div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="space-y-4">
                                                <h3 className="text-4xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                                                    {subject}
                                                </h3>

                                                <div className="flex items-center gap-3">
                                                    <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${config.gradient}`} />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white/90 tracking-wider">
                                                            {data[subject]?.chapters?.length || 0}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
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
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleChapterClick(chapter)}
                                        className="group relative overflow-hidden rounded-2xl bg-[#0f1629] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                                    >
                                        {/* Hover Gradient Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${subjectConfig.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                                        <div className="relative p-6 flex items-start gap-4">
                                            <div className={`mt-1 p-3 rounded-xl bg-[1C1C1E] border border-white/5 ${subjectConfig.color} shadow-lg shrink-0`}>
                                                <FolderOpen className="w-6 h-6" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                                                    {chapter}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5`}>
                                                        <Play className={`w-3 h-3 ${subjectConfig.color} fill-current`} />
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                                            {data[selectedSubject].videos[chapter]?.length || 0} Modules
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="self-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <ChevronRight className="w-5 h-5 text-white/50" />
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
                                    <VideoCard video={video} subject={selectedSubject} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}

// Standalone Video Card Component - "Crystalline Interface"
function VideoCard({ video, subject }) {
    const isPDF = !video.isVideo;
    const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG['General'];

    const openInTelegram = () => {
        const urlParts = video.telegramUrl.split('/');
        const id = urlParts.pop();
        const channel = urlParts.pop();
        const tgUrl = `tg://resolve?domain=${channel}&post=${id}`;
        window.location.href = tgUrl;
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative bg-[#0f1629] rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 cursor-pointer"
            onClick={openInTelegram}
        >
            {/* Cinematic Glow on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`} />

            {/* Border Reveal */}
            <div className={`absolute inset-0 rounded-3xl border border-white/5 group-hover:border-${config.accent}-500/30 transition-colors duration-500`} />

            {/* Thumbnail Area */}
            <div className="relative aspect-video bg-[#050912] overflow-hidden">
                {/* Dynamic Energy Mesh */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-700`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150" />

                {/* Central Focus Orb */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${config.color} blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse`} />

                {/* Main Icon */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className={`relative w-20 h-20 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 ${config.glow}`}
                    >
                        {isPDF ? (
                            <FileText className="w-9 h-9 text-white/90" />
                        ) : (
                            <Play className="w-9 h-9 text-white/90 fill-white/90 ml-1" />
                        )}
                    </motion.div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <div className={`px-3 py-1.5 rounded-xl bg-[#000000]/60 backdrop-blur-md border border-white/10 flex items-center gap-2`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.gradient} animate-pulse`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                            {isPDF ? 'DOC' : 'MP4'}
                        </span>
                    </div>
                </div>

                {/* Time Badge */}
                {!isPDF && video.duration && (
                    <div className="absolute bottom-4 right-4 z-20">
                        <div className="px-3 py-1.5 rounded-xl bg-[#000000]/60 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-white/90 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {video.duration}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="relative p-6 bg-[#0f1629]/90 backdrop-blur-xl">
                {/* Title */}
                <h4 className="text-lg font-bold text-white leading-snug line-clamp-2 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                    {video.caption.replace(/\[.*?\]/g, '').trim() || 'Untitled Module'}
                </h4>

                {/* Metadata & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Size</span>
                        <span className="text-xs font-bold text-slate-300">{video.fileSize || 'OPTIMIZED'}</span>
                    </div>

                    <button className="relative overflow-hidden group/btn px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all">
                        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover/btn:opacity-20 transition-opacity`} />
                        <div className="relative flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-white">Access</span>
                            <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                        </div>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
