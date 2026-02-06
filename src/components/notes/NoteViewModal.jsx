import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Edit3, Calendar, BookOpen, Calculator, BrainCircuit, AlertCircle, Lightbulb, Link as LinkIcon } from 'lucide-react';
import { cn, ensureAbsoluteUrl, getFaviconUrl } from '../../lib/utils';
import { useNoteActions } from '../../store/notesStore';

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
                            "relative w-full max-w-2xl overflow-hidden rounded-[32px] border-2 shadow-2xl",
                            isDarkMode
                                ? "bg-slate-900 border-slate-800 shadow-slate-950"
                                : "bg-white border-slate-100 shadow-slate-200"
                        )}
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-start justify-between border-b border-white/5">
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
                                        {note.title}
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
                        <div className="p-8 pt-6 space-y-8">
                            {/* Key Takeaways Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                                    Key Takeaways
                                </h4>
                                <div className={cn(
                                    "text-lg leading-relaxed whitespace-pre-wrap font-medium",
                                    isDarkMode ? "text-slate-300" : "text-slate-700"
                                )}>
                                    {note.description || "No notes captured for this concept yet."}
                                </div>
                            </div>

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
                                            <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-sm">
                                                <img
                                                    src={getFaviconUrl(note.source)}
                                                    alt="logo"
                                                    className="w-8 h-8 rounded-lg"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-cyan-500 font-bold mb-1 text-lg">Launch Resource</div>
                                                <div className="text-xs text-cyan-500/60 truncate max-w-md">{note.source}</div>
                                            </div>
                                        </div>
                                        <ExternalLink size={24} className="text-cyan-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />

                                        {/* Animated Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </a>
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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NoteViewModal;
