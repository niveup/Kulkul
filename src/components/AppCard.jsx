/**
 * Premium App Card Component - "Billion Dollar" Edition
 * 
 * Features:
 * - 3D Perspective Tilt on mouse move
 * - Glare/Reflection effect
 * - Spring physics animations
 * - Gradient border glow
 * - Staggered entry animation
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    ExternalLink,
    Star,
    BookOpen,
    Globe,
    Calculator,
    Youtube,
    Pencil,
    Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { springs, staggerItemVariants } from '../lib/motion';

// Icon mapping
const ICON_MAP = {
    BookOpen,
    Globe,
    Calculator,
    Youtube,
};

// Color themes for cards (Aether Palette)
const CARD_THEMES = [
    {
        gradient: 'from-cyan-500 to-teal-600',
        shadow: 'shadow-cyan-500/20',
        iconBg: 'from-cyan-500/20 to-teal-500/20',
        glowColor: 'rgba(6, 182, 212, 0.4)',
    },
    {
        gradient: 'from-emerald-500 to-green-600',
        shadow: 'shadow-emerald-500/20',
        iconBg: 'from-emerald-500/20 to-green-500/20',
        glowColor: 'rgba(16, 185, 129, 0.4)',
    },
    {
        gradient: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/20',
        iconBg: 'from-amber-500/20 to-orange-500/20',
        glowColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
        gradient: 'from-rose-500 to-pink-600',
        shadow: 'shadow-rose-500/20',
        iconBg: 'from-rose-500/20 to-pink-500/20',
        glowColor: 'rgba(244, 63, 94, 0.4)',
    },
    {
        gradient: 'from-sky-500 to-blue-600',
        shadow: 'shadow-sky-500/20',
        iconBg: 'from-sky-500/20 to-blue-500/20',
        glowColor: 'rgba(14, 165, 233, 0.4)',
    },
];

const AppCard = React.memo(({ app, index = 0, onEdit, onDelete }) => {
    const theme = CARD_THEMES[index % CARD_THEMES.length];
    const Icon = ICON_MAP[app.icon] || BookOpen;
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // 3D Tilt Motion Values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const scale = useMotionValue(1);

    // Glare Effect
    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);
    const glareOpacity = useMotionValue(0);

    // Spring-smoothed values for buttery feel
    const springRotateX = useSpring(rotateX, springs.snappy);
    const springRotateY = useSpring(rotateY, springs.snappy);
    const springScale = useSpring(scale, springs.smooth);
    const springGlareX = useSpring(glareX, springs.snappy);
    const springGlareY = useSpring(glareY, springs.snappy);
    const springGlareOpacity = useSpring(glareOpacity, springs.smooth);

    // Create dynamic glare gradient
    const glareBackground = useTransform(
        [springGlareX, springGlareY],
        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.25), transparent 50%)`
    );

    const handleMouseMove = useCallback((e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Mouse position relative to center (-1 to 1)
        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (e.clientY - centerY) / (rect.height / 2);

        // Apply tilt (inverted for natural feel)
        rotateX.set(-mouseY * 12); // Max 12 degrees
        rotateY.set(mouseX * 12);
        scale.set(1.03);

        // Move glare opposite to mouse
        glareX.set(50 + mouseX * 25);
        glareY.set(50 + mouseY * 25);
        glareOpacity.set(1);
    }, [rotateX, rotateY, scale, glareX, glareY, glareOpacity]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        rotateX.set(0);
        rotateY.set(0);
        scale.set(1);
        glareOpacity.set(0);
    }, [rotateX, rotateY, scale, glareOpacity]);

    const handleClick = () => {
        if (app.url) {
            window.open(app.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <motion.div
            ref={cardRef}
            variants={staggerItemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="group relative perspective-1000"
            style={{
                perspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Animated gradient border/glow */}
            <motion.div
                className={cn(
                    'absolute -inset-0.5 rounded-[28px]',
                    'bg-gradient-to-r',
                    theme.gradient,
                    'blur-sm transition-all duration-300',
                    theme.shadow
                )}
                animate={{
                    opacity: isHovered ? 0.8 : 0,
                    scale: isHovered ? 1 : 0.95,
                }}
                transition={springs.smooth}
            />

            {/* Card Container with 3D Transform */}
            <motion.div
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                className={cn(
                    'relative w-full cursor-pointer',
                    'flex flex-col items-center p-6',
                    'bg-white/90 dark:bg-slate-900/90',
                    'backdrop-blur-xl',
                    'rounded-3xl',
                    'border border-slate-200/50 dark:border-white/5',
                    'shadow-lg shadow-slate-200/50 dark:shadow-none',
                    'transition-colors duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                )}
                style={{
                    rotateX: springRotateX,
                    rotateY: springRotateY,
                    scale: springScale,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Glare Overlay */}
                <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
                    style={{
                        background: glareBackground,
                        opacity: springGlareOpacity,
                    }}
                />

                {/* Favorite indicator */}
                <motion.div
                    className="absolute top-3 right-3 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        scale: isHovered ? 1 : 0.8,
                    }}
                    transition={springs.snappy}
                >
                    {/* Edit button - only for custom apps */}
                    {app.isCustom && onEdit && (
                        <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(app);
                            }}
                            title="Edit App"
                        >
                            <Pencil size={14} />
                        </button>
                    )}
                    {/* Delete button - only for custom apps */}
                    {app.isCustom && onDelete && (
                        <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(app);
                            }}
                            title="Delete App"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    {/* Favorite button */}
                    <button
                        className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Toggle favorite
                        }}
                    >
                        <Star size={16} />
                    </button>
                </motion.div>

                {/* Icon Container */}
                <motion.div
                    className={cn(
                        'relative w-20 h-20 mb-5',
                        'rounded-2xl overflow-hidden',
                        'flex items-center justify-center',
                        'bg-gradient-to-br',
                        theme.iconBg,
                        'dark:bg-gradient-to-br dark:from-white/5 dark:to-white/10'
                    )}
                    style={{ transform: 'translateZ(30px)' }}
                    animate={{
                        rotate: isHovered ? [0, -5, 5, 0] : 0,
                        scale: isHovered ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                >
                    {/* App image or icon */}
                    {app.image ? (
                        <img
                            src={app.image}
                            alt={app.name}
                            className="w-12 h-12 object-contain"
                            loading="lazy"
                        />
                    ) : (
                        <Icon
                            size={32}
                            className={cn(
                                'text-slate-600 dark:text-slate-300',
                                'transition-all duration-300'
                            )}
                        />
                    )}

                    {/* Shine effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>

                {/* App Name */}
                <h3
                    className={cn(
                        'font-bold text-lg text-slate-900 dark:text-white',
                        'mb-1.5 tracking-tight',
                        'transition-colors duration-300'
                    )}
                    style={{ transform: 'translateZ(20px)' }}
                >
                    {app.name}
                </h3>

                {/* Description */}
                <p
                    className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed"
                    style={{ transform: 'translateZ(10px)' }}
                >
                    {app.description}
                </p>

                {/* Open Link Indicator */}
                <motion.div
                    className={cn(
                        'absolute bottom-4 right-4',
                        'w-8 h-8 rounded-full',
                        'flex items-center justify-center',
                        'bg-slate-100 dark:bg-white/5',
                        'text-slate-400 dark:text-slate-500'
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        scale: isHovered ? 1 : 0.8,
                        x: isHovered ? 0 : 10,
                    }}
                    transition={springs.snappy}
                    whileHover={{
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: '#6366f1',
                    }}
                >
                    <ExternalLink size={14} />
                </motion.div>
            </motion.div>
        </motion.div>
    );
});

