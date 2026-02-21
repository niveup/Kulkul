import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Edit3, Calendar, BookOpen, Calculator, BrainCircuit, AlertCircle, Lightbulb, Link as LinkIcon, Maximize, Trash2 } from 'lucide-react';
import { cn, ensureAbsoluteUrl, getFaviconUrl } from '../../lib/utils';
import { useNoteActions } from '../../store/notesStore';
import { useNotesStore } from '../../store/notesStore';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import ImageViewerModal from './ImageViewerModal';

const TYPE_CONFIG = {
    concept: { icon: BookOpen, color: 'emerald', label: 'Concept' },
    formula: { icon: Calculator, color: 'blue', label: 'Formula' },
    trick: { icon: BrainCircuit, color: 'amber', label: 'Trick' },
    mistake: { icon: AlertCircle, color: 'red', label: 'Mistake' },
    doubt: { icon: Lightbulb, color: 'purple', label: 'Doubt' },
    resource: { icon: LinkIcon, color: 'cyan', label: 'Resource' },
};

const NoteViewModal = ({ isOpen, note, onClose, isDarkMode }) => {
    const { toggleModal } = useNoteActions();
    const updateNoteImage = useNotesStore(state => state.updateNoteImage);
    const removeMediaLink = useNotesStore(state => state.removeMediaLink);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageToDelete, setImageToDelete] = useState(null);

    if (!note) return null;

    const config = TYPE_CONFIG[note.type] || TYPE_CONFIG.concept;
    const Icon = config.icon;

    const handleEdit = () => {
        onClose();
        toggleModal(true, note);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] border-2 shadow-2xl",
                            isDarkMode
                                ? "bg-slate-900 border-slate-800 shadow-slate-950"
                                : "bg-white border-slate-100 shadow-slate-200"
                        )}
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 shrink-0 flex items-start justify-between border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-2xl",
                                    `bg-${config.color}-500/10 text-${config.color}-500`
                                )}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50")}>
                                        {config.label}
                                    </div>
                                    <h2 className={cn("text-2xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                                        <MarkdownRenderer content={note.title} as="span" className="inline" />
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-slate-500/10 transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 pt-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            {/* Key Takeaways Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                                    Key Takeaways
                                </h4>
                                <div className={cn(
                                    "text-lg leading-relaxed font-medium break-words break-all whitespace-pre-wrap",
                                    isDarkMode ? "text-slate-300" : "text-slate-700"
                                )}>
                                    <MarkdownRenderer content={note.description || "No notes captured for this concept yet."} />
                                </div>
                            </div>

                            {/* Attached Images Section */}
                            {note.images && note.images.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                                        Attached Media
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {note.images.map((imgObj, i) => {
                                            const actualUrl = typeof imgObj === 'string' ? imgObj : imgObj?.url || '';
                                            if (!actualUrl) return null;

                                            return (
                                                <div key={i} className="relative group rounded-2xl overflow-hidden border-2 border-white/5 hover:border-emerald-500/50 transition-all aspect-video">
                                                    <button
                                                        onClick={() => setSelectedImage(imgObj)}
                                                        className="w-full h-full text-left block cursor-zoom-in"
                                                    >
                                                        <img
                                                            src={ensureAbsoluteUrl(actualUrl)}
                                                            alt={`Attachment ${i + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                                            <Maximize size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                                        </div>
                                                    </button>

                                                    {/* Quick Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImageToDelete(actualUrl);
                                                        }}
                                                        className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-red-500/90 text-slate-300 hover:text-white rounded-xl backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                                                        title="Delete Image"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Resource Link Section */}
                            {note.type === 'resource' && note.source && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                                        Resource Access
                                    </h4>
                                    <a
                                        href={ensureAbsoluteUrl(note.source)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex items-center justify-between p-6 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/20 hover:border-cyan-500/50 transition-all overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-sm relative flex items-center justify-center w-[58px] h-[58px]">
                                                <img
                                                    src={getFaviconUrl(note.source)}
                                                    alt="logo"
                                                    className="w-8 h-8 rounded-lg z-10 bg-white"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center hidden w-full h-full text-cyan-500">
                                                    <LinkIcon size={24} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-cyan-500 font-bold mb-1 text-lg">Launch Resource</div>
                                                <div className="text-xs text-cyan-500/60 truncate max-w-md">{note.source}</div>
                                            </div>
                                        </div>
                                        <ExternalLink size={24} className="text-cyan-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />

                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </a>
                                </div>
                            )}

                            {/* Reference Links Section */}
                            {note.links && note.links.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                                        Reference Links
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        {note.links.map((link, idx) => {
                                            if (!link) return null;
                                            return (
                                                <a
                                                    key={idx}
                                                    href={ensureAbsoluteUrl(link)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group relative flex items-center justify-between p-4 rounded-2xl bg-slate-500/5 border-2 border-slate-500/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all overflow-hidden"
                                                >
                                                    <div className="relative z-10 flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 shrink-0 rounded-xl bg-white/10 border border-white/10 shadow-sm relative flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={getFaviconUrl(link)}
                                                                alt="icon"
                                                                className="w-6 h-6 z-10 bg-transparent object-contain drop-shadow-sm"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center hidden w-full h-full text-blue-500">
                                                                <LinkIcon size={18} />
                                                            </div>
                                                        </div>
                                                        <div className="truncate">
                                                            <div className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors truncate">
                                                                {link.replace(/^https?:\/\/(www\.)?/, '')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0 ml-4" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    Captured on {new Date(note.created_at).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                                >
                                    <Edit3 size={14} />
                                    Edit Details
                                </button>
                            </div>
                        </div>

                        {/* Custom Deletion Confirmation Modal */}
                        <AnimatePresence>
                            {imageToDelete && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm rounded-[32px]"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 10 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 10 }}
                                        className={cn(
                                            "w-full max-w-[420px] p-8 rounded-[32px] border-2 shadow-2xl flex flex-col items-center text-center relative overflow-hidden",
                                            isDarkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"
                                        )}
                                    >
                                        {/* Background glow effect */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />

                                        <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 text-red-500 flex items-center justify-center mb-6 relative z-10 shadow-inner">
                                            <Trash2 size={36} strokeWidth={1.5} />
                                        </div>
                                        <h3 className={cn("text-2xl font-black tracking-tight mb-3 relative z-10", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Say Goodbye?
                                        </h3>
                                        <p className={cn("font-medium leading-relaxed mb-8 relative z-10", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                            This isn't a drill. Once you delete this image, it's permanently vanished into the digital void. We can't recover it. Ready to let it go?
                                        </p>
                                        <div className="flex gap-3 w-full relative z-10">
                                            <button
                                                onClick={() => setImageToDelete(null)}
                                                className={cn(
                                                    "flex-1 py-3.5 rounded-2xl font-bold transition-all border shadow-sm",
                                                    isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                                                )}
                                            >
                                                Keep it
                                            </button>
                                            <button
                                                onClick={() => {
                                                    removeMediaLink(note.id, imageToDelete);
                                                    setImageToDelete(null);
                                                }}
                                                className="flex-1 py-3.5 px-2 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/25 border border-red-400/20 flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={18} /> Yes, Trash It
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}

            {!!selectedImage && (
                <ImageViewerModal
                    isOpen={true}
                    imageObj={selectedImage}
                    noteId={note.id}
                    onClose={() => setSelectedImage(null)}
                    onUpdateImage={updateNoteImage}
                    onDeleteImage={removeMediaLink}
                />
            )}
        </AnimatePresence>
    );
};

export default NoteViewModal;
