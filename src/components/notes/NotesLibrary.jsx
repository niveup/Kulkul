import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, Filter, BookOpen, Calculator, BrainCircuit, AlertCircle, Lightbulb, Link as LinkIcon, Calendar, Star, Trash2, Edit3, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNotesStore, useNoteActions } from '../../store/notesStore';
import { cn, ensureAbsoluteUrl, getFaviconUrl } from '../../lib/utils';
import NoteViewModal from './NoteViewModal';

const TYPE_CONFIG = {
    concept: { icon: BookOpen, color: 'emerald', label: 'Concept' },
    formula: { icon: Calculator, color: 'blue', label: 'Formula' },
    trick: { icon: BrainCircuit, color: 'amber', label: 'Trick' },
    mistake: { icon: AlertCircle, color: 'red', label: 'Mistake' },
    doubt: { icon: Lightbulb, color: 'purple', label: 'Doubt' },
    resource: { icon: LinkIcon, color: 'cyan', label: 'Resource' },
};

const NotesLibrary = ({ isDarkMode }) => {
    const { notes, isLoading, error } = useNotesStore();
    const { fetchNotes, deleteNote, markAsRevised, setViewContext } = useNoteActions();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedNoteForView, setSelectedNoteForView] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    // Sync filter with store context for smart capture
    useEffect(() => {
        setViewContext(activeFilter);
    }, [activeFilter, setViewContext]);

    const filteredNotes = useMemo(() => {
        let result = notes;

        if (activeFilter !== 'all') {
            result = result.filter(n => n.type === activeFilter);
        }

        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.description?.toLowerCase().includes(query) ||
                n.topic?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [notes, activeFilter, searchTerm]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
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
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search your notes..."
                            className={cn(
                                "pl-11 pr-4 py-3 rounded-2xl border-2 outline-none transition-all w-64 md:w-80",
                                isDarkMode
                                    ? "bg-slate-900/50 border-slate-800 focus:border-emerald-500 text-white"
                                    : "bg-white border-slate-100 focus:border-emerald-500 text-slate-900"
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3">
                <LayoutGroup>
                    <FilterButton
                        active={activeFilter === 'all'}
                        onClick={() => setActiveFilter('all')}
                        label="All Notes"
                        isDarkMode={isDarkMode}
                    />
                    {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                        <FilterButton
                            key={type}
                            active={activeFilter === type}
                            onClick={() => setActiveFilter(type)}
                            label={config.label}
                            icon={config.icon}
                            color={config.color}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </LayoutGroup>
            </div>

            {/* Notes Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredNotes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                isDarkMode={isDarkMode}
                                onDelete={() => deleteNote(note.id)}
                                onMarkRevised={() => markAsRevised(note.id)}
                                onOpenView={() => setSelectedNoteForView(note)}
                            />
                        ))}
                    </AnimatePresence>
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
            )}

            {/* Note View Modal */}
            <NoteViewModal
                isOpen={!!selectedNoteForView}
                note={selectedNoteForView}
                onClose={() => setSelectedNoteForView(null)}
                isDarkMode={isDarkMode}
            />
        </div>
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
                        active ? `text-${color}-400` : "text-slate-500"
                    )}
                />
            )}
            {label}
        </span>
    </motion.button>
);

const NoteCard = ({ note, isDarkMode, onDelete, onMarkRevised, onOpenView }) => {
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
            {/* Top Row: Type Badge & Actions */}
            <div className="flex items-center justify-between mb-4">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider",
                    `bg-${config.color}-500/10 text-${config.color}-500`
                )}>
                    <Icon size={12} />
                    {config.label}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleModal(true, note); }}
                        className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-700 text-blue-400" : "hover:bg-slate-100 text-blue-600")}
                        title="Edit Note"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMarkRevised(); }}
                        className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-700 text-emerald-400" : "hover:bg-slate-100 text-emerald-600")}
                        title="Mark as Revised"
                    >
                        {note.is_revised ? <CheckCircle2 size={16} /> : <Star size={16} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-700 text-red-400" : "hover:bg-slate-100 text-red-600")}
                        title="Delete Note"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow">
                <h3 className={cn("text-xl font-bold mb-2 leading-tight flex items-center gap-2", isDarkMode ? "text-white" : "text-slate-900")}>
                    {note.title}
                    {note.type === 'resource' && note.source && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(ensureAbsoluteUrl(note.source), '_blank', 'noopener,noreferrer');
                            }}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group/link"
                            title="Visit Link"
                        >
                            <img
                                src={getFaviconUrl(note.source)}
                                alt="logo"
                                className="w-6 h-6 rounded-lg shadow-sm group-hover/link:scale-110 transition-transform"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div className="hidden">
                                <ExternalLink size={16} className="text-cyan-500" />
                            </div>
                        </button>
                    )}
                </h3>

                <p className={cn("text-sm line-clamp-3 mb-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                    {note.description}
                </p>

                {note.topic && (
                    <div className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-500/10 w-fit mb-4", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        {note.topic}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} />
                    {new Date(note.created_at).toLocaleDateString()}
                </div>

                {note.revision_count > 0 && (
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-md">
                        {note.revision_count} Revisions
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default NotesLibrary;
