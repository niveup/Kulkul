/**
 * Liquid Dock Component - Project Aether
 * 
 * A macOS-style floating dock with magnification physics.
 * Features:
 * - Gaussian curve magnification on hover
 * - Spring physics for smooth transitions
 * - Active indicator dot
 * - Bounce animation on click
 * - Collapsible to draggable corner circle
 * - Drag to any corner snapping
 */

import React, { useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
    Command,
    X,
    LayoutGrid,
} from 'lucide-react';
import CustomIcon from '../ui/CustomIcon';
import { cn } from '../../lib/utils';
import { springs } from '../../lib/motion';

// Dock items configuration
const DOCK_ITEMS = [
    { id: 'overview', customIcon: 'dashboard', label: 'Overview' },
    { id: 'study-tools', customIcon: 'clock', label: 'Study Tools' },
    { id: 'progress', customIcon: 'analytics', label: 'Progress' },
    { id: 'resources', customIcon: 'study', label: 'Resources' },
    { id: 'ai-assistant', customIcon: 'ai', label: 'AI Assistant' },
];

// Corner positions for snapping
const CORNERS = {
    'bottom-center': { x: '50%', y: 'calc(100% - 80px)', translateX: '-50%', translateY: '0' },
    'bottom-left': { x: '24px', y: 'calc(100% - 80px)', translateX: '0', translateY: '0' },
    'bottom-right': { x: 'calc(100% - 80px)', y: 'calc(100% - 80px)', translateX: '0', translateY: '0' },
    'top-left': { x: '24px', y: '80px', translateX: '0', translateY: '0' },
    'top-right': { x: 'calc(100% - 80px)', y: '80px', translateX: '0', translateY: '0' },
};

// Get pixel position for a corner
const getCornerPixels = (corner) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    switch (corner) {
        case 'bottom-center': return { x: vw / 2 - 28, y: vh - 80 };
        case 'bottom-left': return { x: 24, y: vh - 80 };
        case 'bottom-right': return { x: vw - 80, y: vh - 80 };
        case 'top-left': return { x: 24, y: 80 };
        case 'top-right': return { x: vw - 80, y: 80 };
        default: return { x: vw / 2 - 28, y: vh - 80 };
    }
};

// Find nearest corner to a position
const findNearestCorner = (x, y) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Define corner positions in pixels
    const corners = [
        { key: 'bottom-center', x: vw / 2, y: vh - 50 },
        { key: 'bottom-left', x: 50, y: vh - 50 },
        { key: 'bottom-right', x: vw - 50, y: vh - 50 },
        { key: 'top-left', x: 50, y: 100 },
        { key: 'top-right', x: vw - 50, y: 100 },
    ];

    let nearest = corners[0];
    let minDist = Infinity;

    corners.forEach(corner => {
        const dist = Math.sqrt(Math.pow(x - corner.x, 2) + Math.pow(y - corner.y, 2));
        if (dist < minDist) {
            minDist = dist;
            nearest = corner;
        }
    });

    return nearest.key;
};

// Physics constants
const BASE_SIZE = 48;
const MAX_SIZE = 72;
const MAGNIFICATION_DISTANCE = 150;

// Gaussian function for smooth magnification falloff
const gaussian = (x, sigma = 50) => {
    return Math.exp(-(x * x) / (2 * sigma * sigma));
};

