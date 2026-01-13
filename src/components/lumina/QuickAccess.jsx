/**
 * QuickAccess Component - Premium Redesign
 * "Billion Dollar App" Standard
 * 
 * Features:
 * - 3D Parallax Tilt Effects
 * - Staggered Framer Motion Animations
 * - Glassmorphic Context Menu (Edit/Delete)
 * - Intelligent Icon Sizing & Fallbacks
 * - Premium Tooltips & Hover States
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import {
    ExternalLink, Youtube, Calculator, Plus, GraduationCap,
    Heart, MoreHorizontal, Edit2, Trash2, Link2, X
} from 'lucide-react';
import { createPortal } from 'react-dom';

// ============================================================================
// CONFIG & UTILS
// ============================================================================

const ICON_MAP = {
    Calculator,
    Youtube,
    GraduationCap,
    ExternalLink,
    Bookopen: GraduationCap, // Fallback for legacy data
};

const getRandomGradient = (id) => {
    const gradients = [
        'from-violet-600 via-purple-600 to-indigo-600',
        'from-blue-600 via-cyan-600 to-teal-600',
        'from-emerald-600 via-green-600 to-teal-600',
        'from-orange-600 via-amber-600 to-yellow-600',
        'from-pink-600 via-rose-600 to-red-600',
        'from-indigo-600 via-blue-600 to-cyan-600',
    ];
    const hash = id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return gradients[hash % gradients.length];
};

const getSafeHostname = (url) => {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
};

// ============================================================================
// CONTEXT MENU COMPONENT
// ============================================================================

const ContextMenu = ({ x, y, onClose, onEdit, onDelete, appTitle }) => {
    // Close on click outside
    useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    // Prevent context menu from going off-screen
    const style = {
        top: y,
        left: Math.min(x, window.innerWidth - 180), // Prevent right overflow
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={style}
            className="fixed z-[9999] min-w-[160px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1.5"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="px-3 py-2 border-b border-white/10 mb-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    {appTitle}
                </span>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onEdit();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
            >
                <Edit2 size={14} className="text-white/40 group-hover:text-indigo-400 transition-colors" />
                Edit Shortcut
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onDelete();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
            >
                <Trash2 size={14} className="text-white/40 group-hover:text-red-400 transition-colors" />
                Remove
            </button>
        </motion.div>,
        document.body
    );
};

// ============================================================================
// 3D TILT CARD COMPONENT
// ============================================================================

// Memoized TiltCard for performance
const TiltCard = React.memo(({ children, onClick, onContextMenu, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]); // Reduced tilt for stability
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            onClick={onClick}
            onContextMenu={onContextMenu}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`will-change-transform ${className}`} // Add will-change
        >
            <div
                style={{
                    transform: "translateZ(20px)",
                    backfaceVisibility: "hidden", // Prevent z-fighting glitch
                    WebkitFontSmoothing: "subpixel-antialiased"
                }}
                className="w-full h-full pointer-events-none"
            >
                {children}
            </div>
        </motion.button>
    );
});

// ============================================================================
// QUICK APP ITEM
// ============================================================================

const QuickApp = React.memo(({ title, name, icon: Icon, color, image, url, id, onEdit, onDelete, setContextMenu }) => {
    const displayTitle = title || name;
    const [faviconError, setFaviconError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const gradient = useMemo(() => color || getRandomGradient(id), [color, id]);
    const hostname = useMemo(() => url ? getSafeHostname(url) : '', [url]);

    const handleClick = useCallback(() => {
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }, [url]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            appId: id,
            appTitle: title,
            onEdit: () => onEdit(),
            onDelete: () => onDelete()
        });
    }, [id, title, onEdit, onDelete, setContextMenu]);

    // Icon Normalization Helper
    const ValidIcon = useMemo(() => {
        // If Icon is already a component (function/object), use it
        if (typeof Icon !== 'string') return Icon || ExternalLink;

        // Try direct lookup
        if (ICON_MAP[Icon]) return ICON_MAP[Icon];

        // Try PascalCase conversion (e.g., 'graduation-cap' -> 'GraduationCap')
        const pascalName = Icon.split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');

        return ICON_MAP[pascalName] || ExternalLink;
    }, [Icon]);

    // Determine what to show
    const showImage = image && !imageError;
    const showFavicon = !showImage && url && !faviconError && (Icon === ExternalLink || !displayTitle);
    const showVectorIcon = !showImage && !showFavicon && ValidIcon && ValidIcon !== ExternalLink;
    const showLetterAvatar = !showImage && !showFavicon && !showVectorIcon;

    return (
        <div
            className="group relative flex flex-col items-center gap-3 isolate" // isolate fixes z-index glitch with Dock
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <TiltCard
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                className="relative w-full aspect-square max-w-[80px] rounded-[24%] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
                <div className={`
                    absolute inset-0 rounded-[24%] overflow-hidden
                    shadow-lg transition-shadow duration-300
                    ${isHovered ? 'shadow-2xl shadow-indigo-500/20 ring-1 ring-white/30' : 'ring-1 ring-white/10'}
                `}>
                    {/* Background Layer - Z-Index 0 */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />

                    {/* Content Layer - Z-Index 10 */}
                    <div className="absolute inset-0 flex items-center justify-center p-[18%] z-10">
                        {showImage && (
                            <img
                                src={image}
                                alt={displayTitle}
                                loading="lazy"
                                className="w-full h-full object-cover rounded-[18%] shadow-sm"
                                onError={() => setImageError(true)}
                            />
                        )}

                        {showFavicon && (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`}
                                alt={displayTitle}
                                loading="lazy"
                                className="w-full h-full object-contain drop-shadow-md"
                                onError={() => setFaviconError(true)}
                            />
                        )}

                        {showVectorIcon && (
                            <ValidIcon size={32} className="text-white drop-shadow-md w-full h-full p-0.5" strokeWidth={1.5} />
                        )}

                        {showLetterAvatar && (
                            <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                                <span className="text-2xl font-bold text-white drop-shadow-md">
                                    {displayTitle?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Gloss Shine - Z-Index 20 */}
                    <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent opacity-60 z-20 pointer-events-none" />
                </div>
            </TiltCard>

            {/* Hover Menu Button (Visible Edit Option) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                appId: id,
                                appTitle: displayTitle,
                                onEdit: () => onEdit(),
                                onDelete: () => onDelete()
                            });
                        }}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-200 z-30 shadow-lg"
                    >
                        <MoreHorizontal size={14} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Label */}
            <span className={`
                text-[11px] font-medium tracking-tight text-center leading-tight
                transition-all duration-300 max-w-[88px] truncate px-1
                ${isHovered ? 'text-white' : 'text-white/60'}
            `}>
                {displayTitle}
            </span>

            {/* Tooltip (Simple floating label for now as 3D card handles most interaction) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 
                                   bg-black/80 backdrop-blur-md border border-white/10 rounded-lg pointer-events-none z-20"
                    >
                        <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                            {displayTitle}
                        </span>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-black/80 border-r border-white/10" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

// ============================================================================
// ADD BUTTON
// ============================================================================

const AddAppButton = ({ onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex flex-col items-center gap-3">
            <motion.button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    relative w-full aspect-square max-w-[80px] rounded-[24%]
                    flex items-center justify-center
                    backdrop-blur-md transition-all duration-300
                    shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]
                    ${isHovered
                        ? 'bg-white/10 border border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.1)]'
                        : 'bg-white/5 border border-white/10'
                    }
                `}
            >
                {/* Inner Glow Pulse */}
                {isHovered && (
                    <motion.div
                        layoutId="glow"
                        className="absolute inset-0 rounded-[24%] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}

                <Plus
                    size={28}
                    className={`relative z-10 transition-transform duration-500 ${isHovered ? 'text-white rotate-90 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40'}`}
                />
            </motion.button>
            <span className={`
                text-[11px] font-medium transition-colors duration-300
                ${isHovered ? 'text-white' : 'text-white/30'}
            `}>
                Add App
            </span>
        </div>
    );
};

const SpotlightGrid = ({ children, className }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`relative group ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.1),
              transparent 80%
            )
          `,
                }}
            />
            {children}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const QuickAccess = ({ apps = [], onAddApp, onEditApp, onDeleteApp }) => {
    const [contextMenu, setContextMenu] = useState(null);

    const defaultApps = [
        { id: 'physics', title: 'Physics', icon: GraduationCap, color: 'from-blue-600 to-indigo-600' },
        { id: 'updates', title: 'Updates', icon: ExternalLink, color: 'from-violet-600 to-purple-600' },
        { id: 'calculator', title: 'Calculator', icon: Calculator, color: 'from-slate-600 to-slate-500' },
        { id: 'youtube', title: 'YouTube', icon: Youtube, color: 'from-red-600 to-rose-600' },
    ];

    const displayApps = apps.length > 0 ? apps : defaultApps;

    return (
        <div className="mt-8 relative z-0 isolate"> {/* z-0 and isolate to prevent bleeding into Dock */}
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-white/10 shadow-[inner_0_0_10px_rgba(244,63,94,0.2)]">
                        <Heart size={16} className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            Quick Access
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white/60 bg-white/10 border border-white/5 rounded-full tracking-wide">
                                {displayApps.length} APPS
                            </span>
                        </h2>
                        <p className="text-xs text-white/40 font-medium tracking-wide">Your favorite workspace tools</p>
                    </div>
                </div>
            </div>

            {/* Spotlight Grid */}
            <SpotlightGrid className="rounded-3xl border border-white/5 bg-black/20 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {displayApps.map((app, index) => (
                            <motion.div
                                key={app.id || index}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    delay: index * 0.05
                                }}
                                className="relative z-10"
                            >
                                <QuickApp
                                    {...app}
                                    icon={app.icon} // Pass raw icon to let QuickApp handle normalization
                                    onEdit={() => onEditApp?.(app)}
                                    onDelete={() => onDeleteApp?.(app)}
                                    setContextMenu={setContextMenu}
                                />
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: displayApps.length * 0.05 }}
                            className="relative z-10"
                        >
                            <AddAppButton onClick={onAddApp} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </SpotlightGrid>

            {/* Context Menu Portal */}
            <AnimatePresence>
                {contextMenu && (
                    <ContextMenu
                        {...contextMenu}
                        onClose={() => setContextMenu(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuickAccess;
