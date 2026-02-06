import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Save, Trash2, Calendar, Clock, BookOpen, Hash, Link as LinkIcon, Image as ImageIcon, Upload, Loader2, Calculator, BrainCircuit, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';
import { useNotesStore, useNoteActions } from '../../store/notesStore';
import { useVault } from '../../hooks/useVault'; // Keep for legacy deletion
import { useNotesStorage } from '../../hooks/useNotesStorage'; // New storage engine

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

const NoteEntryModal = ({ isDarkMode }) => {
    const { isModalOpen, editingNote, currentViewContext } = useNotesStore();
    const { addNote, updateNote, toggleModal } = useNoteActions();

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
        images: [{ url: '', name: '' }],
        links: ['']
    });

    // Handle editingNote and form resets
    useEffect(() => {
        if (isModalOpen) {
            if (editingNote) {
                setFormData({
                    type: editingNote.type || 'concept',
                    subject: editingNote.subject || 'Physics',
                    topic: editingNote.topic || '',
                    title: editingNote.title || '',
                    description: editingNote.description || '',
                    tags: editingNote.tags || '',
                    priority: editingNote.priority || 'medium',
                    source: editingNote.source || '',
                    images: (editingNote.images || []).map(img =>
                        typeof img === 'string' ? { url: img, name: '' } : img
                    ).length > 0 ? (editingNote.images || []).map(img =>
                        typeof img === 'string' ? { url: img, name: '' } : img
                    ) : [{ url: '', name: '' }],
                    links: editingNote.links || ['']
                });
            } else {
                setFormData({
                    type: 'concept',
                    subject: currentViewContext?.subject || 'Physics',
                    topic: currentViewContext?.topic || '',
                    title: '',
                    description: '',
                    tags: '',
                    priority: 'medium',
                    source: '',
                    images: [{ url: '', name: '' }],
                    links: ['']
                });
            }
        }
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

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.subject) return;

        // Clean up empty entries before saving
        const cleanedData = {
            ...formData,
            images: formData.images.filter(img => img?.url && typeof img.url === 'string' && img.url.trim() !== ''),
            links: formData.links.filter(l => l && typeof l === 'string' && l.trim() !== '')
        };

        // Orphan Cleanup: If editing, find MEGA links that were removed and delete them
        if (editingNote) {
            const oldImages = (editingNote.images || []).map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
            const oldMedia = [...oldImages, ...(editingNote.links || [])].filter(url => url?.includes('mega.nz'));
            const newMedia = [...cleanedData.images.map(img => img.url), ...cleanedData.links];

            const orphans = oldMedia.filter(url => !newMedia.includes(url));
            if (orphans.length > 0) {
                console.log('[NoteEntryModal] Cleaning up orphaned MEGA links:', orphans);
                for (const url of orphans) {
                    await deleteFileByUrl(url);
                }
            }
        }

        if (editingNote?.id) {
            console.log('[NoteEntryModal] Calling updateNote for id:', editingNote.id);
            await updateNote(editingNote.id, cleanedData);
        } else {
            console.log('[NoteEntryModal] Calling addNote');
            await addNote(cleanedData);
        }
        toggleModal(false);
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
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className={`
                        relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
                        rounded-3xl shadow-2xl p-8 border
                        ${isDarkMode ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'}
                    `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-${activeType.color}-500/10 text-${activeType.color}-500`}>
                                <activeType.icon size={20} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Capture Learning
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleModal(false)}
                            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
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
                                        w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isDarkMode
                                            ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white'
                                            : 'bg-white border-slate-100 focus:border-emerald-500 text-slate-900'
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
                                            : 'bg-white border-slate-100 focus:border-emerald-500 text-slate-900'
                                        }
                                    `}
                                >
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

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
                                            {/* Image Name Input */}
                                            <input
                                                value={img.name || ''}
                                                onChange={(e) => handleArrayChange('images', idx, e.target.value, 'name')}
                                                placeholder="Name..."
                                                className={`
                                                    w-24 px-2 py-1.5 text-xs rounded-lg border-2 outline-none transition-all
                                                    ${isDarkMode
                                                        ? 'bg-slate-800/30 border-slate-700/50 focus:border-amber-500 text-white'
                                                        : 'bg-slate-50 border-slate-100 focus:border-amber-500 text-slate-900'
                                                    }
                                                `}
                                            />
                                            {/* Image URL Input */}
                                            <div className="relative flex-1">
                                                <input
                                                    value={img.url || ''}
                                                    onChange={(e) => handleArrayChange('images', idx, e.target.value, 'url')}
                                                    placeholder="Paste image URL or click 'Upload'..."
                                                    className={`
                                                        w-full px-3 py-1.5 text-xs rounded-lg border-2 outline-none transition-all
                                                        ${isDarkMode
                                                            ? 'bg-slate-800/30 border-slate-700/50 focus:border-purple-500 text-white'
                                                            : 'bg-slate-50 border-slate-100 focus:border-purple-500 text-slate-900'
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
                                                            : 'bg-slate-50 border-slate-100 focus:border-blue-500 text-slate-900'
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

                        {/* Description */}
                        <div>
                            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {activeType.fields?.description?.label || 'Detailed Notes'}
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder={activeType.fields?.description?.placeholder || 'Explain what you learned...'}
                                rows={8}
                                className={`
                                    w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                    ${isDarkMode
                                        ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white'
                                        : 'bg-white border-slate-100 focus:border-emerald-500 text-slate-900'
                                    }
                                `}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => toggleModal(false)}
                                className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20`}
                            >
                                <Save size={20} />
                                Save Learning
                                <Sparkles size={16} />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NoteEntryModal;