const DockItem = ({
    item,
    isActive,
    mouseX,
    index,
    onSelect,
    containerRef,
}) => {
    const ref = useRef(null);
    const Icon = item.icon;

    // Calculate distance from mouse to this item's center
    const distance = useTransform(mouseX, (mx) => {
        if (!ref.current || !containerRef.current || mx === null) return Infinity;

        const itemRect = ref.current.getBoundingClientRect();
        const itemCenterX = itemRect.left + itemRect.width / 2;
        return Math.abs(mx - itemCenterX);
    });

    // Apply Gaussian magnification based on distance
    const size = useTransform(distance, (d) => {
        if (d === Infinity) return BASE_SIZE;
        const scale = gaussian(d, MAGNIFICATION_DISTANCE / 2);
        return BASE_SIZE + (MAX_SIZE - BASE_SIZE) * scale;
    });

    // Spring for smooth transitions
    const springSize = useSpring(size, {
        stiffness: 400,
        damping: 25,
        mass: 0.5,
    });

    // Handle click with bounce animation
    const handleClick = useCallback(() => {
        onSelect(item.id);
    }, [item.id, onSelect]);

    return (
        <motion.button
            ref={ref}
            onClick={handleClick}
            className={cn(
                'relative flex items-center justify-center',
                'rounded-xl transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
                // Only show background for non-custom icons
                !item.customIcon && (isActive
                    ? 'bg-white/15 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'),
                // Custom icons get transparent background
                item.customIcon && 'bg-transparent'
            )}
            style={{
                width: springSize,
                height: springSize,
            }}
            whileTap={{
                scale: 0.9,
                y: -8,
            }}
            transition={springs.snappy}
        >
            {/* Icon */}
            <motion.div
                style={{
                    // Custom icons fill the entire button, regular icons stay at 50%
                    width: item.customIcon ? springSize : useTransform(springSize, s => s * 0.5),
                    height: item.customIcon ? springSize : useTransform(springSize, s => s * 0.5),
                }}
                className="flex items-center justify-center"
            >
                {item.customIcon ? (
                    <CustomIcon
                        name={item.customIcon}
                        size={72}
                        className="w-full h-full object-cover rounded-xl"
                    />
                ) : (
                    <Icon className="w-full h-full" />
                )}
            </motion.div>

            {/* Active indicator dot */}
            {isActive && (
                <motion.div
                    layoutId="dockActiveIndicator"
                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-cyan-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springs.bouncy}
                />
            )}

            {/* Tooltip */}
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                whileHover={{ opacity: 1, y: -8, scale: 1 }}
                className={cn(
                    'absolute -top-10 px-2.5 py-1.5 rounded-lg',
                    'bg-slate-900/90 text-white text-xs font-medium',
                    'backdrop-blur-md border border-white/10',
                    'pointer-events-none whitespace-nowrap'
                )}
            >
                {item.label}
            </motion.div>
        </motion.button>
    );
};

