import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, Filter, BookOpen, Calculator, BrainCircuit, AlertCircle, Lightbulb, Link as LinkIcon, Calendar, Star, Trash2, Edit3, CheckCircle2, ExternalLink, Layers, Grid2x2, ChevronDown, ChevronUp, ArrowLeft, Plus, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { useNotesStore, useNoteActions } from '../../store/notesStore';
import { cn, ensureAbsoluteUrl, getFaviconUrl } from '../../lib/utils';
import NoteViewModal from './NoteViewModal';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import FloatingAddButton from './FloatingAddButton';
import NoteEntryModal from './NoteEntryModal';

const TYPE_CONFIG = {
    concept: { icon: BookOpen, color: 'emerald', label: 'Concept' },
    formula: { icon: Calculator, color: 'blue', label: 'Formula' },
    trick: { icon: BrainCircuit, color: 'amber', label: 'Trick' },
    mistake: { icon: AlertCircle, color: 'red', label: 'Mistake' },
    doubt: { icon: Lightbulb, color: 'purple', label: 'Doubt' },
    resource: { icon: LinkIcon, color: 'cyan', label: 'Resource' },
};

const NotesLibrary = ({ isDarkMode }) => {
    const { notes, isLoading, error, isModalOpen, editingNote } = useNotesStore();
    const { fetchNotes, deleteNote, markAsRevised, setViewContext, toggleModal } = useNoteActions();

    const storeChapters = useNotesStore(s => s.chapters);
    const addCustomChapter = useNotesStore(s => s.addCustomChapter);
    const deleteCustomChapter = useNotesStore(s => s.deleteCustomChapter);
    const recordChapterAccess = useNotesStore(s => s.recordChapterAccess);
    const chapterAccessTimes = useNotesStore(s => s.chapterAccessTimes);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedNoteForView, setSelectedNoteForView] = useState(null);
    const [viewMode, setViewMode] = useState('all'); // 'grouped' | 'all'
    const [activeSubjectTab, setActiveSubjectTab] = useState('Physics');
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [isAddingChapter, setIsAddingChapter] = useState(false);
    const [newChapterName, setNewChapterName] = useState('');
    const [itemToDelete, setItemToDelete] = useState(null); // { type: 'note'|'chapter', id, name, subject }

    useEffect(() => {
        fetchNotes();
    }, []);

    // Sync filter with store context for smart capture
    useEffect(() => {
        setViewContext(activeFilter);
    }, [activeFilter, setViewContext]);

    const filteredNotes = useMemo(() => {
        let result = notes || [];

        if (activeFilter !== 'all') {
            result = result.filter(n => n.type === activeFilter);
        }

        if (searchTerm) {
            const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
            result = result.filter(n => {
                const searchableText = `${n.title || ''} ${n.description || ''} ${n.topic || ''} ${n.chapterName || ''} ${n.subject || ''}`.toLowerCase();
                // Check if all words from search query exist somewhere in the note
                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        return result;
    }, [notes, activeFilter, searchTerm]);

    const groupedNotes = useMemo(() => {
        if (viewMode === 'all') return { all: filteredNotes };

        const groups = {
            'Physics': {},
            'Chemistry': {},
            'Mathematics': {},
            'Other': {}
        };

        filteredNotes.forEach(note => {
            let subjectStr = note.subject || '';
            const lowerSub = subjectStr.toLowerCase();
            let subject = 'Other';

            if (lowerSub.includes('physic')) subject = 'Physics';
            else if (lowerSub.includes('chem')) subject = 'Chemistry';
            else if (lowerSub.includes('math')) subject = 'Mathematics';

            const chapter = note.topic || 'Uncategorized Chapter';

            if (!groups[subject][chapter]) groups[subject][chapter] = [];
            groups[subject][chapter].push(note);
        });

        return groups;
    }, [filteredNotes, viewMode]);

    const displayChapters = useMemo(() => {
        const predefined = storeChapters[activeSubjectTab] || [];
        const notesObj = groupedNotes[activeSubjectTab] || {};
        const fromNotes = Object.keys(notesObj);

        let allChapters = Array.from(new Set([...predefined, ...fromNotes]));

        if (searchTerm) {
            const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
            allChapters = allChapters.filter(chapter => {
                const chapterSearchText = chapter.toLowerCase();
                const nameMatches = searchTerms.every(term => chapterSearchText.includes(term));
                const hasMatchingNotes = notesObj[chapter] && notesObj[chapter].length > 0;
                return nameMatches || hasMatchingNotes;
            });
        }

        return allChapters.sort((a, b) => {
            const countA = notesObj[a] ? notesObj[a].length : 0;
            const countB = notesObj[b] ? notesObj[b].length : 0;

            // 1. Sort by number of notes (descending)
            if (countB !== countA) {
                return countB - countA;
            }

            // 2. Tie-breaker: Last accessed time (descending)
            const accessA = chapterAccessTimes[a] || 0;
            const accessB = chapterAccessTimes[b] || 0;
            if (accessB !== accessA) {
                return accessB - accessA;
            }

            // 3. Tie-breaker 2: Latest note (descending)
            if (countA > 0 && countB > 0) {
                const getLatestTimestamp = (chapterNotes) => {
                    return Math.max(...chapterNotes.map(n =>
                        new Date(n.updated_at || n.created_at).getTime()
                    ));
                };

                const latestA = getLatestTimestamp(notesObj[a]);
                const latestB = getLatestTimestamp(notesObj[b]);

                if (latestB !== latestA) {
                    return latestB - latestA;
                }
            }

            // 3. Fallback: Alphabetical
            return a.localeCompare(b);
        });
    }, [storeChapters, activeSubjectTab, groupedNotes, chapterAccessTimes, searchTerm]);

    const handleAddChapter = (e) => {
        e.preventDefault();
        if (newChapterName.trim()) {
            addCustomChapter(activeSubjectTab, newChapterName.trim());
            setNewChapterName('');
            setIsAddingChapter(false);
        }
    };

    const handleSmartCapture = () => {
        // Pre-configure the modal based on current view
        let initialContext = null;

        if (viewMode === 'grouped' && activeSubjectTab) {
            initialContext = {
                id: undefined, // ensure it creates a NEW note, not updates an existing one
                subject: activeSubjectTab,
                chapterName: selectedChapter || '' // Ensure this maps to the modal's chapterName field
            };
        } else if (viewMode === 'all') {
            initialContext = {
                id: undefined,
                subject: '',
                topic: ''
            };
        }

        toggleModal(true, initialContext);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            {!selectedChapter && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className={cn("text-4xl font-black tracking-tight mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                            Personal <span className="text-emerald-500">Learnings</span>
                        </h1>
                        <p className={cn("text-lg", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                            Your private knowledge bank for JEE excellence.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className={cn(
                            "flex p-1 rounded-2xl border-2 transition-all",
                            isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-200"
                        )}>
                            <button
                                onClick={() => setViewMode('grouped')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm transition-all",
                                    viewMode === 'grouped'
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                )}
                                title="Group by Subject & Chapter"
                            >
                                <Layers size={16} />
                                <span className="hidden sm:inline">Topics</span>
                            </button>
                            <button
                                onClick={() => setViewMode('all')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm transition-all",
                                    viewMode === 'all'
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                )}
                                title="View All Notes"
                            >
                                <Grid2x2 size={16} />
                                <span className="hidden sm:inline">All</span>
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search your notes..."
                                className={cn(
                                    "pl-11 pr-4 py-3 rounded-2xl border-2 outline-none transition-all w-48 sm:w-64 md:w-80",
                                    isDarkMode
                                        ? "bg-slate-900/50 border-slate-800 focus:border-emerald-500 text-white"
                                        : "bg-white border-slate-100 focus:border-emerald-500 text-slate-900"
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : (filteredNotes.length > 0 || viewMode === 'grouped') ? (
                <div className="space-y-12">
                    {viewMode === 'all' ? (
                        filteredNotes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {filteredNotes.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            isDarkMode={isDarkMode}
                                            onDeleteRequest={() => setItemToDelete({ type: 'note', id: note.id, name: note.title })}
                                            onMarkRevised={() => markAsRevised(note.id)}
                                            onOpenView={() => setSelectedNoteForView(note)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className={cn(
                                "text-center py-20 rounded-3xl border-2 border-dashed",
                                isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-100 border-slate-300"
                            )}>
                                <p className={cn("text-xl font-medium", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                                    No notes match your search.
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                            {/* Subject Tabs */}
                            {!selectedChapter && (
                                <div className={cn(
                                    "flex flex-wrap gap-2 p-2 rounded-[2rem] border-2 w-full",
                                    isDarkMode ? "bg-slate-900/40 border-slate-800/50" : "bg-slate-50 border-slate-200"
                                )}>
                                    {['Physics', 'Chemistry', 'Mathematics', 'Other'].map(sub => {
                                        const count = Object.values(groupedNotes[sub] || {}).flat().length;
                                        if (count === 0 && sub === 'Other') return null; // Hide 'Other' if empty

                                        const isActive = activeSubjectTab === sub;

                                        return (
                                            <button
                                                key={sub}
                                                onClick={() => { setActiveSubjectTab(sub); setSelectedChapter(null); setIsAddingChapter(false); }}
                                                className={cn(
                                                    "flex-1 min-w-[120px] px-6 py-4 rounded-3xl font-bold transition-all flex items-center justify-center gap-3",
                                                    isActive
                                                        ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-[1.02]"
                                                        : isDarkMode
                                                            ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                                            : "text-slate-500 hover:text-slate-900 hover:bg-white"
                                                )}
                                            >
                                                {sub}
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-black w-8 h-5 flex items-center justify-center",
                                                    isActive
                                                        ? "bg-white/20 text-white"
                                                        : isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-200 text-slate-500"
                                                )}>
                                                    {count}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Chapters inside Active Subject Tab */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSubjectTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8 w-full"
                                >
                                    {selectedChapter ? (
                                        // Notes for Selected Chapter View
                                        <div className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-500">
                                            <button
                                                onClick={() => setSelectedChapter(null)}
                                                className={cn(
                                                    "flex items-center gap-2 font-bold px-4 py-2 rounded-xl border-2 transition-all w-fit",
                                                    isDarkMode ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50" : "bg-white border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
                                                )}
                                            >
                                                <ArrowLeft size={16} /> Back to Chapters
                                            </button>

                                            <div className={cn(
                                                "space-y-6 p-6 sm:p-8 rounded-[2rem] border-2",
                                                isDarkMode ? "bg-slate-900/30 border-slate-800/40" : "bg-slate-50 border-slate-200"
                                            )}>
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                                        <h3 className={cn("text-2xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                                                            {selectedChapter}
                                                        </h3>
                                                    </div>
                                                    <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest", isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600")}>
                                                        {(groupedNotes[activeSubjectTab]?.[selectedChapter] || []).length} Notes
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                    <AnimatePresence>
                                                        {(groupedNotes[activeSubjectTab]?.[selectedChapter] || []).map((note) => (
                                                            <NoteCard
                                                                key={note.id}
                                                                note={note}
                                                                isDarkMode={isDarkMode}
                                                                onDeleteRequest={() => setItemToDelete({ type: 'note', id: note.id, name: note.title })}
                                                                onMarkRevised={() => markAsRevised(note.id)}
                                                                onOpenView={() => setSelectedNoteForView(note)}
                                                            />
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Chapter Grid View
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full animate-in fade-in slide-in-from-left-4 duration-500">
                                            {displayChapters.map(chapter => {
                                                const count = (groupedNotes[activeSubjectTab]?.[chapter] || []).length;
                                                return (
                                                    <motion.div
                                                        key={chapter}
                                                        whileHover={{ y: -4, scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => {
                                                            setSelectedChapter(chapter);
                                                            recordChapterAccess(chapter);
                                                        }}
                                                        className={cn(
                                                            "group p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[160px] relative overflow-hidden",
                                                            isDarkMode
                                                                ? "bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 shadow-xl shadow-slate-950/20"
                                                                : "bg-white border-slate-100 hover:border-emerald-400/50 shadow-xl shadow-slate-200/50"
                                                        )}
                                                    >
                                                        <h3 className={cn("text-xl font-bold leading-tight mb-4 relative z-10", isDarkMode ? "text-slate-200 group-hover:text-emerald-50" : "text-slate-800 group-hover:text-emerald-900")}>
                                                            {chapter}
                                                        </h3>
                                                        <div className="flex items-center justify-between mt-auto relative z-10 space-x-2">
                                                            <div className={cn(
                                                                "px-3 py-1 rounded-full text-xs font-bold shrink-0",
                                                                count > 0
                                                                    ? (isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600")
                                                                    : (isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")
                                                            )}>
                                                                {count} {count === 1 ? 'Note' : 'Notes'}
                                                            </div>

                                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'chapter', id: chapter, name: chapter, subject: activeSubjectTab }); }}
                                                                    className={cn("p-1.5 rounded-lg transition-colors hover:bg-red-500/20 text-red-500/50 hover:text-red-500")}
                                                                    title="Delete Custom Chapter"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {count > 0 && (
                                                            <div className="absolute -bottom-4 -right-4 text-9xl font-black opacity-5 text-emerald-500 pointer-events-none select-none z-0 tracking-tighter mix-blend-overlay">
                                                                {count}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )
                                            })}

                                            {/* Add Chapter Card */}
                                            {isAddingChapter ? (
                                                <motion.form
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    onSubmit={handleAddChapter}
                                                    className={cn(
                                                        "p-6 rounded-3xl border-2 flex flex-col justify-center min-h-[160px] gap-4",
                                                        isDarkMode ? "bg-slate-800/80 border-emerald-500/50" : "bg-emerald-50 border-emerald-300"
                                                    )}
                                                >
                                                    <input
                                                        autoFocus
                                                        value={newChapterName}
                                                        onChange={(e) => setNewChapterName(e.target.value)}
                                                        placeholder="Chapter Name..."
                                                        className={cn(
                                                            "w-full px-4 py-2 rounded-xl outline-none font-medium",
                                                            isDarkMode ? "bg-slate-900 text-white placeholder:text-slate-500" : "bg-white text-slate-900 placeholder:text-slate-400"
                                                        )}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">Add</button>
                                                        <button type="button" onClick={() => setIsAddingChapter(false)} className={cn("flex-1 py-2 rounded-xl font-bold text-sm transition-colors", isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300")}>Cancel</button>
                                                    </div>
                                                </motion.form>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ y: -4, scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setIsAddingChapter(true)}
                                                    className={cn(
                                                        "p-6 rounded-3xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] gap-3",
                                                        isDarkMode
                                                            ? "bg-slate-900/20 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/40 text-slate-500 hover:text-emerald-400"
                                                            : "bg-slate-50/50 border-slate-300 hover:border-emerald-400/50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                                                    )}
                                                >
                                                    <div className="p-4 rounded-full bg-current/10">
                                                        <Plus size={28} />
                                                    </div>
                                                    <span className="font-bold text-sm tracking-wide">Add Custom Chapter</span>
                                                </motion.button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            ) : error ? (
                <div className={cn(
                    "text-center py-20 rounded-3xl border-2 border-dashed",
                    isDarkMode
                        ? "bg-red-900/20 border-red-500/30"
                        : "bg-red-50 border-red-200"
                )}>
                    <p className={cn("text-xl font-medium mb-2", isDarkMode ? "text-red-400" : "text-red-600")}>
                        Failed to load notes
                    </p>
                    <p className={cn("text-sm", isDarkMode ? "text-red-300/70" : "text-red-500")}>
                        {error}
                    </p>
                </div>
            ) : (
                <div className={cn(
                    "text-center py-20 rounded-3xl border-2 border-dashed",
                    isDarkMode
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-slate-100 border-slate-300"
                )}>
                    <p className={cn("text-xl font-medium", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                        {searchTerm ? "No notes match your search." : "Your knowledge bank is empty. Start capturing!"}
                    </p>
                </div>
            )
            }

            {/* Note View Modal */}
            <NoteViewModal
                isOpen={!!selectedNoteForView}
                note={selectedNoteForView ? (notes.find(n => n.id === selectedNoteForView.id) || selectedNoteForView) : null}
                onClose={() => setSelectedNoteForView(null)}
                isDarkMode={isDarkMode}
            />

            {/* Note Entry Modal */}
            <NoteEntryModal
                isDarkMode={isDarkMode}
            />

            {/* Deletion Confirmation Modal */}
            {/* Deletion Confirmation - Stark, Typography-First Design (No Generic "Modal Box") */}
            {/* Deletion Confirmation - Ultra-Compact, Creative, Premium Design */}
            <AnimatePresence>
                {itemToDelete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        {/* Sublime subtle backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, backdropFilter: 'blur(5px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-slate-900/40"
                            onClick={() => setItemToDelete(null)}
                        />

                        {/* Compact Modal Surface */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                            className={cn(
                                "relative w-full max-w-[320px] rounded-[1.5rem] p-6 shadow-2xl flex flex-col items-center text-center",
                                isDarkMode ? "bg-[#111111] border border-white/10" : "bg-white border border-slate-200"
                            )}
                        >
                            {/* Premium Compact Animated SVG */}
                            <div className="w-16 h-16 mb-4 relative flex items-center justify-center">
                                <CompactAnimatedTrashIcon />
                            </div>

                            <h3 className={cn("text-lg font-bold mb-1.5 tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                                Delete {itemToDelete.type === 'note' ? 'Note' : 'Chapter'}?
                            </h3>

                            <p className={cn("text-[13px] leading-snug mb-6 px-2", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                This action will permanently remove <span className={cn("font-medium", isDarkMode ? "text-slate-200" : "text-slate-800")}>"{itemToDelete.name}"</span>.
                            </p>

                            <div className="flex w-full gap-2">
                                <button
                                    onClick={() => setItemToDelete(null)}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-[0.8rem] font-medium text-[13px] transition-all duration-300",
                                        isDarkMode
                                            ? "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                    )}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (itemToDelete.type === 'note') deleteNote(itemToDelete.id);
                                        else if (itemToDelete.type === 'chapter') deleteCustomChapter(itemToDelete.subject, itemToDelete.id);
                                        setItemToDelete(null);
                                    }}
                                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-[0.8rem] font-bold text-[13px] transition-all shadow-md shadow-red-500/20 active:scale-95"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Add Button */}
            {!isModalOpen && !selectedNoteForView && (
                <FloatingAddButton isDarkMode={isDarkMode} onClick={handleSmartCapture} />
            )}
        </div >
    );
};

const FilterButton = ({ active, onClick, label, icon: Icon, color = 'slate', isDarkMode }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
            "relative flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border-2",
            active
                ? "text-white border-transparent"
                : isDarkMode
                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-900"
        )}
    >
        {active && (
            <motion.div
                layoutId="active-pill"
                className={cn(
                    "absolute inset-0 rounded-full z-0",
                    isDarkMode ? "bg-white/10" : "bg-slate-200"
                )}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            {Icon && (
                <Icon
                    size={16}
                    className={cn(
                        "transition-colors duration-300",
                        active ? `text - ${color} -400` : "text-slate-500"
                    )}
                />
            )}
            {label}
        </span>
    </motion.button>
);

const NoteCard = ({ note, isDarkMode, onDeleteRequest, onMarkRevised, onOpenView }) => {
    const { toggleModal } = useNoteActions();
    const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.concept;
    const Icon = config.icon;

    const handleCardClick = () => {
        // Opens the streamlined view modal (Main Body Only)
        onOpenView();
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleCardClick}
            className={cn(
                "group relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col h-full cursor-pointer",
                isDarkMode
                    ? "bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 hover:bg-slate-800/80 shadow-2xl shadow-slate-950/20"
                    : "bg-white border-slate-100 hover:border-emerald-300/40 hover:bg-white shadow-xl shadow-slate-200/50"
            )}
        >
            {/* Top Row: Subject & Topic Pills */}
            <div className="flex items-start justify-between gap-3 mb-4">
                {/* Left: Subject / "PHYSICS" Box */}
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider shrink-0",
                    `bg - ${config.color} -500 / 10 text - ${config.color} -500`
                )}>
                    <Icon size={12} />
                    {note.subject || 'Uncategorized'}
                </div>

                {/* Right: Topic / Chapter Name - Small and 1-liner */}
                {note.topic && (
                    <div
                        className={cn(
                            "text-[11px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg max-w-[50%] truncate shrink text-right border",
                            isDarkMode ? "bg-slate-800/50 text-slate-400 border-slate-700/50" : "bg-slate-100 text-slate-500 border-slate-200"
                        )}
                        title={note.topic}
                    >
                        {note.topic}
                    </div>
                )}
            </div>

            {/* Hover Actions */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 p-1.5 rounded-xl backdrop-blur-md border shadow-2xl bg-black/50 border-white/10">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleModal(true, note); }}
                    className={cn("p-2 rounded-lg transition-colors aspect-square flex items-center justify-center", isDarkMode ? "hover:bg-slate-700 text-blue-400" : "hover:bg-slate-100 text-blue-600")}
                    title="Edit Note"
                >
                    <Edit3 size={15} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMarkRevised(); }}
                    className={cn("p-2 rounded-lg transition-colors aspect-square flex items-center justify-center", isDarkMode ? "hover:bg-slate-700 text-emerald-400" : "hover:bg-slate-100 text-emerald-600")}
                    title="Mark as Revised"
                >
                    {note.is_revised ? <CheckCircle2 size={15} /> : <Star size={15} />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDeleteRequest(); }}
                    className={cn("p-2 rounded-lg transition-colors aspect-square flex items-center justify-center", isDarkMode ? "hover:bg-slate-700 text-red-400" : "hover:bg-slate-100 text-red-600")}
                    title="Delete Note"
                >
                    <Trash2 size={15} />
                </button>
            </div>

            {/* Content Area (Notes block) */}
            <div className="flex-grow flex flex-col pt-2 relative">

                <div className={cn(
                    "text-[17px] sm:text-[19px] font-medium leading-tight line-clamp-[7] mb-4 flex-1 tracking-tight break-words break-all whitespace-pre-wrap",
                    isDarkMode ? "text-slate-200 group-hover:text-blue-400 transition-colors" : "text-slate-800 group-hover:text-blue-600 transition-colors"
                )}>
                    <MarkdownRenderer content={note.description} className="prose-lg font-medium leading-snug" />
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-3 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {note.source && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(ensureAbsoluteUrl(note.source), '_blank', 'noopener,noreferrer');
                            }}
                            className={cn("flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-500/10 transition-colors", isDarkMode ? "text-slate-400" : "text-slate-500")}
                            title={note.source}
                        >
                            <img
                                src={getFaviconUrl(note.source)}
                                alt="logo"
                                className="w-4 h-4 rounded-sm shadow-sm opacity-80"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                            />
                            <div className="hidden">
                                <ExternalLink size={14} />
                            </div>
                            <span className="text-[11px] font-bold tracking-wide">LINK</span>
                        </button>
                    )}
                    {note.links && note.links.length > 0 && (
                        <div className={cn("flex items-center gap-1 text-[11px] font-bold tracking-wide px-2 py-1 rounded bg-slate-500/5", isDarkMode ? "text-slate-400" : "text-slate-500")} title={`${note.links.length} Link(s)`}>
                            <LinkIcon size={12} />
                            {note.links.length}
                        </div>
                    )}
                    {note.images && note.images.length > 0 && (
                        <div className={cn("flex items-center gap-1 text-[11px] font-bold tracking-wide px-2 py-1 rounded bg-slate-500/5", isDarkMode ? "text-slate-400" : "text-slate-500")} title={`${note.images.length} Image(s)`}>
                            <ImageIcon size={12} />
                            {note.images.length}
                        </div>
                    )}
                    {(!note.source && (!note.images || note.images.length === 0)) && (
                        <div className={cn("flex items-center gap-1.5 text-[11px] font-medium opacity-40", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                            <Calendar size={10} />
                            {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    )}
                </div>
                {note.is_revised && (
                    <div className="flex items-center gap-1 text-emerald-500/80 font-bold">
                        <CheckCircle2 size={12} />
                        Revised ×{note.revision_count || 1}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// World-Class Compact Animated SVG
const CompactAnimatedTrashIcon = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Elegant glowing background circle */}
            <motion.div
                className="absolute inset-0 bg-red-500/10 rounded-full"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-red-500 relative z-10"
                // The entire bin does a very subtle "breathing" bob
                animate={{ y: [0, -1.5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* The Lid - dynamically pops open and shuts */}
                <motion.path
                    d="M3 6h18"
                    style={{ transformOrigin: "80% 6px" }}
                    animate={{ rotate: [0, -15, 0], y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "anticipate", repeatDelay: 1 }}
                />

                {/* The Handle on the Lid */}
                <motion.path
                    d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                    style={{ transformOrigin: "80% 6px" }}
                    animate={{ rotate: [0, -15, 0], y: [0, -2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "anticipate", repeatDelay: 1 }}
                />

                {/* The main bin body */}
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />

                {/* Internal dashed lines representing data being shredded inside the bin */}
                <motion.line
                    x1="10" y1="11" x2="10" y2="17"
                    animate={{ y: [0, 2, 0], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.line
                    x1="14" y1="11" x2="14" y2="17"
                    animate={{ y: [2, 0, 2], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </motion.svg>

            {/* Tiny "data particles" being sucked into the bin */}
            <motion.div
                className="absolute top-0 right-2 w-1 h-1 bg-red-400 rounded-full"
                animate={{ y: [-10, 5], x: [5, -5], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeIn", repeatDelay: 1 }}
            />
            <motion.div
                className="absolute top-2 left-1 w-1 h-1 bg-red-500 rounded-full"
                animate={{ y: [-5, 8], x: [-5, 4], opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeIn", delay: 0.3, repeatDelay: 1.3 }}
            />
        </div>
    );
};

export default NotesLibrary;
