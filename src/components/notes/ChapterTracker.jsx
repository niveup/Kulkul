import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Atom,
    FlaskConical,
    Sigma,
    Plus,
    Trash2,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Lightbulb,
    X,
    Edit3,
    Check,
    Link as LinkIcon,
    Image as ImageIcon,
    ExternalLink,
    Upload,
    Loader2,
    Sparkles,
    Palette,
    Star,
    Zap,
    Gem,
    Flame,
    Heart,
    Hexagon,
    Shield,
    Globe,
    PenLine,
} from 'lucide-react';
import { useChapterStore } from '../../store/chapterStore';
import { useNotesStorage } from '../../hooks/useNotesStorage';
import { getFaviconUrl, ensureAbsoluteUrl } from '../../lib/utils';
import ConfirmationModal from '../ui/ConfirmationModal';
import NoteEntryModal from './NoteEntryModal';
import MarkdownRenderer from '../ui/MarkdownRenderer';


export const SUBJECTS = [
    { key: 'physics', label: 'Physics', icon: Zap, color: 'blue', gradient: 'from-blue-600 to-indigo-600' },
    { key: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'rose', gradient: 'from-rose-500 to-pink-500' },
    { key: 'math', label: 'Mathematics', icon: Sigma, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
];

export const subjectKeyToLabel = (key) => {
    const found = SUBJECTS.find(s => s.key === key);
    return found ? found.label : 'Physics';
};

const ENTRY_TYPES = [
    { key: 'question', label: 'Question', shortLabel: 'Q', icon: HelpCircle, color: 'amber' },
    { key: 'concept', label: 'Concept', shortLabel: 'C', icon: Lightbulb, color: 'cyan' },
];

// Random icon pool for images
const IMAGE_ICONS = [Sparkles, Palette, Star, Zap, Gem, Flame, Heart, Hexagon, Shield];
const getImageIcon = (index) => IMAGE_ICONS[index % IMAGE_ICONS.length];

// Normalize image data — entries store images as either plain URL strings or {url, name} objects
const getImageUrl = (img) => (typeof img === 'object' && img !== null) ? (img.url || img.downloadUrl || '') : (img || '');

// ─── URL Chip (favicon + clickable) ────────────────────────────────────
const UrlChip = memo(({ url, onRemove }) => {
    const favicon = getFaviconUrl(url);
    let displayDomain = url;
    try {
        displayDomain = new URL(ensureAbsoluteUrl(url)).hostname.replace('www.', '');
    } catch { /* keep raw */ }

    return (
        <div className="flex items-center gap-1.5 group/url">
            <a
                href={ensureAbsoluteUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg
                         bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/30
                         hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer"
                title={url}
            >
                {favicon ? (
                    <img src={favicon} alt="" className="w-3.5 h-3.5 rounded-sm flex-shrink-0" />
                ) : (
                    <Globe size={12} className="text-blue-500 flex-shrink-0" />
                )}
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate max-w-[140px]">
                    {displayDomain}
                </span>
                <ExternalLink size={10} className="text-blue-400 flex-shrink-0 opacity-60" />
            </a>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="p-0.5 rounded text-slate-300 dark:text-slate-600 
                             hover:text-red-500 hover:bg-red-500/10 transition-all
                             opacity-0 group-hover/url:opacity-100"
                >
                    <X size={10} />
                </button>
            )}
        </div>
    );
});

// ─── Image Chip (random icon + preview) ────────────────────────────────
const ImageChip = memo(({ imageUrl, index, onRemove, onView }) => {
    const IconComp = getImageIcon(index);

    return (
        <div className="flex items-center gap-1.5 group/img">
            <button
                onClick={() => onView?.(imageUrl)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg
                         bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-700/30
                         hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all cursor-pointer"
                title="View image"
            >
                <IconComp size={12} className="text-purple-500 flex-shrink-0" />
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    Image {index + 1}
                </span>
            </button>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="p-0.5 rounded text-slate-300 dark:text-slate-600 
                             hover:text-red-500 hover:bg-red-500/10 transition-all
                             opacity-0 group-hover/img:opacity-100"
                >
                    <X size={10} />
                </button>
            )}
        </div>
    );
});

