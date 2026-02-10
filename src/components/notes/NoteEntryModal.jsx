import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Save, Trash2, Calendar, Clock, BookOpen, Hash, Link as LinkIcon, Image as ImageIcon, Upload, Loader2, Calculator, BrainCircuit, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';
import { useNotesStore, useNoteActions } from '../../store/notesStore';
import { useVault } from '../../hooks/useVault'; // Keep for legacy deletion
import { useNotesStorage } from '../../hooks/useNotesStorage'; // New storage engine
import MarkdownRenderer from '../ui/MarkdownRenderer';

const NOTE_TYPES = [
    {
        value: 'concept',
        label: 'New Concept',
        icon: BookOpen,
        color: 'emerald',
        fields: {
            title: { label: 'Concept Name', placeholder: 'e.g. Lenz\'s Law' },
            description: { label: 'Detailed Explanation', placeholder: 'Explain the core principles...' }
        }
    },
    {
        value: 'formula',
        label: 'Formula',
        icon: Calculator,
        color: 'blue',
        fields: {
            title: { label: 'Formula Name', placeholder: 'e.g. Gauss\'s Law' },
            description: { label: 'Derivation / Expression', placeholder: 'Write the formula and how to use it...' }
        }
    },
    {
        value: 'trick',
        label: 'Trick / Shortcut',
        icon: BrainCircuit,
        color: 'amber',
        fields: {
            title: { label: 'Trick Name', placeholder: 'e.g. n-1 Rule for Stoichiometry' },
            description: { label: 'How it Works', placeholder: 'Describe the shortcut steps...' }
        }
    },
    {
        value: 'mistake',
        label: 'Mistake to Avoid',
        icon: AlertCircle,
        color: 'red',
        fields: {
            title: { label: 'The Mistake', placeholder: 'e.g. Forgetting the minus sign in Work' },
            description: { label: 'Correction / Lesson', placeholder: 'Why did it happen and what is the correct way?' }
        }
    },
    {
        value: 'doubt',
        label: 'Unresolved Doubt',
        icon: Lightbulb,
        color: 'purple',
        fields: {
            title: { label: 'The Question', placeholder: 'What exactly is unclear?' },
            description: { label: 'Context / Attempts', placeholder: 'What have you tried so far?' }
        }
    },
    {
        value: 'resource',
        label: 'Resource Link',
        icon: LinkIcon,
        color: 'cyan',
        fields: {
            title: { label: 'Resource Title', placeholder: 'e.g. MIT OCW Lecture 4' },
            source: { label: 'URL / Link', placeholder: 'Paste the link here...' },
            description: { label: 'Key Takeaways', placeholder: 'Summary of the resource content...' }
        }
    },
];

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];
const PRIORITIES = ['low', 'medium', 'high'];