// Add New App Card
const AddAppCard = React.memo(({ onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                'relative w-full',
                'flex flex-col items-center justify-center',
                'min-h-[200px] p-6',
                'rounded-3xl',
                'border-2 border-dashed border-slate-300/50 dark:border-white/10',
                'bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50',
                'transition-all duration-300',
                'hover:border-indigo-400 dark:hover:border-indigo-500/50',
                'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                'group'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
        >
            {/* Icon */}
            <motion.div
                className={cn(
                    'w-16 h-16 rounded-2xl',
                    'bg-slate-200/50 dark:bg-white/5',
                    'flex items-center justify-center',
                    'mb-4',
                    'transition-all duration-300',
                    'group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30',
                    'group-hover:scale-110'
                )}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
            >
                <span className={cn(
                    'text-3xl',
                    'text-slate-400 dark:text-white/20',
                    'group-hover:text-indigo-500 dark:group-hover:text-indigo-400',
                    'transition-colors duration-300'
                )}>
                    +
                </span>
            </motion.div>

            {/* Text */}
            <span className={cn(
                'font-semibold',
                'text-slate-400 dark:text-white/30',
                'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                'transition-colors duration-300'
            )}>
                Add New App
            </span>
        </motion.button>
    );
});

export { AddAppCard };

export default AppCard;