// ─── Image Viewer Modal ────────────────────────────────────────────────
const ImageViewer = ({ src, onClose }) => {
    if (!src) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center
                     bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={src}
                alt="Entry image"
                className="max-w-full max-h-full object-contain rounded-lg"
            />
        </motion.div>
    );
};

// ─── Entry Card ────────────────────────────────────────────────────────
const EntryCard = memo(({ entry, subject, chapterId, subjectColor, onRequestDelete, onEditDetail }) => {
    const { removeEntry, updateEntryText, addImageToEntry, addUrlToEntry, removeImageFromEntry, removeUrlFromEntry } = useChapterStore();
    const { uploadFile, isUploading, uploadProgress } = useNotesStorage();
    const fileInputRef = useRef(null);
    const [showAddMedia, setShowAddMedia] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [viewingImage, setViewingImage] = useState(null);
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(entry.text);

    const typeConfig = ENTRY_TYPES.find(t => t.key === entry.type) || ENTRY_TYPES[0];
    const images = entry.images || [];
    const urls = entry.urls || [];
    const hasMedia = images.length > 0 || urls.length > 0;
    const isLongText = entry.text.length > 200;

    const handleAddImage = () => {
        if (!newImageUrl.trim()) return;
        addImageToEntry(subject, chapterId, entry.id, newImageUrl);
        setNewImageUrl('');
    };

    const handleAddUrl = () => {
        if (!newUrl.trim()) return;
        addUrlToEntry(subject, chapterId, entry.id, newUrl);
        setNewUrl('');
    };

    // Upload a file (from file picker or clipboard) to Telegram
    const handleUploadFile = async (file) => {
        if (!file) return;
        const result = await uploadFile(file);
        if (result && result.downloadUrl) {
            addImageToEntry(subject, chapterId, entry.id, result.downloadUrl);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleUploadFile(file);
        e.target.value = ''; // reset so same file can be re-selected
    };

    // Handle paste in image input or text area — auto-upload pasted images
    const handlePaste = async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) await handleUploadFile(file);
                return;
            }
        }
    };

    const startEditing = () => {
        setEditText(entry.text);
        setIsEditing(true);
    };

    const saveEdit = () => {
        if (editText.trim()) {
            updateEntryText(subject, chapterId, entry.id, editText);
        }
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setEditText(entry.text);
        setIsEditing(false);
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60
                         border border-slate-100 dark:border-slate-700/50 group space-y-2"
            >
                {/* Top Row: badge + text + actions */}
                <div className="flex items-start gap-2">
                    {/* Type Badge */}
                    <span className={`
                        mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0
                        ${typeConfig.color === 'amber'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                        }
                    `}>
                        {typeConfig.shortLabel}
                    </span>

                    {/* Entry Text — view or edit mode */}
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <div className="flex items-start gap-1.5">
                                <textarea
                                    autoFocus
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    onPaste={handlePaste}
                                    rows={Math.min(6, Math.max(2, editText.split('\n').length))}
                                    className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-slate-900
                                             border border-emerald-400/50 rounded-lg
                                             text-slate-800 dark:text-slate-200 outline-none
                                             focus:border-emerald-500 transition-colors resize-none"
                                />
                                <button
                                    onClick={saveEdit}
                                    className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-all flex-shrink-0"
                                    title="Save (Enter)"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="p-1 rounded text-slate-400 hover:bg-slate-500/10 transition-all flex-shrink-0"
                                    title="Cancel (Esc)"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words cursor-pointer
                                        hover:text-slate-900 dark:hover:text-slate-100 transition-colors
                                        ${isLongText && !isTextExpanded ? 'line-clamp-3' : ''}`}
                                    onClick={() => isLongText && setIsTextExpanded(!isTextExpanded)}
                                    onDoubleClick={startEditing}
                                    title={isLongText ? 'Click to expand · Double-click to edit' : 'Double-click to edit'}
                                >
                                    {entry.text.includes('{') ? <MarkdownRenderer content={entry.text} /> : entry.text}
                                </div>
                                {isLongText && (
                                    <span
                                        className="text-[11px] text-emerald-500 font-medium mt-1 inline-block cursor-default select-none"
                                    >
                                        {isTextExpanded ? '▲ Click text to collapse' : '▼ Click text to expand'}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {!isEditing && (
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={onEditDetail}
                                className="p-1 rounded text-slate-400 hover:text-emerald-500 
                                         hover:bg-emerald-500/10 transition-all flex-shrink-0"
                                title="Edit Detail"
                            >
                                <Edit3 size={13} />
                            </button>
                            <button
                                onClick={() => setShowAddMedia(!showAddMedia)}
                                className="p-1 rounded text-slate-400 hover:text-emerald-500 
                                         hover:bg-emerald-500/10 transition-all"
                                title="Add image or URL"
                            >
                                <Plus size={13} />
                            </button>
                            <button
                                onClick={() => onRequestDelete(entry)}
                                className="p-1 rounded text-slate-300 dark:text-slate-600 
                                         hover:text-red-500 hover:bg-red-500/10 transition-all"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Media Row: Images + URLs */}
                {hasMedia && (
                    <div className="flex flex-wrap gap-1.5 pl-6">
                        {images.map((img, idx) => (
                            <ImageChip
                                key={`img-${idx}`}
                                imageUrl={getImageUrl(img)}
                                index={idx}
                                onView={setViewingImage}
                                onRemove={() => removeImageFromEntry(subject, chapterId, entry.id, idx)}
                            />
                        ))}
                        {urls.map((url, idx) => (
                            <UrlChip
                                key={`url-${idx}`}
                                url={url}
                                onRemove={() => removeUrlFromEntry(subject, chapterId, entry.id, idx)}
                            />
                        ))}
                    </div>
                )}

                {/* Upload status */}
                {isUploading && (
                    <div className="flex items-center gap-2 pl-6">
                        <Loader2 size={12} className="animate-spin text-purple-500" />
                        <span className="text-[11px] text-purple-500 font-bold animate-pulse">
                            Uploading to Telegram… {uploadProgress}%
                        </span>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                />

                {/* Add Media Panel (toggled) */}
                <AnimatePresence>
                    {showAddMedia && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pl-6 pt-1 space-y-1.5">
                                {/* Upload Image File */}
                                <div className="flex items-center gap-1.5">
                                    <Upload size={12} className="text-purple-400 flex-shrink-0" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="flex-1 px-2 py-1.5 text-xs text-left bg-slate-50 dark:bg-slate-800
                                                 border border-dashed border-purple-300 dark:border-purple-700 rounded-lg
                                                 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20
                                                 disabled:opacity-40 transition-all cursor-pointer"
                                    >
                                        {isUploading ? 'Uploading…' : 'Click to upload image or Ctrl+V to paste'}
                                    </button>
                                </div>

                                {/* Add Image URL */}
                                <div className="flex items-center gap-1.5">
                                    <ImageIcon size={12} className="text-purple-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                                        onPaste={handlePaste}
                                        placeholder="Paste image URL or Ctrl+V image…"
                                        className="flex-1 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 
                                                 border border-slate-200 dark:border-slate-700 rounded-lg
                                                 text-slate-800 dark:text-slate-200 outline-none
                                                 focus:border-purple-400/50 transition-colors"
                                    />
                                    <button
                                        onClick={handleAddImage}
                                        disabled={!newImageUrl.trim()}
                                        className="px-2 py-1 text-[10px] font-bold bg-purple-500 text-white rounded-lg
                                                 hover:bg-purple-600 disabled:opacity-30 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Add URL */}
                                <div className="flex items-center gap-1.5">
                                    <LinkIcon size={12} className="text-blue-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                                        placeholder="Paste URL…"
                                        className="flex-1 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 
                                                 border border-slate-200 dark:border-slate-700 rounded-lg
                                                 text-slate-800 dark:text-slate-200 outline-none
                                                 focus:border-blue-400/50 transition-colors"
                                    />
                                    <button
                                        onClick={handleAddUrl}
                                        disabled={!newUrl.trim()}
                                        className="px-2 py-1 text-[10px] font-bold bg-blue-500 text-white rounded-lg
                                                 hover:bg-blue-600 disabled:opacity-30 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Image Viewer */}
            <AnimatePresence>
                {viewingImage && <ImageViewer src={viewingImage} onClose={() => setViewingImage(null)} />}
            </AnimatePresence>
        </>
    );
});

// ─── Chapter Card ───────────────────────────────────────────────────────
const ChapterCard = memo(({ chapter, subject, subjectColor, onRequestDeleteChapter, onRequestDeleteEntry, onEditEntry, onCapture }) => {
    const { addEntry } = useChapterStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [newEntryText, setNewEntryText] = useState('');
    const [entryType, setEntryType] = useState('question');

    const handleAddEntry = () => {
        if (!newEntryText.trim()) return;
        addEntry(subject, chapter.id, newEntryText, entryType);
        setNewEntryText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddEntry();
        }
    };

    const colorMap = {
        blue: {
            bg: 'bg-blue-500/5 dark:bg-blue-500/10',
            border: 'border-blue-500/20',
            accent: 'text-blue-500',
        },
        rose: {
            bg: 'bg-rose-500/5 dark:bg-rose-500/10',
            border: 'border-rose-500/20',
            accent: 'text-rose-500',
        },
        amber: {
            bg: 'bg-amber-500/5 dark:bg-amber-500/10',
            border: 'border-amber-500/20',
            accent: 'text-amber-500',
        },
    };
    const colors = colorMap[subjectColor] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}
        >
            {/* Chapter Header */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isExpanded ? (
                        <ChevronDown size={16} className={colors.accent} />
                    ) : (
                        <ChevronRight size={16} className={colors.accent} />
                    )}
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {chapter.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex-shrink-0">
                        {chapter.entries.length} items
                    </span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRequestDeleteChapter(chapter);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 
                             transition-all flex-shrink-0"
                    title="Delete Chapter"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 space-y-2">
                            {/* Entries List */}
                            {chapter.entries.length > 0 ? (
                                <div className="space-y-2">
                                    {chapter.entries.map((entry) => (
                                        <EntryCard
                                            key={entry.id}
                                            entry={entry}
                                            subject={subject}
                                            chapterId={chapter.id}
                                            subjectColor={subjectColor}
                                            onRequestDelete={onRequestDeleteEntry}
                                            onEditDetail={() => onEditEntry(entry)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3 italic">
                                    No entries yet — add your first question or concept below
                                </p>
                            )}

                            {/* Add Entry Input */}
                            <div className="flex items-center gap-2 pt-1">
                                {/* Type Toggle */}
                                <button
                                    onClick={() => setEntryType(entryType === 'question' ? 'concept' : 'question')}
                                    className={`
                                        px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-shrink-0
                                        ${entryType === 'question'
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                            : 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                                        }
                                    `}
                                    title={`Adding as ${entryType} — click to switch`}
                                >
                                    {entryType === 'question' ? 'Q' : 'C'}
                                </button>

                                <input
                                    type="text"
                                    value={newEntryText}
                                    onChange={(e) => setNewEntryText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={entryType === 'question' ? 'Type a question…' : 'Type a concept…'}
                                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 
                                             border border-slate-200 dark:border-slate-700
                                             rounded-lg text-sm text-slate-800 dark:text-slate-200
                                             placeholder:text-slate-400 dark:placeholder:text-slate-500
                                             outline-none focus:border-emerald-500/40 transition-colors"
                                />

                                <button
                                    onClick={handleAddEntry}
                                    disabled={!newEntryText.trim()}
                                    className="p-1.5 rounded-lg bg-emerald-500 text-white 
                                             hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed
                                             transition-all flex-shrink-0"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Capture Button — opens rich modal for this chapter */}
                            <button
                                onClick={onCapture}
                                className="flex items-center justify-center gap-2 w-full px-3 py-2 mt-1
                                         rounded-xl border border-dashed border-emerald-500/30
                                         text-emerald-500 text-xs font-semibold
                                         hover:bg-emerald-500/10 hover:border-emerald-500/50
                                         transition-all"
                            >
                                <PenLine size={13} />
                                <span>Capture Detailed Note</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

// ─── Main Component ─────────────────────────────────────────────────────
const ChapterTracker = ({
    activeSubject: propActiveSubject,
    setActiveSubject: propSetActiveSubject,
    searchTerm = ''
}) => {
    const { subjects, addChapter, removeChapter, removeEntry, updateEntry, addEntry, syncWithDb } = useChapterStore();

    // Support both internal and external state for flexibility
    const [internalSubject, setInternalSubject] = useState('physics');
    const activeSubject = propActiveSubject || internalSubject;
    const setActiveSubject = propSetActiveSubject || setInternalSubject;

    // Sync with DB on mount and on tab focus (so extension saves show without reload)
    useEffect(() => {
        if (syncWithDb) {
            syncWithDb();
        }
        const handleVisibility = () => {
            if (document.visibilityState === 'visible' && syncWithDb) {
                syncWithDb();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [syncWithDb]);

    const [newChapterName, setNewChapterName] = useState('');
    const [showAddChapter, setShowAddChapter] = useState(false);

    // Confirmation Modal State
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: null, data: null });

    const [editModal, setEditModal] = useState({
        isOpen: false,
        entry: null,
        chapterId: null,
        chapterName: '',
        subject: 'physics',
        isNew: false
    });



    // Handle saving from the rich modal (both new + edit)
    const handleSaveRichEntry = async (entryId, data) => {
        // The modal's 'description' holds the actual entry content
        const content = data.description || data.text || data.title || '';

        const entryData = {
            ...data,
            text: content,
            // Map modal's 'links' (strings) to store's 'urls' so they persist correctly
            urls: data.links || data.urls || [],
            // Optimization: If description is identical to text, store it as empty to avoid duplication/redundancy
            description: (data.description === content) ? '' : data.description
        };

        // Determine target subject key from the modal's selected subject label
        const targetSubjectLabel = data.subject || subjectKeyToLabel(editModal.subject);
        const targetSubjectKey = SUBJECTS.find(
            s => s.label.toLowerCase() === targetSubjectLabel.toLowerCase()
        )?.key || editModal.subject;

        // Determine target chapter — use chapterName from modal if provided
        const targetChapterName = data.chapterName || editModal.chapterName;
        let targetChapterId = editModal.chapterId;

        // If subject or chapter changed, find/create the target chapter
        if (targetSubjectKey !== editModal.subject || targetChapterName !== editModal.chapterName) {
            const chaptersInTarget = subjects[targetSubjectKey] || [];
            const existingChapter = chaptersInTarget.find(
                c => c.name.toLowerCase() === targetChapterName.toLowerCase()
            );
            if (existingChapter) {
                targetChapterId = existingChapter.id;
            } else if (targetChapterName.trim()) {
                // Auto-create the chapter in the target subject
                addChapter(targetSubjectKey, targetChapterName);
                // Get the newly created chapter's ID
                const updatedChapters = useChapterStore.getState().subjects[targetSubjectKey] || [];
                const newChapter = updatedChapters.find(
                    c => c.name.toLowerCase() === targetChapterName.toLowerCase()
                );
                targetChapterId = newChapter?.id;
            }
        }

        if (!targetChapterId) return;

        if (editModal.isNew) {
            addEntry(
                targetSubjectKey,
                targetChapterId,
                entryData.text,
                data.type || 'concept',
                entryData
            );
        } else if (editModal.entry) {
            // If subject/chapter changed, remove from old location and add to new
            if (targetSubjectKey !== editModal.subject || targetChapterId !== editModal.chapterId) {
                removeEntry(editModal.subject, editModal.chapterId, editModal.entry.id);
                addEntry(
                    targetSubjectKey,
                    targetChapterId,
                    entryData.text,
                    data.type || 'concept',
                    entryData
                );
            } else {
                updateEntry(targetSubjectKey, targetChapterId, entryId, entryData);
            }
        }

        setEditModal(prev => ({ ...prev, isOpen: false, entry: null, isNew: false }));
    };

    // Open modal to EDIT an existing entry
    const handleOpenEditModal = (subject, chapterId, chapterName, entry) => {
        const calculatedDescription = (entry.description && entry.description !== entry.text)
            ? entry.description
            : (entry.text || '');

        setEditModal({
            isOpen: true,
            entry: {
                ...entry,
                // Concept Name = Chapter Name
                title: entry.title || chapterName,
                // Fix: Prevent duplication by checking if text === description
                description: calculatedDescription,
                subject: subjectKeyToLabel(subject),
                topic: chapterName,
            },
            chapterId,
            chapterName,
            subject,
            isNew: false
        });
    };

    // Open modal to CREATE a new entry from a chapter's Capture button
    const handleOpenCaptureModal = (subject, chapterId, chapterName) => {
        setEditModal({
            isOpen: true,
            entry: null,
            chapterId,
            chapterName,
            subject,
            isNew: true
        });
    };

    const editModalViewContext = useMemo(() => ({
        subject: subjectKeyToLabel(editModal.subject),
        topic: editModal.chapterName
    }), [editModal.subject, editModal.chapterName]);

    const currentSubject = SUBJECTS.find(s => s.key === activeSubject);

    // Filter chapters and entries based on searchTerm
    const filteredChapters = useMemo(() => {
        const chapters = subjects[activeSubject] || [];
        if (!searchTerm.trim()) return chapters;

        const query = searchTerm.toLowerCase();
        return chapters.map(chapter => {
            // Check if chapter name matches
            const chapterMatches = chapter.name.toLowerCase().includes(query);

            // Filter entries that match
            const filteredEntries = chapter.entries.filter(entry =>
                entry.text.toLowerCase().includes(query) ||
                (entry.description && entry.description.toLowerCase().includes(query))
            );

            // If chapter matches or has matching entries, keep it
            if (chapterMatches || filteredEntries.length > 0) {
                return {
                    ...chapter,
                    entries: chapterMatches ? chapter.entries : filteredEntries
                };
            }
            return null;
        }).filter(Boolean);
    }, [subjects, activeSubject, searchTerm]);

    const chapters = filteredChapters;

    const handleAddChapter = () => {
        if (!newChapterName.trim()) return;
        addChapter(activeSubject, newChapterName);
        setNewChapterName('');
        setShowAddChapter(false);
    };

    const handleChapterKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddChapter();
        } else if (e.key === 'Escape') {
            setShowAddChapter(false);
            setNewChapterName('');
        }
    };

    const handleDeleteChapter = (chapter) => {
        setConfirmDelete({
            isOpen: true,
            type: 'chapter',
            data: chapter
        });
    };

    const handleDeleteEntry = (entry) => {
        setConfirmDelete({
            isOpen: true,
            type: 'entry',
            data: entry
        });
    };

    const executeDeletion = () => {
        const { type, data } = confirmDelete;
        if (type === 'chapter') {
            removeChapter(activeSubject, data.id);
        } else if (type === 'entry') {
            removeEntry(activeSubject, data.chapterId, data.id);
        }
        setConfirmDelete({ isOpen: false, type: null, data: null });
    };

    return (
        <div className="h-full flex flex-col bg-transparent transition-colors duration-500">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
                <motion.div
                    key={activeSubject}
                    initial="initial"
                    animate="animate"
                    variants={{
                        initial: { opacity: 0, y: 6 },
                        animate: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.25,
                                ease: [0.22, 1, 0.36, 1],
                                staggerChildren: 0.03,
                                delayChildren: 0.02
                            }
                        }
                    }}
                    className="space-y-4"
                >
                    <AnimatePresence mode="popLayout">
                        {chapters.map((chapter) => (
                            <motion.div
                                key={chapter.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChapterCard
                                    chapter={chapter}
                                    subject={activeSubject}
                                    subjectColor={currentSubject?.color}
                                    onRequestDeleteChapter={handleDeleteChapter}
                                    onRequestDeleteEntry={(entry) => handleDeleteEntry({ ...entry, chapterId: chapter.id })}
                                    onEditEntry={(entry) => handleOpenEditModal(activeSubject, chapter.id, chapter.name, entry)}
                                    onCapture={() => handleOpenCaptureModal(activeSubject, chapter.id, chapter.name)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {chapters.length === 0 && !showAddChapter && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-20"
                        />
                    )}
                </motion.div>

                {/* Add Chapter Section — Compact */}
                <div className="pt-6 pb-16 flex flex-col items-center gap-3">
                    {!showAddChapter && (
                        <motion.button
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setShowAddChapter(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                                       border border-dashed transition-all
                                       ${currentSubject?.color === 'amber'
                                    ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50'
                                    : currentSubject?.color === 'rose'
                                        ? 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50'
                                        : 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/50'
                                }`}
                        >
                            <Plus size={14} />
                            <span>New Chapter</span>
                        </motion.button>
                    )}

                    <AnimatePresence>
                        {showAddChapter && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, y: 10 }}
                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                exit={{ height: 0, opacity: 0, y: 5 }}
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="overflow-hidden w-full max-w-md"
                            >
                                <div className="flex items-center gap-2 p-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newChapterName}
                                        onChange={(e) => setNewChapterName(e.target.value)}
                                        onKeyDown={handleChapterKeyDown}
                                        placeholder="Chapter name..."
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80
                                                 border border-slate-200 dark:border-slate-700
                                                 text-slate-800 dark:text-slate-100 outline-none text-sm
                                                 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                    <button
                                        onClick={handleAddChapter}
                                        disabled={!newChapterName.trim()}
                                        className="p-2.5 rounded-xl bg-emerald-500 text-white
                                                 hover:bg-emerald-600 active:scale-95 disabled:opacity-30 transition-all"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddChapter(false);
                                            setNewChapterName('');
                                        }}
                                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 text-slate-400
                                                 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all
                                                 border border-slate-200 dark:border-slate-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <ConfirmationModal
                    isOpen={confirmDelete.isOpen}
                    onClose={() => setConfirmDelete({ isOpen: false, type: null, data: null })}
                    onConfirm={executeDeletion}
                    title={confirmDelete.type === 'chapter' ? 'Permanent Deletion' : 'Delete Entry?'}
                    message={confirmDelete.type === 'chapter'
                        ? `Are you absolutely sure about deleting "${confirmDelete.data?.name}"? All associated research and notes will be lost.`
                        : 'Confirm removal of this specific entry from your knowledge base.'}
                    type="danger"
                />

                <NoteEntryModal
                    isDarkMode={true}
                    isControlled={true}
                    isOpen={editModal.isOpen}
                    onClose={() => setEditModal(prev => ({ ...prev, isOpen: false, isNew: false }))}
                    editingNote={editModal.entry}
                    currentViewContext={editModalViewContext}
                    onSave={handleSaveRichEntry}
                    onRequestDelete={() => {
                        if (editModal.entry) {
                            handleDeleteEntry({
                                ...editModal.entry,
                                chapterId: editModal.chapterId
                            });
                            setEditModal(prev => ({ ...prev, isOpen: false }));
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ChapterTracker;