const Dock = ({
    activeTab,
    onTabChange,
    onOpenCommandPalette,
    className,
}) => {
    const containerRef = useRef(null);
    const mouseX = useMotionValue(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [currentCorner, setCurrentCorner] = useState('bottom-center');
    const [isDragging, setIsDragging] = useState(false);

    // Position for the collapsed circle
    const circleX = useMotionValue(0);
    const circleY = useMotionValue(0);

    // Handle mouse movement over dock
    const handleMouseMove = useCallback((e) => {
        mouseX.set(e.clientX);
    }, [mouseX]);

    // Reset magnification and collapse dock when mouse leaves
    const collapseTimeoutRef = useRef(null);

    const handleMouseLeave = useCallback(() => {
        mouseX.set(null);
        // Collapse dock after a short delay
        collapseTimeoutRef.current = setTimeout(() => {
            setIsCollapsed(true);
        }, 800); // 800ms delay to prevent accidental collapse
    }, [mouseX]);

    // Cancel collapse if mouse re-enters
    const handleMouseEnterDock = useCallback(() => {
        if (collapseTimeoutRef.current) {
            clearTimeout(collapseTimeoutRef.current);
            collapseTimeoutRef.current = null;
        }
    }, []);

    // Handle drag end - snap to nearest corner
    const handleDragEnd = useCallback((event, info) => {
        setIsDragging(false);

        // Get the final position
        const finalX = info.point.x;
        const finalY = info.point.y;

        // Find nearest corner
        const nearestCorner = findNearestCorner(finalX, finalY);
        setCurrentCorner(nearestCorner);

        // Reset motion values (position will be handled by CSS)
        circleX.set(0);
        circleY.set(0);
    }, [circleX, circleY]);

    // Get position style for current corner
    const getCornerStyle = () => {
        switch (currentCorner) {
            case 'bottom-center':
                return { bottom: 24, left: '50%', transform: 'translateX(-50%)' };
            case 'bottom-left':
                return { bottom: 24, left: 24 };
            case 'bottom-right':
                return { bottom: 24, right: 24 };
            case 'top-left':
                return { top: 80, left: 24 };
            case 'top-right':
                return { top: 80, right: 24 };
            default:
                return { bottom: 24, left: '50%', transform: 'translateX(-50%)' };
        }
    };

    return (
        <AnimatePresence>
            {isCollapsed ? (
                /* ============ COLLAPSED DRAGGABLE CIRCLE ============ */
                <motion.div
                    key="collapsed-dock"
                    drag
                    dragMomentum={false}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="fixed z-50 cursor-grab active:cursor-grabbing"
                    style={{
                        ...getCornerStyle(),
                        x: circleX,
                        y: circleY,
                    }}
                    whileDrag={{ scale: 1.1 }}
                    onClick={() => !isDragging && setIsCollapsed(false)}
                >
                    <motion.button
                        className={cn(
                            'w-14 h-14 rounded-full flex items-center justify-center',
                            'bg-slate-900/80 backdrop-blur-2xl',
                            'border border-white/20',
                            'shadow-2xl shadow-black/50',
                            'group relative',
                            'hover:border-cyan-400/50',
                            isDragging && 'border-cyan-400/70'
                        )}
                    >
                        {/* Animated pulsing ring */}
                        {!isDragging && (
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                animate={{
                                    boxShadow: [
                                        '0 0 0 0px rgba(34, 211, 238, 0.4)',
                                        '0 0 0 12px rgba(34, 211, 238, 0)',
                                    ]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeOut'
                                }}
                            />
                        )}

                        {/* Inner glow */}
                        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />

                        {/* Icon - Grid layout icon */}
                        <LayoutGrid
                            size={22}
                            className={cn(
                                'text-cyan-400 transition-transform relative z-10',
                                !isDragging && 'group-hover:rotate-12'
                            )}
                        />

                        {/* Drag hint dots */}
                        {isDragging && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50"
                            />
                        )}

                        {/* Tooltip */}
                        {!isDragging && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    'absolute -top-10 left-1/2 -translate-x-1/2',
                                    'px-2.5 py-1.5 rounded-lg',
                                    'bg-slate-900/90 text-white text-xs font-medium',
                                    'backdrop-blur-md border border-white/10',
                                    'whitespace-nowrap pointer-events-none'
                                )}
                            >
                                Drag to any corner
                            </motion.span>
                        )}
                    </motion.button>
                </motion.div>
            ) : (
                /* ============ EXPANDED DOCK ============ */
                <motion.div
                    key="expanded-dock"
                    ref={containerRef}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn(
                        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
                        'flex items-end gap-2 px-3 py-2',
                        'rounded-2xl',
                        // Glass material
                        'bg-slate-900/60 backdrop-blur-2xl',
                        'border border-white/10',
                        'shadow-2xl shadow-black/40',
                        className
                    )}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnterDock}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Navigation Items */}
                    {DOCK_ITEMS.map((item, index) => (
                        <DockItem
                            key={item.id}
                            item={item}
                            index={index}
                            isActive={activeTab === item.id}
                            mouseX={mouseX}
                            containerRef={containerRef}
                            onSelect={onTabChange}
                        />
                    ))}

                    {/* Separator */}
                    <div className="w-px h-8 bg-white/10 mx-1 self-center" />

                    {/* Command Palette Button */}
                    <motion.button
                        onClick={onOpenCommandPalette}
                        className={cn(
                            'flex items-center justify-center',
                            'w-12 h-12 rounded-xl',
                            'bg-white/5 text-white/70',
                            'hover:bg-white/10 hover:text-white',
                            'transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Command size={20} />
                    </motion.button>

                    {/* Close/Collapse Button */}
                    <motion.button
                        onClick={() => setIsCollapsed(true)}
                        className={cn(
                            'flex items-center justify-center',
                            'w-12 h-12 rounded-xl',
                            'bg-white/5 text-white/50',
                            'hover:bg-red-500/20 hover:text-red-400',
                            'transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
                        )}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        title="Minimize dock"
                    >
                        <X size={18} />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Dock;