const NoteEntryModal = ({
    isDarkMode,
    onRequestDelete,
    // Controlled props
    isControlled = false,
    isOpen: controlledIsOpen,
    editingNote: controlledEditingNote,
    onSave: controlledOnSave,
    onDelete: controlledOnDelete,
    onClose: controlledOnClose,
    currentViewContext: controlledViewContext
}) => {
    // Internal Store fallback
    const internalStore = useNotesStore();
    const internalActions = useNoteActions();

    // Determine values/actions based on control mode
    const isModalOpen = isControlled ? controlledIsOpen : internalStore.isModalOpen;
    const editingNote = isControlled ? controlledEditingNote : internalStore.editingNote;
    const currentViewContext = isControlled ? controlledViewContext : internalStore.currentViewContext;

    const addNote = isControlled ? controlledOnSave : internalActions.addNote;
    const updateNote = isControlled ? controlledOnSave : internalActions.updateNote;
    const toggleModal = isControlled ? controlledOnClose : internalActions.toggleModal;

    // Legacy Vault for cleanup only
    const { deleteFileByUrl } = useVault();

    // New Telegram Storage
    const { uploadFile, isUploading, uploadProgress, fileSizeError, clearFileSizeError, MAX_FILE_SIZE_MB } = useNotesStorage();

    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        type: 'concept',
        subject: 'Physics',
        topic: '',
        title: '',
        description: '',
        tags: '',
        priority: 'medium',
        source: '',
        chapterName: '',
        images: [{ url: '', name: '' }],
        links: ['']
    });

    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isBooting, setIsBooting] = useState(false);

    useEffect(() => {
        if (isGuideOpen) {
            setIsBooting(true);
            const timer = setTimeout(() => setIsBooting(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isGuideOpen]);

    // Syntax Guide Content for the Cheat Sheet
    const SYNTAX_DATA = {
        math: [
            { code: '{x^2}', label: 'Superscript', render: 'x²' },
            { code: '{x^(2n+1)}', label: 'Grouped power', render: 'xⁿ⁺¹' },
            { code: '{x_1}', label: 'Subscript', render: 'x₁' },
            { code: '{x_{n+1}}', label: 'Grouped sub', render: 'xₙ₊₁' },
            { code: '{a_1^2}', label: 'Both sub+super', render: 'a₁²' },
            { code: '{frac(a, b)}', label: 'Fraction', render: 'a/b' },
            { code: '{sqrt(x)}', label: 'Square root', render: '√x' },
            { code: '{abs(x)}', label: 'Absolute val', render: '|x|' },
            { code: '{bar(x)}', label: 'Overline', render: 'x̄' },
            { code: '{vec(F)}', label: 'Vector arrow', render: 'F⃗' },
            { code: '{a * b}', label: 'Multiply', render: 'a·b' },
        ],
        greek: [
            { code: '{alpha}', render: 'α' }, { code: '{beta}', render: 'β' },
            { code: '{gamma}', render: 'γ' }, { code: '{delta}', render: 'δ' },
            { code: '{theta}', render: 'θ' }, { code: '{lambda}', render: 'λ' },
            { code: '{mu}', render: 'μ' }, { code: '{pi}', render: 'π' },
            { code: '{phi}', render: 'φ' }, { code: '{omega}', render: 'ω' },
            { code: '{Delta}', render: 'Δ' }, { code: '{Sigma}', render: 'Σ' },
            { code: '{Omega}', render: 'Ω' }, { code: '{Phi}', render: 'Φ' },
        ],
        symbols: [
            { code: '{->}', render: '→' }, { code: '{=>}', render: '⇒' },
            { code: '{<=>}', render: '⇌' }, { code: '{+-}', render: '±' },
            { code: '{!=}', render: '≠' }, { code: '{<=}', render: '≤' },
            { code: '{>=}', render: '≥' }, { code: '{approx}', render: '≈' },
            { code: '{infinity}', render: '∞' }, { code: '{integral}', render: '∫' },
            { code: '{sum}', render: 'Σ' }, { code: '{degree}', render: '°' },
        ]
    };

    const descriptionRef = useRef(null);

    const insertSyntax = (code) => {
        const textarea = descriptionRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData.description;
            const newText = text.substring(0, start) + code + text.substring(end);
            setFormData(prev => ({ ...prev, description: newText }));

            // Restore focus and cursor
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + code.length, start + code.length);
            }, 0);
        }
    };

    // Transaction ID for Null-Potency (Idempotency)
    const [transactionId, setTransactionId] = useState('');

    const prevIsOpenRef = useRef(false);

    // Handle editingNote and form resets
    useEffect(() => {
        // Only trigger reset/init logic if:
        // 1. The modal just opened (transition from false -> true)
        // 2. We are editing a different note than before
        const justOpened = isModalOpen && !prevIsOpenRef.current;
        const noteChanged = editingNote?.id !== undefined && editingNote?.id !== formData?.id; // Basic check, could be more robust

        if (justOpened || noteChanged) {
            // Generate a fresh transaction ID for every new session
            setTransactionId(crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());

            if (editingNote) {
                setFormData({
                    id: editingNote.id,
                    type: editingNote.type || 'concept',
                    subject: editingNote.subject || 'Physics',
                    topic: editingNote.topic || '',
                    // Support both 'title' (Notes) and 'text' (Chapter Entries)
                    title: editingNote.title || editingNote.text || '',
                    description: editingNote.description || '',
                    tags: editingNote.tags || '',
                    priority: editingNote.priority || 'medium',
                    source: editingNote.source || '',
                    chapterName: editingNote.topic || '',
                    images: (editingNote.images || []).map(img =>
                        typeof img === 'string' ? { url: img, name: '' } : img
                    ).length > 0 ? (editingNote.images || []).map(img =>
                        typeof img === 'string' ? { url: img, name: '' } : img
                    ) : [{ url: '', name: '' }],
                    links: editingNote.links || (editingNote.urls || []).map(u => typeof u === 'string' ? u : u.url) || ['']
                });
            } else {
                setFormData({
                    type: 'concept',
                    subject: currentViewContext?.subject || 'Physics',
                    topic: currentViewContext?.topic || '',
                    title: currentViewContext?.topic || '',
                    description: '',
                    tags: '',
                    priority: 'medium',
                    source: '',
                    chapterName: currentViewContext?.topic || '',
                    images: [{ url: '', name: '' }],
                    links: ['']
                });
            }
        }

        // Update the ref for next render
        prevIsOpenRef.current = isModalOpen;
    }, [isModalOpen, editingNote, currentViewContext]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (field, index, value, subField = null) => {
        setFormData(prev => {
            const newArray = [...prev[field]];
            if (field === 'images' && subField) {
                // For images, update the specific subfield (url or name)
                newArray[index] = { ...newArray[index], [subField]: value };
            } else {
                newArray[index] = value;
            }
            return { ...prev, [field]: newArray };
        });
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], field === 'images' ? { url: '', name: '' } : '']
        }));
    };

    const removeArrayItem = async (field, index) => {
        const itemToRemove = formData[field][index];

        // If it's a MEGA link, delete it from storage immediately
        const urlToCheck = field === 'images' ? itemToRemove?.url : itemToRemove;
        if (urlToCheck && typeof urlToCheck === 'string' && urlToCheck.includes('mega.nz')) {
            console.log('[NoteEntryModal] Deleting removed file from MEGA:', urlToCheck);
            await deleteFileByUrl(urlToCheck);
        }

        setFormData(prev => {
            if (prev[field].length <= 1) {
                const newArray = field === 'images' ? [{ url: '', name: '' }] : [''];
                return { ...prev, [field]: newArray };
            }
            return {
                ...prev,
                [field]: prev[field].filter((_, i) => i !== index)
            };
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const result = await uploadFile(file);
        if (result && result.downloadUrl) {
            setFormData(prev => {
                const newImages = [...prev.images];
                // Find first empty image slot
                const emptyIdx = newImages.findIndex(img => !img.url);
                if (emptyIdx !== -1) {
                    newImages[emptyIdx] = { url: result.downloadUrl, name: newImages[emptyIdx].name || '' };
                } else {
                    newImages.push({ url: result.downloadUrl, name: '' });
                }
                return { ...prev, images: newImages };
            });
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double submission
        if (!formData.title || !formData.subject) return;

        setIsSubmitting(true);

        try {
            // Clean up empty entries before saving
            const cleanedData = {
                ...formData,
                transactionId, // Pass the idempotency key
                // If controlled, we might want to map 'title' back to 'text' for Chapter Entries
                ...(isControlled ? { text: formData.title } : {}),
                images: formData.images.filter(img => img?.url && typeof img.url === 'string' && img.url.trim() !== ''),
                links: formData.links.filter(l => l && typeof l === 'string' && l.trim() !== '')
            };

            // Orphan Cleanup
            if (editingNote) {
                const oldImages = (editingNote.images || []).map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
                const oldMedia = [...oldImages, ...(editingNote.links || []), ...(editingNote.urls || [])].filter(url => url?.includes('mega.nz'));
                const newMedia = [...cleanedData.images.map(img => img.url), ...cleanedData.links];

                const orphans = oldMedia.filter(url => !newMedia.includes(url));
                if (orphans.length > 0) {
                    console.log('[NoteEntryModal] Cleaning up orphaned MEGA links:', orphans);
                    for (const url of orphans) {
                        await deleteFileByUrl(url);
                    }
                }
            }

            if (isControlled) {
                await controlledOnSave(editingNote?.id, cleanedData);
            } else {
                if (editingNote?.id) {
                    await updateNote(editingNote.id, cleanedData);
                } else {
                    await addNote(cleanedData);
                }
            }
            toggleModal(false);
        } catch (error) {
            console.error('Failed to save note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isModalOpen) return null;

    const activeType = NOTE_TYPES.find(t => t.value === formData.type) || NOTE_TYPES[0];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => toggleModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-full max-w-2xl transform transition-all duration-300"
                    onClick={e => e.stopPropagation()}
                >
                    <div className={`relative flex flex-col md:flex-row gap-6 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-700/50 p-8`}>
                        <div className="flex-1 max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-${activeType.color}-500/10 text-${activeType.color}-500`}>
                                        <activeType.icon size={20} />
                                    </div>
                                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {editingNote ? 'Refine Learning' : 'Capture Learning'}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Relocated Save Button */}
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 shadow-lg
                                    ${isDarkMode
                                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
                                            }
                                `}
                                    >
                                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        <span>{isSubmitting ? 'Saving...' : 'Save Entry'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                                        className={`
                                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 group border
                                    ${isGuideOpen
                                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-600 dark:text-purple-400 shadow-[0_8px_20px_rgba(168,85,247,0.15)]'
                                                : isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white hover:border-white/30'
                                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                                            }
                                `}
                                    >
                                        <Sparkles size={14} className={`transition-transform duration-500 ${isGuideOpen ? 'rotate-180 text-purple-500 dark:text-purple-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white'}`} />
                                        <span className="font-display font-black text-[10px] uppercase tracking-[0.2em]">{isGuideOpen ? 'Close HUD' : 'Precision HUD'}</span>
                                    </button>

                                    <button
                                        onClick={() => toggleModal(false)}
                                        className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-200/50'}`}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative mt-6">
                                {/* Main Editor Form */}
                                <form onSubmit={handleSave} className="space-y-6 w-full">
                                    {/* Title & Subject Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {activeType.fields?.title?.label || 'Title / Concept Name'}
                                            </label>
                                            <input
                                                required
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder={activeType.fields?.title?.placeholder || 'e.g. Lenz\'s Law'}
                                                className={`
                                            w-full px-4 py-3 rounded-xl border-2 outline-none transition-all caret-emerald-500
                                            ${isDarkMode
                                                        ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white'
                                                        : 'bg-slate-100 border-slate-200 focus:border-emerald-500 text-slate-900 shadow-sm'
                                                    }
                                        `}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                Subject
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className={`
                                            w-full px-4 py-3 rounded-xl border-2 outline-none transition-all appearance-none
                                            ${isDarkMode
                                                        ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white'
                                                        : 'bg-slate-100 border-slate-200 focus:border-emerald-500 text-slate-900 shadow-sm'
                                                    }
                                        `}
                                            >
                                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Chapter Name — only in controlled mode (Chapter Tracker) */}
                                    {isControlled && (
                                        <div>
                                            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                Chapter Name
                                            </label>
                                            <input
                                                name="chapterName"
                                                value={formData.chapterName}
                                                onChange={handleChange}
                                                placeholder="e.g. Kinematics, Organic Chemistry..."
                                                className={`
                                                    w-full px-4 py-3 rounded-xl border-2 outline-none transition-all caret-emerald-500
                                                    ${isDarkMode
                                                        ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white'
                                                        : 'bg-slate-100 border-slate-200 focus:border-emerald-500 text-slate-900 shadow-sm'
                                                    }
                                                `}
                                            />
                                        </div>
                                    )}

                                    {/* Multi-Media Section */}
                                    <div className="space-y-4">
                                        {/* Images */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <label className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        Images
                                                    </label>
                                                    {isUploading && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-purple-500 font-bold animate-pulse">
                                                            <Loader2 size={10} className="animate-spin" />
                                                            Uploading {uploadProgress}%
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={isUploading}
                                                        className="text-[10px] font-bold text-purple-500 hover:text-purple-600 disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <Upload size={10} /> Upload
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => addArrayItem('images')}
                                                        className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                                                    >
                                                        <Plus size={10} /> Add URL
                                                    </button>
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                {/* File Size Warning */}
                                                {fileSizeError && (
                                                    <div className={`
                                                mt-2 p-3 rounded-xl border-2 flex items-start gap-2
                                                ${isDarkMode
                                                            ? 'bg-red-900/20 border-red-500/30 text-red-400'
                                                            : 'bg-red-50 border-red-200 text-red-600'
                                                        }
                                            `}>
                                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold">{fileSizeError}</p>
                                                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-red-400/70' : 'text-red-500/70'}`}>
                                                                Tip: Compress your image or use a smaller file.
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={clearFileSizeError}
                                                            className="p-1 hover:bg-red-500/20 rounded"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {formData.images.map((img, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <input
                                                            value={img.name || ''}
                                                            onChange={(e) => handleArrayChange('images', idx, e.target.value, 'name')}
                                                            placeholder="Name..."
                                                            className={`
                                                        w-24 px-2 py-1.5 text-xs rounded-lg border-2 outline-none transition-all
                                                        ${isDarkMode
                                                                    ? 'bg-slate-800/30 border-slate-700/50 focus:border-amber-500 text-white'
                                                                    : 'bg-slate-100 border-slate-200 focus:border-amber-500 text-slate-900 shadow-sm'
                                                                }
                                                    `}
                                                        />
                                                        <div className="relative flex-1">
                                                            <input
                                                                value={img.url || ''}
                                                                onChange={(e) => handleArrayChange('images', idx, e.target.value, 'url')}
                                                                placeholder="Paste image URL or click 'Upload'..."
                                                                className={`
                                                            w-full px-3 py-1.5 text-xs rounded-lg border-2 outline-none transition-all
                                                            ${isDarkMode
                                                                        ? 'bg-slate-800/30 border-slate-700/50 focus:border-purple-500 text-white'
                                                                        : 'bg-slate-100 border-slate-200 focus:border-purple-500 text-slate-900 shadow-sm'
                                                                    }
                                                        `}
                                                            />
                                                            {img.url && (img.url.startsWith('http') || img.url.startsWith('data:')) && (
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                                    <ImageIcon size={12} className="text-purple-400/50" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem('images', idx)}
                                                            className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Reference Links
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => addArrayItem('links')}
                                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                                >
                                                    <Plus size={10} /> Add Link
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.links.map((link, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                value={link}
                                                                onChange={(e) => handleArrayChange('links', idx, e.target.value)}
                                                                placeholder="Paste web link..."
                                                                className={`
                                                            w-full px-3 py-1.5 text-xs rounded-lg border-2 outline-none transition-all
                                                            ${isDarkMode
                                                                        ? 'bg-slate-800/30 border-slate-700/50 focus:border-blue-500 text-white'
                                                                        : 'bg-slate-100 border-slate-200 focus:border-blue-500 text-slate-900 shadow-sm'
                                                                    }
                                                        `}
                                                            />
                                                            {link && (
                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                                    <LinkIcon size={12} className="text-blue-400/50" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem('links', idx)}
                                                            className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Editor */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className={`block text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {activeType.fields?.description?.label || 'Detailed Notes'}
                                            </label>
                                        </div>

                                        <textarea
                                            ref={descriptionRef}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder={activeType.fields?.description?.placeholder || 'Explain what you learned...'}
                                            rows={8}
                                            className={`
                                        w-full px-4 py-3 rounded-xl border-2 outline-none transition-all font-mono text-sm caret-emerald-500
                                        ${isDarkMode
                                                    ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white'
                                                    : 'bg-slate-100 border-slate-200 focus:border-emerald-500 text-slate-900 shadow-sm'
                                                }
                                    `}
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                💡 <strong>formatting:</strong> Wrap math & chem in <code>{`{ }`}</code> (e.g., <code>{`{H2O}`}</code>).
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setIsGuideOpen(true)}
                                                className="text-[10px] font-bold text-emerald-500 hover:underline"
                                            >
                                                View All Syntax Guide
                                            </button>
                                        </div>

                                        {/* Live Preview */}
                                        {formData.description && (
                                            <div className={`
                                        mt-4 p-4 rounded-xl border-2 transition-all
                                        ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}
                                    `}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`p-1 rounded-md ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        <Sparkles size={12} />
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        Live Preview
                                                    </span>
                                                </div>
                                                <div className={`break-words overflow-hidden ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    <MarkdownRenderer content={formData.description} className="prose-sm" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 pt-6 border-t border-slate-700/30">
                                        {editingNote && (
                                            <button
                                                type="button"
                                                onClick={() => onRequestDelete && onRequestDelete()}
                                                className={`p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => toggleModal(false)}
                                            className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            Dismiss Modal
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Floating Scientific Syntax HUD */}
                            <AnimatePresence>
                                {isGuideOpen && (
                                    <div className="fixed top-24 right-8 z-[100] w-[400px] h-[calc(90vh-100px)] animate-hud-in">
                                        <div className="hud-card h-full flex flex-col p-6 pointer-events-auto">
                                            {/* HUD Reticles */}
                                            <div className="hud-reticle hud-reticle-tl" />
                                            <div className="hud-reticle hud-reticle-tr" />
                                            <div className="hud-reticle hud-reticle-bl" />
                                            <div className="hud-reticle hud-reticle-br" />

                                            <div className="flex items-center justify-between mb-8 group/header">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-3 h-3 rounded-full bg-purple-500/50" />
                                                    <div className="flex flex-col">
                                                        <h3 className="text-[10px] font-display font-black tracking-[0.5em] text-white uppercase leading-none">
                                                            Precision HUD
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em]">Scientific Protocol Active</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setIsGuideOpen(false)}
                                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all transform hover:rotate-90"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-10 relative">
                                                {/* Scientific Initializing Overlay */}
                                                <AnimatePresence>
                                                    {isBooting && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="absolute inset-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                                                        >
                                                            <div className="w-16 h-16 border-2 border-purple-500/20 rounded-full flex items-center justify-center mb-6">
                                                                <div className="w-8 h-8 border-t-2 border-purple-500 rounded-full animate-spin" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="hud-terminal-text text-[10px] uppercase tracking-[0.5em] animate-pulse">Initializing HUD...</h4>
                                                                <div className="flex gap-1 justify-center">
                                                                    {[0.1, 0.3, 0.5, 0.7].map((w, i) => (
                                                                        <div key={i} className="h-1 bg-purple-500/30 rounded" style={{ width: `${w * 20}px` }} />
                                                                    ))}
                                                                </div>
                                                                <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-4">Calibrating Precision Reticles</p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Sections with buttery smooth entry */}
                                                <div className={`transition-all duration-700 delay-150 ${isBooting ? 'opacity-0 translate-y-4 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}>
                                                    {['math', 'greek', 'symbols'].map((section, sectionIdx) => (
                                                        <div key={section} className="mb-10 animate-glitch" style={{ animationDelay: `${sectionIdx * 100}ms` }}>
                                                            <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 px-2">
                                                                <span className="text-white/20 font-mono">0{sectionIdx + 1}</span>
                                                                {section === 'math' ? 'Complex Notions' : section === 'greek' ? 'Classical Greek' : 'Scientific Sets'}
                                                                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                                                            </h4>

                                                            {section === 'math' && (
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {SYNTAX_DATA.math.map((item, i) => (
                                                                        <button
                                                                            key={item.code}
                                                                            onClick={() => insertSyntax(item.code)}
                                                                            style={{ animationDelay: `${(i * 40) + (sectionIdx * 150)}ms` }}
                                                                            className="relative group p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col gap-2 overflow-hidden text-left active:scale-95"
                                                                        >
                                                                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                            <div className="flex items-center justify-between relative z-10">
                                                                                <span className="text-lg font-display font-bold text-white group-hover:text-purple-400 group-hover:scale-110 transition-all duration-500">{item.render}</span>
                                                                                <span className="text-[8px] font-black text-white/20 group-hover:text-purple-400 uppercase tracking-widest">{item.label}</span>
                                                                            </div>
                                                                            <code className="text-[10px] font-mono text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-tight relative z-10">{item.code}</code>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {section === 'greek' && (
                                                                <div className="flex flex-wrap gap-2.5">
                                                                    {SYNTAX_DATA.greek.map((item, i) => (
                                                                        <button
                                                                            key={item.code}
                                                                            onClick={() => insertSyntax(item.code)}
                                                                            style={{ animationDelay: `${(i * 25) + (sectionIdx * 150)}ms` }}
                                                                            className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/5 bg-white/5 hover:bg-emerald-500/10 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] text-xl font-display text-white active:scale-90"
                                                                            title={item.code}
                                                                        >
                                                                            {item.render}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {section === 'symbols' && (
                                                                <div className="grid grid-cols-4 gap-2.5">
                                                                    {SYNTAX_DATA.symbols.map((item, i) => (
                                                                        <button
                                                                            key={item.code}
                                                                            onClick={() => insertSyntax(item.code)}
                                                                            style={{ animationDelay: `${(i * 30) + (sectionIdx * 150)}ms` }}
                                                                            className="aspect-square flex items-center justify-center rounded-xl border border-white/5 bg-white/5 hover:bg-rose-500/10 transition-all duration-300 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] text-2xl font-bold text-white active:scale-90"
                                                                            title={item.code}
                                                                        >
                                                                            {item.render}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-white/10 flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] mt-1.5" />
                                                <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase tracking-wider">
                                                    Click any element to inject precision data at current reticle position.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NoteEntryModal;
