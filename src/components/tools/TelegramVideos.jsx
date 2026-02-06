// Telegram Video Gallery Component - Organized by Subject → Topic → Videos
// Loads real data from videos-data.json

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Folder, FolderOpen,
    Search, ChevronRight, ExternalLink,
    Play, Clock, ArrowLeft, Home, Loader2,
    Beaker, Atom, Calculator, BookOpen, FileText
} from 'lucide-react';

// Subject icons and colors
const SUBJECT_CONFIG = {
    'Chemistry': {
        icon: Beaker,
        bg: 'from-emerald-500/20 to-emerald-600/10',
        border: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
        gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    'Physics': {
        icon: Atom,
        bg: 'from-blue-500/20 to-blue-600/10',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    'Mathematics': {
        icon: Calculator,
        bg: 'from-purple-500/20 to-purple-600/10',
        border: 'border-purple-500/30',
        iconColor: 'text-purple-400',
        gradient: 'bg-gradient-to-br from-purple-500 to-pink-600'
    },
    'General': {
        icon: BookOpen,
        bg: 'from-gray-500/20 to-gray-600/10',
        border: 'border-gray-500/30',
        iconColor: 'text-gray-400',
        gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
};

// Subject Card Component
const SubjectCard = ({ subject, data, onClick }) => {
    const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG['General'];
    const Icon = config.icon;
    const chapterCount = data.chapters ? Object.keys(data.chapters).length : 0;

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full p-6 rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} text-left transition-all hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden group`}
        >
            {/* Background glow */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${config.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />

            <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${config.iconColor}`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{subject}</h3>
                        <p className="text-sm text-gray-400">
                            {chapterCount} chapter{chapterCount !== 1 ? 's' : ''} • {data.count} video{data.count !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
        </motion.button>
    );
};

// Chapter Card Component
const ChapterCard = ({ chapter, videos, subject, onClick }) => {
    const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG['General'];

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4 }}
            className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 text-left transition-all flex items-center gap-4 group"
        >
            <div className={`p-2 rounded-lg bg-white/5 ${config.iconColor}`}>
                <FolderOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{chapter}</h4>
                <p className="text-sm text-gray-500">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </motion.button>
    );
};

