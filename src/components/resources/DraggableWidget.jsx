/**
 * DraggableWidget - Sortable Card Wrapper
 * 
 * Features:
 * - DndKit sortable integration
 * - Resize handles (in edit mode)
 * - Context menu (right-click)
 * - Glassmorphism styling
 * - Mouse-tracking border glow
 */

import React, { useState, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useResourceActions } from '../../store/resourceStore';
import { cn } from '../../lib/utils';
import {
    GripVertical,
    Maximize2,
    Palette,
    Edit3,
    Trash2,
    Sparkles,
    Lightbulb,
    LineChart
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import InteractiveGraph from './InteractiveGraph';

// =============================================================================
// KATEX RENDERER
// =============================================================================
const KatexRenderer = ({ latex }) => {
    const ref = useRef(null);

    React.useEffect(() => {
        if (ref.current && latex) {
            try {
                katex.render(latex, ref.current, {
                    throwOnError: false,
                    displayMode: true,
                    trust: true
                });
            } catch (e) {
                ref.current.textContent = latex;
            }
        }
    }, [latex]);

    return <span ref={ref} />;
};

// =============================================================================
// SIZE PRESETS
// =============================================================================
const SIZES = {
    '1x1': 'col-span-1',
    '2x1': 'col-span-2',
    '2x2': 'col-span-2 row-span-2',
    'full': 'col-span-full'
};

// =============================================================================
// COLOR PRESETS
// =============================================================================
const COLOR_PRESETS = [
    { name: 'Default', gradient: 'from-slate-50 to-blue-50/50', darkGradient: 'from-slate-900 to-blue-950/30' },
    { name: 'Indigo', gradient: 'from-indigo-50 to-purple-50', darkGradient: 'from-indigo-950/50 to-purple-950/30' },
    { name: 'Emerald', gradient: 'from-emerald-50 to-teal-50', darkGradient: 'from-emerald-950/50 to-teal-950/30' },
    { name: 'Rose', gradient: 'from-rose-50 to-pink-50', darkGradient: 'from-rose-950/50 to-pink-950/30' },
    { name: 'Amber', gradient: 'from-amber-50 to-orange-50', darkGradient: 'from-amber-950/50 to-orange-950/30' },
    { name: 'Cyan', gradient: 'from-cyan-50 to-sky-50', darkGradient: 'from-cyan-950/50 to-sky-950/30' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const DraggableWidget = ({
    concept,
    index,
    isDarkMode,
    isEditMode,
    classLevel,
    subject,
    topicKey,
    onEdit,
    onViewDetail,
    onOpenGraph
}) => {
    const { updateWidgetStyle } = useResourceActions();
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

    // DndKit sortable
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: concept.id, disabled: !isEditMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto'
    };

    // Get current style
    const widgetStyle = concept.style || {};
    const currentSize = widgetStyle.size || '1x1';
    const currentGradient = widgetStyle.bgGradient || 'default';
    const currentRadius = widgetStyle.borderRadius || 16;

    // Get gradient class
    const getGradientClass = () => {
        const preset = COLOR_PRESETS.find(p => p.name.toLowerCase() === currentGradient.toLowerCase());
        if (preset) {
            return isDarkMode ? preset.darkGradient : preset.gradient;
        }
        return isDarkMode ? 'from-slate-900 to-blue-950/30' : 'from-slate-50 to-blue-50/50';
    };

    // Mouse move for border glow
    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    // Handle style change
    const handleColorChange = (colorName) => {
        updateWidgetStyle(classLevel, subject, topicKey, concept.id, { bgGradient: colorName });
    };

    const handleSizeChange = (size) => {
        updateWidgetStyle(classLevel, subject, topicKey, concept.id, { size });
    };

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                <motion.div
                    ref={(node) => {
                        setNodeRef(node);
                        cardRef.current = node;
                    }}
                    {...attributes}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onMouseMove={handleMouseMove}
                    className={cn(
                        'relative overflow-hidden rounded-2xl p-5',
                        'backdrop-blur-xl border cursor-pointer',
                        'transition-all duration-300',
                        SIZES[currentSize],
                        isDarkMode
                            ? 'bg-gradient-to-br border-slate-700/50 hover:border-indigo-500/30'
                            : 'bg-gradient-to-br border-slate-200/80 hover:border-indigo-300/50',
                        getGradientClass(),
                        isDragging && 'opacity-50 shadow-2xl shadow-indigo-500/20',
                        isHovered && !isDragging && 'shadow-xl shadow-indigo-500/10'
                    )}
                    style={{
                        transform: CSS.Transform.toString(transform),
                        transition,
                        zIndex: isDragging ? 50 : 'auto',
                        borderRadius: `${currentRadius}px`
                    }}
                >
                    {/* Mouse-tracking border glow */}
                    {isHovered && (
                        <div
                            className="absolute inset-0 pointer-events-none rounded-inherit"
                            style={{
                                background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, ${isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'
                                    }, transparent 40%)`,
                                borderRadius: 'inherit'
                            }}
                        />
                    )}

                    {/* Edit Mode Drag Handle */}
                    {isEditMode && (
                        <div
                            {...listeners}
                            className={cn(
                                'absolute top-2 left-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing z-20',
                                isDarkMode ? 'bg-slate-800/80 text-indigo-400' : 'bg-white/80 text-indigo-600',
                                'opacity-0 group-hover:opacity-100 transition-opacity'
                            )}
                            style={{ opacity: isHovered || isEditMode ? 1 : 0 }}
                        >
                            <GripVertical size={14} />
                        </div>
                    )}

                    {/* Pencil Edit Icon */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                        className={cn(
                            'absolute top-3 right-3 p-1.5 rounded-lg z-20 transition-colors',
                            isDarkMode
                                ? 'bg-slate-800/80 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300'
                                : 'bg-white/80 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                        )}
                        title="Edit concept"
                    >
                        <Edit3 size={14} />
                    </motion.button>

                    {/* JEE Badge */}
                    {concept.isJeeFav && (
                        <div className={cn(
                            'absolute top-3 right-12 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20',
                            isDarkMode
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        )}>
                            <Sparkles size={10} />
                            JEE
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10" onClick={() => !isEditMode && onViewDetail?.()}>
                        {/* Title */}
                        <h3
                            className={cn(
                                'text-xl font-bold mb-3 leading-tight pr-16',
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}
                            style={{ fontFamily: "'Patrick Hand', cursive" }}
                        >
                            {concept.concept}
                        </h3>

                        {/* Theory */}
                        {concept.theory && (
                            <p
                                className={cn(
                                    'text-base leading-relaxed mb-4 line-clamp-3',
                                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                                )}
                                style={{ fontFamily: "'Patrick Hand', cursive" }}
                            >
                                {concept.theory}
                            </p>
                        )}

                        {/* Formula */}
                        {concept.formula && (
                            <div
                                className={cn(
                                    'p-4 rounded-xl overflow-x-auto flex items-center justify-center',
                                    isDarkMode
                                        ? 'bg-slate-800/80 border border-indigo-500/20'
                                        : 'bg-gradient-to-br from-slate-50 to-indigo-50/80 border border-indigo-200/50'
                                )}
                            >
                                <div className={isDarkMode ? 'text-slate-100' : 'text-slate-800'}>
                                    <KatexRenderer latex={concept.formula} />
                                </div>
                            </div>
                        )}

                        {/* Interactive Graph Trigger */}
                        {concept.graph && (
                            <div className="mt-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenGraph?.();
                                    }}
                                    className={cn(
                                        "w-full group relative overflow-hidden rounded-xl p-3 flex items-center justify-between transition-all duration-300",
                                        isDarkMode
                                            ? "bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50"
                                            : "bg-white/60 hover:bg-white/80 border border-indigo-100 hover:border-indigo-300/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg transition-colors group-hover:scale-105",
                                            isDarkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
                                        )}>
                                            <LineChart size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className={cn(
                                                "text-sm font-bold",
                                                isDarkMode ? "text-slate-200" : "text-slate-700"
                                            )}>
                                                Interactive Graph
                                            </p>
                                            <p className={cn(
                                                "text-xs",
                                                isDarkMode ? "text-slate-400" : "text-slate-500"
                                            )}>
                                                Visualize {concept.graph.yLabel} vs {concept.graph.xLabel}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className={cn(
                                        "p-1.5 rounded-full transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                                        isDarkMode ? "bg-slate-700 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                                    )}>
                                        <Maximize2 size={14} />
                                    </div>

                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                                </button>
                            </div>
                        )}

                        {/* Shortcut/Tip */}
                        {concept.shortcut && (
                            <div
                                className={cn(
                                    'mt-4 p-3 rounded-xl flex items-start gap-2',
                                    isDarkMode
                                        ? 'bg-amber-500/10 border border-amber-500/20'
                                        : 'bg-amber-50 border border-amber-200/50'
                                )}
                            >
                                <Lightbulb size={16} className={isDarkMode ? 'text-amber-400 mt-0.5' : 'text-amber-600 mt-0.5'} />
                                <p
                                    className={cn(
                                        'text-sm italic line-clamp-2',
                                        isDarkMode ? 'text-amber-200/90' : 'text-amber-800'
                                    )}
                                    style={{ fontFamily: "'Patrick Hand', cursive" }}
                                >
                                    {concept.shortcut}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </ContextMenu.Trigger>

            {/* Context Menu */}
            <ContextMenu.Portal>
                <ContextMenu.Content
                    className={cn(
                        'min-w-[180px] rounded-xl p-1.5 shadow-xl border backdrop-blur-xl z-[100]',
                        isDarkMode
                            ? 'bg-slate-900/95 border-slate-700'
                            : 'bg-white/95 border-slate-200'
                    )}
                >
                    {/* Edit */}
                    <ContextMenu.Item
                        onClick={onEdit}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none',
                            isDarkMode
                                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        )}
                    >
                        <Edit3 size={14} />
                        Edit Content
                    </ContextMenu.Item>

                    {/* Color Submenu */}
                    <ContextMenu.Sub>
                        <ContextMenu.SubTrigger
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none',
                                isDarkMode
                                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            )}
                        >
                            <Palette size={14} />
                            Change Color
                        </ContextMenu.SubTrigger>
                        <ContextMenu.Portal>
                            <ContextMenu.SubContent
                                className={cn(
                                    'min-w-[140px] rounded-xl p-1.5 shadow-xl border backdrop-blur-xl',
                                    isDarkMode
                                        ? 'bg-slate-900/95 border-slate-700'
                                        : 'bg-white/95 border-slate-200'
                                )}
                            >
                                {COLOR_PRESETS.map((color) => (
                                    <ContextMenu.Item
                                        key={color.name}
                                        onClick={() => handleColorChange(color.name.toLowerCase())}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none',
                                            isDarkMode
                                                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                        )}
                                    >
                                        <div className={cn(
                                            'w-4 h-4 rounded-full bg-gradient-to-br',
                                            color.gradient
                                        )} />
                                        {color.name}
                                    </ContextMenu.Item>
                                ))}
                            </ContextMenu.SubContent>
                        </ContextMenu.Portal>
                    </ContextMenu.Sub>

                    {/* Size Submenu */}
                    <ContextMenu.Sub>
                        <ContextMenu.SubTrigger
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none',
                                isDarkMode
                                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            )}
                        >
                            <Maximize2 size={14} />
                            Resize
                        </ContextMenu.SubTrigger>
                        <ContextMenu.Portal>
                            <ContextMenu.SubContent
                                className={cn(
                                    'min-w-[120px] rounded-xl p-1.5 shadow-xl border backdrop-blur-xl',
                                    isDarkMode
                                        ? 'bg-slate-900/95 border-slate-700'
                                        : 'bg-white/95 border-slate-200'
                                )}
                            >
                                {Object.keys(SIZES).map((size) => (
                                    <ContextMenu.Item
                                        key={size}
                                        onClick={() => handleSizeChange(size)}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none',
                                            currentSize === size && (isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'),
                                            isDarkMode
                                                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                        )}
                                    >
                                        {size}
                                    </ContextMenu.Item>
                                ))}
                            </ContextMenu.SubContent>
                        </ContextMenu.Portal>
                    </ContextMenu.Sub>

                    <ContextMenu.Separator className={cn('h-px my-1', isDarkMode ? 'bg-slate-700' : 'bg-slate-200')} />

                    {/* Delete */}
                    <ContextMenu.Item
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer outline-none',
                            'text-red-500 hover:bg-red-500/10'
                        )}
                    >
                        <Trash2 size={14} />
                        Delete
                    </ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
};

export default DraggableWidget;
