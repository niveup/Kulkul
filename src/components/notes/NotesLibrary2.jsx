import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../ui/Toast';
import {
    Search,
    BookOpen,
    Calculator,
    BrainCircuit,
    AlertCircle,
    Lightbulb,
    Link as LinkIcon,
    Trash2,
    Edit3,
    CheckCircle2,
    ExternalLink,
    Image as ImageIcon,
    File,
    X,
    ChevronLeft,
    ChevronRight,
    Plus,
    ArrowLeft
} from 'lucide-react';
import { useNotesStore, useNoteActions } from '../../store/notesStore';
import { useVault } from '../../hooks/useVault';
import { cn, ensureAbsoluteUrl, getFaviconUrl } from '../../lib/utils';

import FloatingAddButton from './FloatingAddButton';
import NoteEntryModal from './NoteEntryModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import ChapterTracker, { SUBJECTS } from './ChapterTracker';

const TYPE_CONFIG = {
    concept: { icon: BookOpen, color: 'emerald', label: 'Concept' },
    formula: { icon: Calculator, color: 'blue', label: 'Formula' },
    trick: { icon: BrainCircuit, color: 'amber', label: 'Trick' },
    mistake: { icon: AlertCircle, color: 'red', label: 'Mistake' },
    doubt: { icon: Lightbulb, color: 'purple', label: 'Doubt' },
    resource: { icon: LinkIcon, color: 'cyan', label: 'Resource' },
};

