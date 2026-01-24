/**
 * Dock Component - Apple-Style Magnification & Physics
 * 
 * Features:
 * - "Magnification Wave" effect using useMotionValue and useTransform
 * - Smooth spring physics for all interactions
 * - layout animations for fluid resizing
 * - Premium glassmorphism and reduced z-fighting
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    Home, BookOpen, PieChart, LayoutGrid, Bot, Shield, X, Cloud
} from 'lucide-react';
import { useAppStore } from '../../store';
import LuminaOrb from '../ui/LuminaOrb';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence
} from 'framer-motion';

// Dock navigation items configuration
const DOCK_ITEMS = [
    { id: 'overview', icon: Home, label: 'Overview', color: 'from-blue-500 to-cyan-400' },
    { id: 'study-tools', icon: BookOpen, label: 'Study Tools', color: 'from-emerald-500 to-green-400' },
    { id: 'progress', icon: PieChart, label: 'Progress', color: 'from-purple-500 to-violet-400' },
    { id: 'resources', icon: LayoutGrid, label: 'Resources', color: 'from-orange-500 to-amber-400' },
    { id: 'ai-assistant', icon: Bot, label: 'AI Assistant', color: 'from-pink-500 to-rose-400' },
    { id: 'vault', icon: Cloud, label: 'Vault', color: 'from-indigo-500 to-blue-400' },
    { id: 'admin', icon: Shield, label: 'Admin', color: 'from-slate-600 to-slate-500' },
];

const POSITION_KEY = 'dock_position';
const BASE_WIDTH = 50; // Base size of icon
const DISTANCE = 150; // Distance of influence for magnification
const MAGNIFICATION = 1.6; // Scale factor at center

// ============================================================================
// DOCK ICON COMPONENT
// ============================================================================

const DockIcon = ({ item, mouseX, activeTab, onSelect }) => {
    const ref = useRef(null);

    // Calculate distance from mouse pointer
    const distance = useTransform(mouseX, val => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    // Calculate width (scale) based on distance
    const widthSync = useTransform(distance, [-DISTANCE, 0, DISTANCE], [BASE_WIDTH, BASE_WIDTH * MAGNIFICATION, BASE_WIDTH]);

    // Smooth out the width changes with a spring
    const width = useSpring(widthSync, {
        mass: 0.1,
        stiffness: 150,
        damping: 12
    });

    const isActive = activeTab === item.id;
    const Icon = item.icon;

    // Derived active/hover states
    const activeDotScale = useSpring(isActive ? 1 : 0, { stiffness: 200, damping: 20 });
    const opacity = useSpring(1, { stiffness: 300, damping: 30 });

    return (
        <motion.div
            ref={ref}
            style={{ width }}
            className="aspect-square relative flex items-center justify-center group"
        >
            <motion.button
                onClick={() => onSelect(item.id)}
                style={{ width }} // Button size matches container size
                className={`
                    aspect-square rounded-2xl flex items-center justify-center
                    bg-gradient-to-b ${item.color}
                    shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                    border border-white/20
                    absolute bottom-2
                    origin-bottom
                    overflow-hidden
                `}
                whileTap={{ scale: 0.9 }}
            >
                {/* Glossy Reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

                {/* Icon */}
                <Icon size={24} className="text-white drop-shadow-md relative z-10" strokeWidth={1.5} />
            </motion.button>

            {/* Label Tooltip */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                style={{ opacity: 0, y: 10 }} // Hide by default
                className="absolute -top-12 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
                <span className="text-xs font-semibold text-white">{item.label}</span>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-black/70 border-r border-b border-white/10" />
            </motion.div>

            {/* Active Indicator */}
            <motion.div
                style={{ scale: activeDotScale }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-80"
            />
        </motion.div>
    );
};

// ============================================================================
// MAIN DOCK COMPONENT
// ============================================================================

export const Dock = ({ activeTab, onTabChange }) => {
    // Mouse X tracking for wave effect
    const mouseX = useMotionValue(Infinity);

    // Global Store State
    const isCollapsed = useAppStore((state) => state.dockCollapsed);
    const toggleDock = useAppStore((state) => state.toggleDock);

    // Position state
    const [position, setPosition] = useState(() => {
        try {
            const saved = localStorage.getItem(POSITION_KEY);
            return saved ? JSON.parse(saved) : { x: window.innerWidth / 2, y: window.innerHeight - 40 };
        } catch {
            return { x: window.innerWidth / 2, y: window.innerHeight - 40 };
        }
    });

    // Save position
    const savePosition = useCallback((pos) => {
        try {
            localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
        } catch { }
    }, []);

    // Draggable Logic for Collapsed State
    // toggleDock is used directly instead of toggleCollapse local function

    return (
        <AnimatePresence mode="wait">
            {isCollapsed ? (
                // COLLAPSED: Draggable Floating Action Button
                <motion.div
                    key="collapsed-dock"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -180 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                        const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
                        // Simplified saving logic for drag
                    }}
                    className="fixed bottom-6 right-6 z-[9990]" // Force bottom right if collapsed
                >
                    <button
                        onClick={toggleDock}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 
                                   flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                                   border-2 border-white/20 hover:scale-110 active:scale-90 transition-transform overflow-hidden relative"
                    >
                        {/* Deep Space Background for Orb */}
                        <div className="absolute inset-0 bg-black/40" />
                        <LuminaOrb size={28} className="relative z-10" />
                    </button>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40 whitespace-nowrap">Dock</span>
                </motion.div>
            ) : (
                // EXPANDED: Premium Apple-Style Dock
                <motion.div
                    key="expanded-dock"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    className="fixed bottom-6 left-1/2 z-[9990] -translate-x-1/2" // High Z-Index but below Sidebar (9999)
                >
                    <motion.div
                        onMouseMove={(e) => mouseX.set(e.pageX)}
                        onMouseLeave={() => mouseX.set(Infinity)}
                        className="flex items-end gap-3 px-4 py-3 pb-4
                                   bg-black/40 backdrop-blur-2xl
                                   rounded-[24px] border border-white/10
                                   shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                        {DOCK_ITEMS.map((item) => (
                            <DockIcon
                                key={item.id}
                                item={item}
                                mouseX={mouseX}
                                activeTab={activeTab}
                                onSelect={onTabChange}
                            />
                        ))}

                        {/* Divider */}
                        <div className="w-px h-10 bg-white/10 mx-1 self-center" />

                        {/* Minimize Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleDock}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center 
                                       bg-white/5 border border-white/10
                                       transition-colors self-center mb-1.5"
                        >
                            <X size={18} className="text-white/60" />
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Dock;
