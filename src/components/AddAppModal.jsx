/**
 * Add App Modal - Premium Redesign
 * 
 * High-fidelity glassmorphism modal for adding custom apps
 * Features:
 * - Spring animations for entry/exit
 * - Premium glass visuals with noise texture
 * - Smart inputs with glow effects
 * - Segmented control for icon selection
 * - Auto-favicon fetching with visual feedback
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Link2, Type, FileText, Loader2, Check,
    Globe, BookOpen, Calculator, Youtube, Music, Mail,
    MessageSquare, Camera, Folder, Star, Heart, Zap,
    Coffee, Code, Gamepad2, ShoppingBag, Plane, MapPin,
    Sparkles, Wand2, Terminal, Database, Cloud, Server,
    Cpu, Laptop, Monitor, Smartphone, Tablet, Watch,
    Headphones, Speaker, Mic, Video, Image, PenTool,
    Palette, Brush, Scissors, Ruler, Sigma, Atom,
    FlaskConical, Microscope, Dna, Brain, Stethoscope,
    Pill, Syringe, TreePine, Leaf, Flower2, Sun,
    Moon, CloudRain, Umbrella, Snowflake, Flame,
    Droplets, Wind, ListTodo, Calendar, Clock,
    Timer, AlarmClock, Bell, Tag, Bookmark, Flag
} from 'lucide-react';
import { cn } from '../lib/utils';

// =============================================================================
// Curated Icon Library
// =============================================================================

const ICON_CATEGORIES = [
    {
        name: 'Essentials',
        icons: [
            { id: 'Globe', icon: Globe },
            { id: 'Search', icon: BookOpen }, /* Mapped to BookOpen for now as Search isn't imported, user intent usually Browser/Search */
            { id: 'Mail', icon: Mail },
            { id: 'Chat', icon: MessageSquare },
            { id: 'Folder', icon: Folder },
            { id: 'Calendar', icon: Calendar },
        ]
    },
    {
        name: 'Productivity',
        icons: [
            { id: 'List', icon: ListTodo },
            { id: 'Clock', icon: Clock },
            { id: 'Timer', icon: Timer },
            { id: 'Bell', icon: Bell },
            { id: 'Tag', icon: Tag },
            { id: 'Flag', icon: Flag },
        ]
    },
    {
        name: 'Math & Science',
        icons: [
            { id: 'Calculator', icon: Calculator },
            { id: 'Sigma', icon: Sigma },
            { id: 'Ruler', icon: Ruler },
            { id: 'Lab', icon: FlaskConical },
            { id: 'Atom', icon: Atom },
            { id: 'DNA', icon: Dna },
            { id: 'Brain', icon: Brain },
            { id: 'Microscope', icon: Microscope },
        ]
    },
    {
        name: 'Developer',
        icons: [
            { id: 'Terminal', icon: Terminal },
            { id: 'Code', icon: Code },
            { id: 'Database', icon: Database },
            { id: 'Cloud', icon: Cloud },
            { id: 'Server', icon: Server },
            { id: 'Chip', icon: Cpu },
            { id: 'Laptop', icon: Laptop },
        ]
    },
    {
        name: 'Creative',
        icons: [
            { id: 'Palette', icon: Palette },
            { id: 'Pen', icon: PenTool },
            { id: 'Brush', icon: Brush },
            { id: 'Image', icon: Image },
            { id: 'Video', icon: Video },
            { id: 'Music', icon: Music },
            { id: 'Camera', icon: Camera },
        ]
    },
    {
        name: 'Lifestyle',
        icons: [
            { id: 'Coffee', icon: Coffee },
            { id: 'Shop', icon: ShoppingBag },
            { id: 'Game', icon: Gamepad2 },
            { id: 'Travel', icon: Plane },
            { id: 'Map', icon: MapPin },
            { id: 'Health', icon: Heart },
            { id: 'Energy', icon: Zap },
            { id: 'Star', icon: Star },
        ]
    }
];

// Helper to flatten lookup
const ALL_ICONS = ICON_CATEGORIES.reduce((acc, cat) => {
    cat.icons.forEach(i => acc[i.id] = i.icon);
    return acc;
}, {});

// =============================================================================
// Helper Functions
// =============================================================================

const getFaviconUrl = (url) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
        return null;
    }
};