const CompactNoteCard = ({ note, onEdit, onDelete, onViewImage, onViewPdf }) => {
    const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.concept;
    const Icon = config.icon;

    const hoverBorderClasses = {
        emerald: 'border-emerald-500/50',
        blue: 'border-blue-500/50',
        amber: 'border-amber-500/50',
        red: 'border-red-500/50',
        purple: 'border-purple-500/50',
        cyan: 'border-cyan-500/50'
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className={`
                relative bg-white dark:bg-slate-800 
                rounded-xl overflow-hidden shadow-md border-2 mb-6
                inline-block w-full break-inside-avoid
                ${hoverBorderClasses[config.color] || 'border-slate-200'}
            `}
        >
            {/* Header Row: Icon + Title + PDF Button */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`
                        p-1.5 rounded-lg flex-shrink-0
                        ${config.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : ''}
                        ${config.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                        ${config.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : ''}
                        ${config.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                        ${config.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : ''}
                        ${config.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : ''}
                    `}>
                        <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                            <MarkdownRenderer content={note.title} className="inline [&_p]:inline [&_p]:mb-0" />
                        </h3>
                        {note.topic && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-words">
                                <MarkdownRenderer content={note.topic} className="inline [&_p]:inline [&_p]:mb-0 prose-sm" />
                            </p>
                        )}
                    </div>
                </div>

                {/* View PDF Button */}
                {note.pdf && (
                    <button
                        onClick={() => onViewPdf(note.pdf)}
                        className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 
                                 text-blue-600 dark:text-blue-400 text-xs rounded-lg
                                 transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                        <File size={12} />
                        <span>View PDF</span>
                    </button>
                )}
            </div>



            {/* Description Row */}
            <div className="px-3 py-4">
                <div className={cn(
                    "leading-relaxed text-slate-700 dark:text-slate-200 break-words",
                    note.description?.length < 100 ? "text-lg font-medium" :
                        note.description?.length < 300 ? "text-base" : "text-sm"
                )}>
                    <MarkdownRenderer content={note.description} />
                </div>
            </div>

            {/* Multi-Media Footer Row */}
            <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                {/* Images List */}
                {(note.images?.length > 0 || note.image) && (
                    <div className="flex flex-wrap gap-2">
                        {/* Support Legacy Single Image */}
                        {note.image && !note.images?.some(img => (typeof img === 'string' ? img : img?.url) === note.image) && (
                            <button
                                onClick={() => onViewImage(note.image)}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 
                                         text-purple-600 dark:text-purple-400 text-[10px] rounded-lg
                                         transition-colors flex items-center gap-1 border border-purple-500/10"
                            >
                                <ImageIcon size={10} />
                                <span>Image</span>
                            </button>
                        )}
                        {/* New Images Array - supports both string URLs and {url, name} objects */}
                        {note.images?.filter(img => img).map((img, idx) => {
                            const imageUrl = typeof img === 'string' ? img : img?.url;
                            const imageName = typeof img === 'object' && img?.name ? img.name : null;
                            if (!imageUrl) return null;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => onViewImage(imageUrl, note.id)}
                                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 
                                             text-purple-600 dark:text-purple-400 text-[10px] rounded-lg
                                             transition-colors flex items-center gap-1 border border-purple-500/10"
                                >
                                    <ImageIcon size={10} />
                                    <span>{imageName || `Image${note.images.length > 1 ? ` ${idx + 1}` : ''}`}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Links List */}
                {(note.links?.length > 0 || note.link) && (
                    <div className="flex flex-col gap-1.5">
                        {/* Support Legacy Single Link */}
                        {note.link && !note.links?.includes(note.link) && (
                            <a
                                href={ensureAbsoluteUrl(note.link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 hover:underline group"
                            >
                                <div className="flex items-center gap-1 min-w-0">
                                    {getFaviconUrl(note.link) && (
                                        <img
                                            src={getFaviconUrl(note.link)}
                                            alt=""
                                            className="w-3 h-3 rounded flex-shrink-0"
                                        />
                                    )}
                                    <span className="truncate">Reference Link</span>
                                </div>
                                <ExternalLink size={10} className="flex-shrink-0 opacity-50 group-hover:opacity-100" />
                            </a>
                        )}
                        {/* New Links Array */}
                        {note.links?.filter(l => l).map((link, idx) => (
                            <a
                                key={idx}
                                href={ensureAbsoluteUrl(link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 hover:underline group"
                            >
                                <div className="flex items-center gap-1 min-w-0">
                                    {getFaviconUrl(link) && (
                                        <img
                                            src={getFaviconUrl(link)}
                                            alt=""
                                            className="w-3 h-3 rounded flex-shrink-0"
                                        />
                                    )}
                                    <span className="truncate">Resource Link {note.links.length > 1 ? idx + 1 : ''}</span>
                                </div>
                                <ExternalLink size={10} className="flex-shrink-0 opacity-50 group-hover:opacity-100" />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons - Fixed & Visible */}
            <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                <button
                    onClick={() => onEdit(note)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-700 
                             text-emerald-600 dark:text-emerald-400 rounded-lg
                             shadow-sm border border-emerald-500/20 transition-all hover:bg-emerald-50 dark:hover:bg-slate-600"
                    title="Edit Note"
                >
                    <Edit3 size={14} />
                </button>
                <button
                    onClick={() => onDelete(note)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-700 
                             text-red-500 dark:text-red-400 rounded-lg
                             shadow-sm border border-red-500/20 transition-all"
                    title="Delete Note"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};

const NotesLibrary2 = () => {
    const { notes, isLoading, error, isModalOpen, editingNote } = useNotesStore();
    const { fetchNotes, deleteNote, markAsRevised, toggleModal, removeMediaLink } = useNoteActions();
    const { resolveMediaUrl, deleteFileByUrl, verifyFileExists } = useVault();
    const toast = useToast();

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    // Default to blank page (Chapter Tracker) as requested
    const [showBlankPage, setShowBlankPage] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [viewingPdf, setViewingPdf] = useState(null);
    const [lastSyncTime, setLastSyncTime] = useState(0);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeSubject, setActiveSubject] = useState('physics');
    const NOTES_PER_PAGE = 8; // Adjust based on layout

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Automatic background sync removed to prevent MEGA rate limiting.
    // Telegram storage does not require active link verification.


    const filteredNotes = useMemo(() => {
        let result = Array.isArray(notes) ? notes : [];

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

    // Pagination logic
    const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
    const paginatedNotes = useMemo(() => {
        const startIndex = (currentPage - 1) * NOTES_PER_PAGE;
        return filteredNotes.slice(startIndex, startIndex + NOTES_PER_PAGE);
    }, [filteredNotes, currentPage, NOTES_PER_PAGE]);

    // Reset to page 1 when filters/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchTerm]);

    const handleEdit = (note) => {
        toggleModal(true, note);
    };

    const handleDelete = (note) => {
        setNoteToDelete(note);
    };

    const confirmDelete = async () => {
        if (!noteToDelete) return;

        setIsDeleting(true);
        try {
            const note = noteToDelete;
            // Clean up MEGA files first if any
            if (note.images?.length > 0) {
                console.log('[NotesLibrary] Cleaning up MEGA files for note:', note.id);
                for (const img of note.images) {
                    const url = typeof img === 'string' ? img : img?.url;
                    if (url && typeof url === 'string' && url.includes('mega.nz')) {
                        await deleteFileByUrl(url);
                    }
                }
            }
            if (note.links?.length > 0) {
                for (const url of note.links) {
                    if (url && url.includes('mega.nz')) {
                        await deleteFileByUrl(url);
                    }
                }
            }
            await deleteNote(note.id);
            toast.success('Note Deleted', 'The note has been permanently removed.');
        } catch (error) {
            console.error('Failed to delete note:', error);
            toast.error('Delete Failed', error.message || 'Could not delete the note.');
        } finally {
            setIsDeleting(false);
            setNoteToDelete(null);
        }
    };

    const handleViewImage = async (imageSrc, noteId) => {
        try {
            const resolved = await resolveMediaUrl(imageSrc);
            setViewingImage(resolved);
        } catch (err) {
            if (err.message === 'MEGA_FILE_GONE') {
                console.log('[NotesLibrary] Auto-cleaning broken link after click:', imageSrc);
                await removeMediaLink(noteId, imageSrc);
                // No need for window.confirm, as per user request for silent sync
            } else {
                console.error('Failed to resolve image:', err);
                setViewingImage(imageSrc);
            }
        }
    };

    const handleViewPdf = (pdfSrc) => {
        setViewingPdf(pdfSrc);
    };

    // Track mouse position for the "Torch" effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020617] selection:bg-emerald-500/30">
            {/* Cinematic Mesh & Interactive Torch Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Dynamic Torch Glow (Follows Mouse) */}
                <motion.div
                    animate={{
                        x: mousePos.x - 300,
                        y: mousePos.y - 300,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 50, mass: 0.8 }}
                    className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] mix-blend-screen opacity-50"
                />

                {/* Layer 1: Base Liquid Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#0c0f1a_0%,#020617_100%)]" />

                {/* Layer 2: Animated Orbital Blobs */}
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] opacity-20"
                    style={{
                        background: `
                            radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 40%),
                            radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
                            radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 40%)
                        `
                    }}
                />

                {/* Layer 3: High-Frequency Noise Grain */}
                <div
                    className="absolute inset-0 opacity-[0.04] mix-blend-overlay contrast-150"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                    }}
                />

                {/* Layer 4: Deep Vignette & Depth Mask */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.7)_100%)]" />
            </div>

            {/* Content Layer with Glassmorphism Foundation */}
            <div className="relative z-10 p-6 space-y-8 max-w-[1400px] mx-auto">
                {/* Advanced Header with Frosted Material */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                            <BookOpen className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                                Notes <span className="text-emerald-500">Library</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 opacity-70">
                                {showBlankPage ? `${activeSubject} Tracker` : (activeFilter === 'all' ? 'Knowledge Bank' : `${activeFilter} Context`)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Integrated Search */}
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Find anything..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-9 bg-slate-100 dark:bg-slate-800/50 
                                     border-2 border-transparent focus:border-emerald-500/20
                                     rounded-xl outline-none text-slate-900 dark:text-white text-sm transition-all"
                            />
                        </div>
                        {/* New Blank Page Button */}
                        <button
                            onClick={() => setShowBlankPage(true)}
                            className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl
                                 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105
                                 flex items-center justify-center flex-shrink-0"
                            title="New Page"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                {/* Blank Page View */}
                {showBlankPage ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[60vh] flex flex-col"
                    >
                        {/* Back Button and Subject Tabs Row */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setShowBlankPage(false)}
                                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 
                                     hover:text-emerald-500 dark:hover:text-emerald-400 
                                     transition-colors group w-fit"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Back to Notes</span>
                            </button>

                            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
                                {SUBJECTS.map((sub) => {
                                    const Icon = sub.icon;
                                    const isActive = activeSubject === sub.key;
                                    return (
                                        <button
                                            key={sub.key}
                                            onClick={() => setActiveSubject(sub.key)}
                                            className={`
                                                relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300
                                                hover:scale-[1.02] active:scale-[0.98]
                                                ${isActive
                                                    ? 'text-white shadow-lg'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeSubjectTab"
                                                    className={`absolute inset-0 bg-gradient-to-br ${sub.gradient} rounded-xl shadow-lg shadow-${sub.color}-500/20`}
                                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                                />
                                            )}
                                            <Icon size={16} className="relative z-10" />
                                            <span className="relative z-10 hidden sm:inline">{sub.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chapter Tracker */}
                        <ChapterTracker
                            activeSubject={activeSubject}
                            setActiveSubject={setActiveSubject}
                            searchTerm={searchTerm}
                        />
                    </motion.div>
                ) : (
                    <>
                        {/* Notes Grid - Masonry Layout */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6"
                        >
                            {paginatedNotes.map(note => (
                                <CompactNoteCard
                                    key={note.id}
                                    note={note}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onViewImage={handleViewImage}
                                    onViewPdf={handleViewPdf}
                                />
                            ))}
                        </motion.div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6 pb-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`
                                    p-2 rounded-xl border-2 transition-all
                                    ${currentPage === 1
                                            ? 'border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                                            : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                                        }
                                `}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {/* Page Indicators */}
                                <div className="flex items-center gap-1.5 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`
                                            w-8 h-8 rounded-lg text-sm font-bold transition-all
                                            ${page === currentPage
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-500'
                                                }
                                        `}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`
                                    p-2 rounded-xl border-2 transition-all
                                    ${currentPage === totalPages
                                            ? 'border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                                            : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                                        }
                                `}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredNotes.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                                <BookOpen size={48} className="mb-4" />
                                <p className="text-sm">No notes found</p>
                            </div>
                        )}
                    </>
                )}

                {/* Image Viewer Modal */}
                <AnimatePresence>
                    {viewingImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1000] flex items-center justify-center\n                                 bg-black/80 backdrop-blur-sm p-4"
                            onClick={() => setViewingImage(null)}
                        >
                            <motion.img
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                src={viewingImage}
                                alt="Note image"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PDF Viewer Modal */}
                <AnimatePresence>
                    {viewingPdf && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1000] flex items-center justify-center\n                                 bg-black/80 backdrop-blur-sm p-4"
                            onClick={() => setViewingPdf(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="w-full max-w-4xl h-[80vh] bg-white rounded-lg overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h3 className="font-semibold">PDF Viewer</h3>
                                    <button
                                        onClick={() => setViewingPdf(null)}
                                        className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors text-slate-500 flex items-center justify-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <iframe
                                    src={viewingPdf}
                                    className="w-full h-[calc(80vh-60px)]"
                                    title="PDF Viewer"
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Add Button */}
                {!isModalOpen && !showBlankPage && (
                    <FloatingAddButton />
                )}

                {/* Note Entry Modal */}
                <NoteEntryModal
                    isOpen={isModalOpen}
                    onClose={() => toggleModal(false)}
                    editingNote={editingNote}
                    onRequestDelete={() => {
                        if (editingNote) {
                            setNoteToDelete(editingNote);
                            toggleModal(false);
                        }
                    }}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    isOpen={!!noteToDelete}
                    onClose={() => setNoteToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Note"
                    message="Are you sure you want to delete this note? This action cannot be undone and will remove all associated files."
                    confirmText="Delete Note"
                    isDangerous={true}
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
};

export default NotesLibrary2;
