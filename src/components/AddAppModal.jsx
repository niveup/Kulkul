/**
 * Add App Modal Component
 * 
 * A premium modal for adding custom app shortcuts with:
 * - Auto-favicon fetching from website URL
 * - Icon picker fallback
 * - Glassmorphism design matching dashboard aesthetics
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Link2, Type, FileText, Image, Loader2, Check,
    Globe, BookOpen, Calculator, Youtube, Music, Mail,
    MessageSquare, Camera, Folder, Star, Heart, Zap,
    Coffee, Code, Gamepad2, ShoppingBag, Plane, MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';

// Available fallback icons
const FALLBACK_ICONS = [
    { id: 'Globe', icon: Globe, label: 'Globe' },
    { id: 'BookOpen', icon: BookOpen, label: 'Book' },
    { id: 'Calculator', icon: Calculator, label: 'Calculator' },
    { id: 'Youtube', icon: Youtube, label: 'Video' },
    { id: 'Music', icon: Music, label: 'Music' },
    { id: 'Mail', icon: Mail, label: 'Mail' },
    { id: 'MessageSquare', icon: MessageSquare, label: 'Chat' },
    { id: 'Camera', icon: Camera, label: 'Camera' },
    { id: 'Folder', icon: Folder, label: 'Folder' },
    { id: 'Star', icon: Star, label: 'Star' },
    { id: 'Heart', icon: Heart, label: 'Heart' },
    { id: 'Zap', icon: Zap, label: 'Zap' },
    { id: 'Coffee', icon: Coffee, label: 'Coffee' },
    { id: 'Code', icon: Code, label: 'Code' },
    { id: 'Gamepad2', icon: Gamepad2, label: 'Game' },
    { id: 'ShoppingBag', icon: ShoppingBag, label: 'Shop' },
    { id: 'Plane', icon: Plane, label: 'Travel' },
    { id: 'MapPin', icon: MapPin, label: 'Location' },
];

// Get favicon URL from a website domain
const getFaviconUrl = (url) => {
    try {
        const domain = new URL(url).hostname;
        // Using Google's favicon service - fast and reliable
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
        return null;
    }
};

// Validate URL format
const isValidUrl = (string) => {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const AddAppModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [iconType, setIconType] = useState('auto'); // 'auto', 'icon', 'custom'
    const [selectedIcon, setSelectedIcon] = useState('Globe');
    const [customIconUrl, setCustomIconUrl] = useState('');
    const [faviconUrl, setFaviconUrl] = useState(null);
    const [isFetchingFavicon, setIsFetchingFavicon] = useState(false);
    const [faviconError, setFaviconError] = useState(false);

    const isEditMode = Boolean(initialData);

    // Reset form when modal closes OR populate with initial data when editing
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setUrl('');
            setDescription('');
            setIconType('auto');
            setSelectedIcon('Globe');
            setCustomIconUrl('');
            setFaviconUrl(null);
            setFaviconError(false);
        } else if (initialData) {
            // Edit mode: populate fields
            setName(initialData.name || '');
            setUrl(initialData.url || '');
            setDescription(initialData.description || '');
            setSelectedIcon(initialData.icon || 'Globe');
            if (initialData.image) {
                setFaviconUrl(initialData.image);
                setIconType('auto');
            } else {
                setIconType('icon');
            }
        }
    }, [isOpen, initialData]);

    // Auto-fetch favicon when URL changes
    const handleUrlChange = useCallback((newUrl) => {
        setUrl(newUrl);
        setFaviconError(false);

        if (isValidUrl(newUrl)) {
            setIsFetchingFavicon(true);
            const favicon = getFaviconUrl(newUrl);
            setFaviconUrl(favicon);

            // Test if favicon loads
            const img = new window.Image();
            img.onload = () => {
                setIsFetchingFavicon(false);
                setIconType('auto');
            };
            img.onerror = () => {
                setIsFetchingFavicon(false);
                setFaviconError(true);
                setIconType('icon');
            };
            img.src = favicon;
        } else {
            setFaviconUrl(null);
        }
    }, []);

    // Handle save
    const handleSave = useCallback(() => {
        if (!name.trim() || !url.trim()) return;

        const appData = {
            id: initialData?.id || `custom-${Date.now()}`,
            name: name.trim(),
            url: url.trim(),
            description: description.trim() || 'Custom App',
            icon: selectedIcon,
            image: iconType === 'auto' && faviconUrl ? faviconUrl :
                iconType === 'custom' && customIconUrl ? customIconUrl : null,
            isCustom: true,
        };

        onSave(appData, isEditMode);
        onClose();
    }, [name, url, description, iconType, faviconUrl, customIconUrl, selectedIcon, onSave, onClose, initialData, isEditMode]);

    // Get current icon preview
    const getIconPreview = () => {
        if (iconType === 'auto' && faviconUrl && !faviconError) {
            return (
                <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="w-12 h-12 rounded-lg object-contain"
                    onError={() => {
                        setFaviconError(true);
                        setIconType('icon');
                    }}
                />
            );
        }
        if (iconType === 'custom' && customIconUrl) {
            return (
                <img
                    src={customIconUrl}
                    alt="Custom icon"
                    className="w-12 h-12 rounded-lg object-contain"
                />
            );
        }
        const IconComponent = FALLBACK_ICONS.find(i => i.id === selectedIcon)?.icon || Globe;
        return <IconComponent size={32} className="text-slate-400" />;
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={cn(
                            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
                            'w-full max-w-md p-6',
                            'bg-white/95 dark:bg-slate-900/95',
                            'backdrop-blur-xl',
                            'rounded-3xl',
                            'border border-slate-200/50 dark:border-white/10',
                            'shadow-2xl shadow-black/20'
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                {isEditMode ? 'Edit App' : 'Add New App'}
                            </h2>
                            <button
                                onClick={onClose}
                                className={cn(
                                    'p-2 rounded-xl',
                                    'text-slate-400 hover:text-slate-600',
                                    'dark:hover:text-white',
                                    'hover:bg-slate-100 dark:hover:bg-white/10',
                                    'transition-colors'
                                )}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Icon Preview */}
                        <div className="flex justify-center mb-6">
                            <div className={cn(
                                'w-20 h-20 rounded-2xl',
                                'bg-gradient-to-br from-slate-100 to-slate-200',
                                'dark:from-slate-800 dark:to-slate-700',
                                'flex items-center justify-center',
                                'border border-slate-200 dark:border-white/10',
                                'shadow-inner'
                            )}>
                                {isFetchingFavicon ? (
                                    <Loader2 size={24} className="text-indigo-500 animate-spin" />
                                ) : (
                                    getIconPreview()
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    <Type size={14} />
                                    App Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Google Docs"
                                    className={cn(
                                        'w-full px-4 py-3 rounded-xl',
                                        'bg-slate-100 dark:bg-slate-800',
                                        'border border-transparent',
                                        'focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700',
                                        'text-slate-800 dark:text-white',
                                        'placeholder:text-slate-400',
                                        'outline-none transition-all'
                                    )}
                                />
                            </div>

                            {/* URL Input */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    <Link2 size={14} />
                                    Website URL
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                        placeholder="https://example.com"
                                        className={cn(
                                            'w-full px-4 py-3 rounded-xl',
                                            'bg-slate-100 dark:bg-slate-800',
                                            'border border-transparent',
                                            'focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700',
                                            'text-slate-800 dark:text-white',
                                            'placeholder:text-slate-400',
                                            'outline-none transition-all',
                                            'pr-10'
                                        )}
                                    />
                                    {isValidUrl(url) && !isFetchingFavicon && !faviconError && (
                                        <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    )}
                                </div>
                                {faviconError && (
                                    <p className="text-xs text-amber-500 mt-1">
                                        Couldn't fetch icon automatically. Choose one below.
                                    </p>
                                )}
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    <FileText size={14} />
                                    Description (optional)
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g., Document editing"
                                    className={cn(
                                        'w-full px-4 py-3 rounded-xl',
                                        'bg-slate-100 dark:bg-slate-800',
                                        'border border-transparent',
                                        'focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700',
                                        'text-slate-800 dark:text-white',
                                        'placeholder:text-slate-400',
                                        'outline-none transition-all'
                                    )}
                                />
                            </div>

                            {/* Icon Selection (if no auto-favicon) */}
                            {(faviconError || !faviconUrl) && (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                        <Image size={14} />
                                        Choose Icon
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {FALLBACK_ICONS.map(({ id, icon: Icon }) => (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    setSelectedIcon(id);
                                                    setIconType('icon');
                                                }}
                                                className={cn(
                                                    'p-2.5 rounded-xl transition-all',
                                                    selectedIcon === id && iconType === 'icon'
                                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                )}
                                            >
                                                <Icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className={cn(
                                    'flex-1 py-3 px-4 rounded-xl',
                                    'bg-slate-100 dark:bg-slate-800',
                                    'text-slate-600 dark:text-slate-300',
                                    'font-medium',
                                    'hover:bg-slate-200 dark:hover:bg-slate-700',
                                    'transition-colors'
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!name.trim() || !url.trim()}
                                className={cn(
                                    'flex-1 py-3 px-4 rounded-xl',
                                    'bg-gradient-to-r from-indigo-500 to-purple-600',
                                    'text-white font-medium',
                                    'shadow-lg shadow-indigo-500/30',
                                    'hover:shadow-xl hover:shadow-indigo-500/40',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'transition-all'
                                )}
                            >
                                {isEditMode ? 'Save Changes' : 'Add App'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddAppModal;