const isValidUrl = (string) => {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

// =============================================================================
// Main Component
// =============================================================================

const AddAppModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [iconMode, setIconMode] = useState('auto'); // 'auto' | 'custom'
    const [selectedIcon, setSelectedIcon] = useState('Globe');
    const [faviconUrl, setFaviconUrl] = useState(null);
    const [isFetchingFavicon, setIsFetchingFavicon] = useState(false);
    const [faviconError, setFaviconError] = useState(false);

    const isEditMode = Boolean(initialData);

    // Reset/Populate form
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setUrl('');
            setDescription('');
            setIconMode('auto');
            setSelectedIcon('Globe');
            setFaviconUrl(null);
            setFaviconError(false);
        } else if (initialData) {
            setName(initialData.name || '');
            setUrl(initialData.url || '');
            setDescription(initialData.description || '');
            setSelectedIcon(initialData.icon || 'Globe');
            if (initialData.image) {
                setFaviconUrl(initialData.image);
                setIconMode('auto');
            } else {
                setIconMode('custom');
            }
        }
    }, [isOpen, initialData]);

    // Format URL and fetch favicon
    const handleUrlChange = useCallback((val) => {
        setUrl(val);
        setFaviconError(false);

        if (isValidUrl(val)) {
            setIsFetchingFavicon(true);
            const favicon = getFaviconUrl(val);
            setFaviconUrl(favicon);

            const img = new window.Image();
            img.onload = () => {
                setIsFetchingFavicon(false);
                if (iconMode === 'auto') setFaviconError(false);
            };
            img.onerror = () => {
                setIsFetchingFavicon(false);
                setFaviconError(true);
            };
            img.src = favicon;
        } else {
            setFaviconUrl(null);
        }
    }, [iconMode]);

    const handleSave = useCallback(() => {
        if (!name.trim()) return;

        const appData = {
            id: initialData?.id || `custom-${Date.now()}`,
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
            icon: selectedIcon,
            image: iconMode === 'auto' && faviconUrl && !faviconError ? faviconUrl : null,
            isCustom: true,
        };

        onSave(appData, isEditMode);
        onClose();
    }, [name, url, description, iconMode, faviconUrl, faviconError, selectedIcon, onSave, onClose, initialData, isEditMode]);

    // Live Icon Preview
    const IconPreview = () => {
        if (iconMode === 'auto') {
            if (isFetchingFavicon) {
                return (
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                        <Loader2 size={24} className="text-white/50 animate-spin" />
                    </div>
                );
            }
            if (faviconUrl && !faviconError) {
                return (
                    <div className="relative group">
                        <img
                            src={faviconUrl}
                            alt="Preview"
                            className="w-20 h-20 rounded-2xl object-cover shadow-2xl border border-white/10 bg-white"
                        />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                    </div>
                );
            }
            // Fallback
            return (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <Globe size={32} className="text-white/50" />
                </div>
            );
        }

        // Custom mode
        const SelectedIcon = ALL_ICONS[selectedIcon] || Globe;
        return (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center border border-white/20">
                <SelectedIcon size={32} className="text-white drop-shadow" />
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="pointer-events-auto w-full max-w-2xl relative overflow-hidden" // Widened to max-w-2xl
                        >
                            {/* Glass Background */}
                            <div className="absolute inset-0 bg-[#0F172A] rounded-3xl border border-white/10 shadow-2xl" />
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl pointer-events-none" />

                            {/* Content */}
                            <div className="relative p-6 md:p-8 max-h-[85vh] overflow-y-auto scrollbar-thin">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">
                                            {isEditMode ? 'Edit App' : 'Add App'}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            Configure app details and appearance.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Left Column: Preview & Switcher */}
                                    <div className="flex flex-col items-center gap-5 flex-shrink-0">
                                        <IconPreview />

                                        {/* Mode Switcher */}
                                        <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex w-full shadow-inner">
                                            <button
                                                onClick={() => setIconMode('auto')}
                                                className={cn(
                                                    "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2",
                                                    iconMode === 'auto'
                                                        ? "bg-white/10 text-white shadow-sm"
                                                        : "text-slate-400 hover:text-white"
                                                )}
                                            >
                                                <Wand2 size={12} />
                                                Auto
                                            </button>
                                            <button
                                                onClick={() => setIconMode('custom')}
                                                className={cn(
                                                    "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2",
                                                    iconMode === 'custom'
                                                        ? "bg-white/10 text-white shadow-sm"
                                                        : "text-slate-400 hover:text-white"
                                                )}
                                            >
                                                <GridIcon />
                                                Lib
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Column: Inputs & Gallery */}
                                    <div className="flex-1 space-y-5 min-w-0">

                                        {/* Input Fields */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-500 ml-1">NAME</label>
                                                <div className="relative group">
                                                    <Type className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="App Name"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium text-sm"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-500 ml-1">URL</label>
                                                <div className="relative group">
                                                    <Link2 className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={url}
                                                        onChange={(e) => handleUrlChange(e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Icon Gallery (Scrollable) */}
                                        <AnimatePresence>
                                            {iconMode === 'custom' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-4 pt-2"
                                                >
                                                    <div className="h-[240px] overflow-y-auto pr-2 scrollbar-thin space-y-6">
                                                        {ICON_CATEGORIES.map((category) => (
                                                            <div key={category.name}>
                                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 sticky top-0 bg-[#0F172A] z-10 py-1">
                                                                    {category.name}
                                                                </h4>
                                                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                                                    {category.icons.map(({ id, icon: Icon }) => (
                                                                        <button
                                                                            key={id}
                                                                            onClick={() => setSelectedIcon(id)}
                                                                            title={id}
                                                                            className={cn(
                                                                                "aspect-square rounded-xl flex items-center justify-center transition-all",
                                                                                selectedIcon === id
                                                                                    ? "bg-indigo-600 text-white shadow-md scale-105"
                                                                                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                                                            )}
                                                                        >
                                                                            <Icon size={18} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Footer */}
                                        <div className="pt-2 flex gap-3">
                                            <button
                                                onClick={onClose}
                                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={!name.trim() || (!url.trim() && iconMode === 'auto')}
                                                className={cn(
                                                    "flex-[2] py-3 rounded-xl font-medium text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm",
                                                    !name.trim()
                                                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                                                        : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.98]"
                                                )}
                                            >
                                                <Sparkles size={16} />
                                                {isEditMode ? 'Save Changes' : 'Add App'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

// Helper component for segmentation icon
const GridIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
);

export default AddAppModal;

