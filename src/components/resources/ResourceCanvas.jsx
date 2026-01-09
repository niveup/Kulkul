/**
 * ResourceCanvas - Main Grid Container
 * 
 * Features:
 * - DndKit drag-and-drop
 * - Glassmorphism 3.0 aesthetics
 * - Edit mode with visual grid
 * - Mouse-tracking spotlight effect
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import {
    useResourceStore,
    useIsEditMode,
    useTheme,
    useResourceActions
} from '../../store/resourceStore';
import DraggableWidget from './DraggableWidget';
import EditToolbar from './EditToolbar';
import WidgetEditor from './WidgetEditor';
import { cn } from '../../lib/utils';
import { Search, ChevronDown, Atom, Calculator, Beaker, Clock, PieChart, Moon, Sun } from 'lucide-react';

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ResourceCanvas = ({ isDarkMode, onToggleTheme }) => {
    const resources = useResourceStore((s) => s.resources);
    const layouts = useResourceStore((s) => s.layouts);
    const isEditMode = useIsEditMode();
    const theme = useTheme();
    const actions = useResourceActions();

    // Local state
    const [selectedClass, setSelectedClass] = useState('12');
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingWidget, setEditingWidget] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Refs
    const menuRef = useRef(null);
    const canvasRef = useRef(null);
    const topicStartTimeRef = useRef(Date.now());

    // Mouse tracking for spotlight effect
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // DndKit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - topicStartTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Get topics for current class/subject
    const topics = useMemo(() => {
        const subjectData = resources[selectedClass]?.[selectedSubject];
        if (!subjectData) return [];
        return Object.entries(subjectData).map(([key, value]) => ({
            key,
            name: value.name
        }));
    }, [resources, selectedClass, selectedSubject]);

    // Auto-select first topic
    useEffect(() => {
        if (topics.length > 0 && !selectedTopic) {
            setSelectedTopic(topics[0].key);
        }
    }, [topics, selectedTopic]);

    // Get concepts for current topic
    const concepts = useMemo(() => {
        if (!selectedTopic) return [];
        const topic = resources[selectedClass]?.[selectedSubject]?.[selectedTopic];
        return topic?.concepts || [];
    }, [resources, selectedClass, selectedSubject, selectedTopic]);

    // Filtered concepts
    const filteredConcepts = useMemo(() => {
        if (!searchTerm.trim()) return concepts;
        const term = searchTerm.toLowerCase();
        return concepts.filter(c =>
            c.concept?.toLowerCase().includes(term) ||
            c.theory?.toLowerCase().includes(term) ||
            c.formula?.toLowerCase().includes(term)
        );
    }, [concepts, searchTerm]);

    // Handle topic change
    const handleTopicChange = useCallback((topicKey) => {
        topicStartTimeRef.current = Date.now();
        setElapsedSeconds(0);
        setSelectedTopic(topicKey);
        setActiveMenu(null);
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id && isEditMode) {
            // Reorder logic would go here
            // For now, we'll just update the layout
            console.log('Reorder:', active.id, 'to', over?.id);
        }
    }, [isEditMode]);

    // Handle drag start
    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    // Mouse move handler for spotlight
    const handleMouseMove = useCallback((e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    // Click outside menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Subject icons
    const SubjectIcon = ({ subject }) => {
        const iconClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
        if (subject === 'Physics') return <Atom size={18} className={iconClass} />;
        if (subject === 'Chemistry') return <Beaker size={18} className={iconClass} />;
        if (subject === 'Math') return <Calculator size={18} className={iconClass} />;
        return null;
    };

    return (
        <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className={cn(
                'min-h-screen w-full transition-colors duration-500 relative',
                isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
            )}
        >
            {/* Spotlight Effect (visible in edit mode) */}
            {isEditMode && (
                <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-30"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'
                            }, transparent 40%)`
                    }}
                />
            )}

            {/* Edit Mode Grid Pattern */}
            {isEditMode && (
                <div
                    className={cn(
                        'absolute inset-0 z-0 pointer-events-none',
                        isDarkMode ? 'opacity-10' : 'opacity-5'
                    )}
                    style={{
                        backgroundImage: `
              linear-gradient(${isDarkMode ? '#6366f1' : '#6366f1'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDarkMode ? '#6366f1' : '#6366f1'} 1px, transparent 1px)
            `,
                        backgroundSize: '40px 40px'
                    }}
                />
            )}

            {/* ============ NAVIGATION BAR ============ */}
            <nav
                ref={menuRef}
                className={cn(
                    'sticky top-0 z-50 px-4 py-3 backdrop-blur-2xl border-b',
                    isDarkMode
                        ? 'bg-slate-950/80 border-slate-800/50'
                        : 'bg-white/80 border-slate-200/50'
                )}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Left: Class & Subject Selectors */}
                    <div className="flex items-center gap-2">
                        {['11', '12'].map((cls) => (
                            <div key={cls} className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveMenu(activeMenu === cls ? null : cls)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all',
                                        activeMenu === cls
                                            ? isDarkMode
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                            : isDarkMode
                                                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    )}
                                >
                                    Class {cls}
                                    <motion.div animate={{ rotate: activeMenu === cls ? 180 : 0 }}>
                                        <ChevronDown size={16} />
                                    </motion.div>
                                </motion.button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {activeMenu === cls && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className={cn(
                                                'absolute top-full left-0 mt-2 w-[500px] p-4 rounded-2xl border shadow-2xl backdrop-blur-2xl z-50 grid grid-cols-12 gap-4',
                                                isDarkMode
                                                    ? 'bg-slate-900/95 border-slate-700/50'
                                                    : 'bg-white/95 border-slate-200/50'
                                            )}
                                        >
                                            {/* Subjects */}
                                            <div className={cn('col-span-4 border-r pr-4', isDarkMode ? 'border-slate-700/50' : 'border-slate-200')}>
                                                <h4 className={cn('text-xs font-bold uppercase tracking-wider mb-3', isDarkMode ? 'text-indigo-400' : 'text-indigo-600')}>
                                                    Subjects
                                                </h4>
                                                <div className="space-y-1">
                                                    {['Physics', 'Chemistry', 'Math'].map(subj => (
                                                        <button
                                                            key={subj}
                                                            onClick={() => {
                                                                setSelectedClass(cls);
                                                                setSelectedSubject(subj);
                                                                setSelectedTopic(null);
                                                            }}
                                                            className={cn(
                                                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition-all',
                                                                selectedSubject === subj && selectedClass === cls
                                                                    ? isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                                                    : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                            )}
                                                        >
                                                            <SubjectIcon subject={subj} />
                                                            {subj}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Topics */}
                                            <div className="col-span-8 max-h-[300px] overflow-y-auto">
                                                <h4 className={cn('text-xs font-bold uppercase tracking-wider mb-3 sticky top-0 py-1 backdrop-blur-sm', isDarkMode ? 'text-indigo-400 bg-slate-900/80' : 'text-indigo-600 bg-white/80')}>
                                                    Topics
                                                </h4>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {topics.map((topic) => (
                                                        <button
                                                            key={topic.key}
                                                            onClick={() => handleTopicChange(topic.key)}
                                                            className={cn(
                                                                'text-left px-3 py-2 rounded-lg text-sm font-medium transition-all truncate',
                                                                selectedTopic === topic.key
                                                                    ? isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                                                    : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-indigo-500/20' : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
                                                            )}
                                                        >
                                                            {topic.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        {/* Current Topic Badge */}
                        <div className={cn('h-6 w-px mx-2', isDarkMode ? 'bg-slate-700' : 'bg-slate-300')} />
                        {selectedTopic && (
                            <motion.div
                                key={selectedTopic}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-semibold',
                                    isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                                )}
                            >
                                {resources[selectedClass]?.[selectedSubject]?.[selectedTopic]?.name || selectedTopic}
                            </motion.div>
                        )}

                        {/* Timer */}
                        <motion.div
                            animate={{
                                backgroundColor: elapsedSeconds >= 300
                                    ? isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'
                                    : isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                            }}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold',
                                elapsedSeconds >= 300
                                    ? isDarkMode ? 'text-green-400' : 'text-green-600'
                                    : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            )}
                        >
                            <Clock size={12} />
                            <span>{String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}</span>
                            {elapsedSeconds >= 300 && <span className="text-[10px]">✓</span>}
                        </motion.div>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search concepts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(
                                    'w-48 pl-9 pr-3 py-2 rounded-xl text-sm border transition-all',
                                    isDarkMode
                                        ? 'bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500'
                                        : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500'
                                )}
                            />
                        </div>

                        {/* Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onToggleTheme}
                            className={cn(
                                'p-2 rounded-xl transition-colors',
                                isDarkMode
                                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>
                    </div>
                </div>
            </nav>

            {/* ============ EDIT TOOLBAR ============ */}
            <EditToolbar isDarkMode={isDarkMode} />

            {/* ============ MAIN CONTENT GRID ============ */}
            <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredConcepts.map(c => c.id)}
                        strategy={rectSortingStrategy}
                    >
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredConcepts.map((concept, index) => (
                                <DraggableWidget
                                    key={concept.id}
                                    concept={concept}
                                    index={index}
                                    isDarkMode={isDarkMode}
                                    isEditMode={isEditMode}
                                    classLevel={selectedClass}
                                    subject={selectedSubject}
                                    topicKey={selectedTopic}
                                    onEdit={() => setEditingWidget(concept)}
                                />
                            ))}
                        </motion.div>
                    </SortableContext>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeId && (
                            <div className={cn(
                                'p-4 rounded-2xl shadow-2xl',
                                isDarkMode ? 'bg-slate-800 border border-indigo-500' : 'bg-white border border-indigo-400'
                            )}>
                                Dragging...
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>

                {/* Empty State */}
                {filteredConcepts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <p className={cn('text-lg', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                            {searchTerm ? 'No concepts found matching your search.' : 'No concepts available for this topic.'}
                        </p>
                    </motion.div>
                )}
            </main>

            {/* ============ WIDGET EDITOR MODAL ============ */}
            <WidgetEditor
                widget={editingWidget}
                onClose={() => setEditingWidget(null)}
                isDarkMode={isDarkMode}
                classLevel={selectedClass}
                subject={selectedSubject}
                topicKey={selectedTopic}
            />
        </div>
    );
};

export default ResourceCanvas;