// Video/PDF Card Component
const VideoCard = ({ video, subject }) => {
    const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG['General'];
    const isPDF = !video.isVideo;

    const openInTelegram = () => {
        // Convert https://t.me/channel/id to tg://resolve?domain=channel&post=id
        // This opens the desktop app directly, bypassing the "Media too big" web preview
        const urlParts = video.telegramUrl.split('/');
        const id = urlParts.pop();
        const channel = urlParts.pop();
        const tgUrl = `tg://resolve?domain=${channel}&post=${id}`;

        // Try to open app
        window.location.href = tgUrl;
    };

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return '';
        const mb = bytes / (1024 * 1024);
        if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
        return `${mb.toFixed(0)} MB`;
    };

    // Get display title - prefer lesson, fallback to topic
    const displayTitle = video.lesson || video.chapter || video.topic || `Video #${video.id}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-cyan-500/30 transition-all"
        >
            {/* Video/PDF Thumbnail */}
            <div
                className="relative aspect-video bg-gray-900 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={openInTelegram}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-30`} />
                {isPDF ? (
                    <FileText className={`w-12 h-12 ${config.iconColor} opacity-50`} />
                ) : (
                    <Video className={`w-12 h-12 ${config.iconColor} opacity-50`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Play Button Overlay - Only for videos */}
                {!isPDF && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={`w-14 h-14 rounded-full ${config.gradient} flex items-center justify-center shadow-lg`}>
                            <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                    </div>
                )}

                {/* Duration Badge - Only for videos */}
                {!isPDF && video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                    </div>
                )}

                {/* PDF Badge - Only for PDFs */}
                {isPDF && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-red-500/80 rounded text-xs text-white font-medium">
                        PDF
                    </div>
                )}

                {/* Size Badge */}
                {video.fileSize && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 rounded text-xs text-gray-300">
                        {formatSize(video.fileSize)}
                    </div>
                )}
            </div>

            {/* Video Info */}
            <div className="p-4">
                <h5 className="text-white font-medium text-sm mb-2 line-clamp-2" title={displayTitle}>
                    {displayTitle}
                </h5>
                <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full bg-white/5 ${config.iconColor} truncate max-w-[60%]`} title={video.chapter}>
                        {video.chapter}
                    </span>
                    <button
                        onClick={openInTelegram}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        title="Open in Telegram"
                    >
                        <ExternalLink className="w-4 h-4 text-gray-500 hover:text-cyan-400" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Breadcrumb Component
const Breadcrumb = ({ path, onNavigate }) => {
    return (
        <div className="flex items-center gap-2 text-sm mb-6 overflow-x-auto pb-2">
            <button
                onClick={() => onNavigate([])}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors shrink-0"
            >
                <Home className="w-4 h-4" />
                <span>Videos</span>
            </button>

            {path.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                    <button
                        onClick={() => onNavigate(path.slice(0, index + 1))}
                        className={`${index === path.length - 1 ? 'text-white font-medium' : 'text-gray-400 hover:text-white'} transition-colors truncate max-w-[200px]`}
                        title={item}
                    >
                        {item}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};

// Main Component
const TelegramVideos = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [path, setPath] = useState([]); // Navigation: [] = subjects, [subject] = topics, [subject, topic] = videos

    const CHANNEL_USERNAME = 'kulkuljujum';

    // Load data from JSON
    useEffect(() => {
        const loadData = async () => {
            try {
                // Add timestamp to prevent caching
                const response = await fetch('/videos-data.json?t=' + Date.now());
                if (!response.ok) {
                    throw new Error('Failed to load video library');
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                console.error('Error loading video data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Organize videos by subject -> chapter
    const organizedData = useMemo(() => {
        if (!data?.videos) return {};

        const organized = {};

        data.videos.forEach(video => {
            const subject = video.subject || 'General';
            const chapter = video.chapter || 'Other';

            if (!organized[subject]) {
                organized[subject] = { chapters: {}, count: 0 };
            }

            if (!organized[subject].chapters[chapter]) {
                organized[subject].chapters[chapter] = [];
            }

            organized[subject].chapters[chapter].push(video);
            organized[subject].count++;
        });

        return organized;
    }, [data]);

    // Current view based on path
    const currentSubject = path[0] || null;
    const currentChapter = path[1] || null;

    // Navigate function
    const navigate = (newPath) => {
        setPath(newPath);
    };

    // Filter by search
    const filteredData = useMemo(() => {
        if (!searchTerm) return organizedData;

        const query = searchTerm.toLowerCase();
        const filtered = {};

        Object.entries(organizedData).forEach(([subject, subjectData]) => {
            const filteredChapters = {};
            let count = 0;

            Object.entries(subjectData.chapters).forEach(([chapter, videos]) => {
                const matchingVideos = videos.filter(v =>
                    subject.toLowerCase().includes(query) ||
                    chapter.toLowerCase().includes(query) ||
                    (v.lesson?.toLowerCase() || '').includes(query)
                );

                if (matchingVideos.length > 0) {
                    filteredChapters[chapter] = matchingVideos;
                    count += matchingVideos.length;
                }
            });

            if (count > 0) {
                filtered[subject] = { chapters: filteredChapters, count };
            }
        });

        return filtered;
    }, [organizedData, searchTerm]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading video library...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center text-red-400">
                    <p className="mb-2">Failed to load videos</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    {path.length > 0 && (
                        <button
                            onClick={() => navigate(path.slice(0, -1))}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Video className="w-7 h-7 text-cyan-400" />
                            Video Lectures
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {data?.totalVideos || 0} videos • Organized by Subject → Topic
                        </p>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 w-48 md:w-64"
                        />
                    </div>

                    <a
                        href={`https://t.me/${CHANNEL_USERNAME}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Open Channel</span>
                    </a>
                </div>
            </div>

            {/* Breadcrumb */}
            {path.length > 0 && (
                <Breadcrumb path={path} onNavigate={navigate} />
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                {/* Level 1: Subjects */}
                {path.length === 0 && (
                    <motion.div
                        key="subjects"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {Object.entries(filteredData).sort((a, b) => b[1].count - a[1].count).map(([subject, subjectData]) => (
                            <SubjectCard
                                key={subject}
                                subject={subject}
                                data={subjectData}
                                onClick={() => navigate([subject])}
                            />
                        ))}

                        {Object.keys(filteredData).length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                {searchTerm ? `No results for "${searchTerm}"` : 'No videos available'}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Level 2: Chapters */}
                {path.length === 1 && currentSubject && filteredData[currentSubject] && (
                    <motion.div
                        key="chapters"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                        {Object.entries(filteredData[currentSubject].chapters)
                            .sort((a, b) => a[0].localeCompare(b[0]))
                            .map(([chapter, videos]) => (
                                <ChapterCard
                                    key={chapter}
                                    chapter={chapter}
                                    videos={videos}
                                    subject={currentSubject}
                                    onClick={() => navigate([currentSubject, chapter])}
                                />
                            ))}
                    </motion.div>
                )}

                {/* Level 3: Videos */}
                {path.length === 2 && currentSubject && currentChapter &&
                    filteredData[currentSubject]?.chapters[currentChapter] && (
                        <motion.div
                            key="videos"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            {filteredData[currentSubject].chapters[currentChapter].map((video) => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    subject={currentSubject}
                                />
                            ))}
                        </motion.div>
                    )}
            </AnimatePresence>

            {/* Stats Footer */}
            {path.length === 0 && (
                <div className="mt-8 text-center text-gray-500 text-sm">
                    Last updated: {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleDateString() : 'Unknown'}
                </div>
            )}
        </div>
    );
};

export default TelegramVideos;
