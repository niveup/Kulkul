/**
 * ResourceCanvas - Main Grid Container
 * 
 * Features:
 * - Emerald/Teal aesthetics
 * - Hierarchy-based navigation (Breadcrumbs)
 * - Subtopic filtering
 * - Mouse-tracking spotlight effect
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useResourceStore,
    useTheme,
    useResourceActions
} from '../../store/resourceStore';
import ConceptCard from './ConceptCard';
import Breadcrumb from './Breadcrumb';
import { cn } from '../../lib/utils';
import { Search, ChevronDown, Atom, Calculator, Beaker, Clock, PieChart, Moon, Sun, X, Lightbulb, Sparkles, LineChart } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================
const containerVariants = {
    hidden: { scale: 0.98 },
    visible: {
        scale: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, scale: 0.95 },
    visible: {
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
    const theme = useTheme();
    const actions = useResourceActions();

    const [selectedClass, setSelectedClass] = useState('12');
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [viewingConcept, setViewingConcept] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Refs
    const menuRef = useRef(null);
    const canvasRef = useRef(null);
    const topicStartTimeRef = useRef(Date.now());



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
        let result = concepts;

        // Subtopic filter
        if (selectedSubtopic !== 'All') {
            result = result.filter(c => c.subtopic === selectedSubtopic);
        }

        if (!searchTerm.trim()) return result;
        const term = searchTerm.toLowerCase();
        return result.filter(c =>
            c.concept?.toLowerCase().includes(term) ||
            c.theory?.toLowerCase().includes(term) ||
            c.formula?.toLowerCase().includes(term) ||
            c.tags?.some(t => t.toLowerCase().includes(term))
        );
    }, [concepts, searchTerm, selectedSubtopic]);

    // Available subtopics for current topic
    const subtopics = useMemo(() => {
        const subs = new Set(['All']);
        concepts.forEach(c => {
            if (c.subtopic) subs.add(c.subtopic);
        });
        return Array.from(subs);
    }, [concepts]);

    // Handle topic change
    const handleTopicChange = useCallback((topicKey) => {
        topicStartTimeRef.current = Date.now();
        setElapsedSeconds(0);
        setSelectedTopic(topicKey);
        setActiveMenu(null);
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
            className={cn(
                'min-h-screen w-full transition-colors duration-500 relative',
                isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
            )}
        >
            {/* Edit Mode Grid Pattern - Removed for clarity */}

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
                <div className="max-w-7xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
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
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
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
                                                    <h4 className={cn('text-xs font-bold uppercase tracking-wider mb-3', isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
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
                                                                    setSelectedSubtopic('All');
                                                                }}
                                                                className={cn(
                                                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition-all',
                                                                    selectedSubject === subj && selectedClass === cls
                                                                        ? isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
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
                                                    <h4 className={cn('text-xs font-bold uppercase tracking-wider mb-3 sticky top-0 py-1 backdrop-blur-sm', isDarkMode ? 'text-emerald-400 bg-slate-900/80' : 'text-emerald-600 bg-white/80')}>
                                                        Topics
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {topics.map((topic) => (
                                                            <button
                                                                key={topic.key}
                                                                onClick={() => {
                                                                    handleTopicChange(topic.key);
                                                                    setSelectedSubtopic('All');
                                                                }}
                                                                className={cn(
                                                                    'text-left px-3 py-2 rounded-lg text-sm font-medium transition-all truncate',
                                                                    selectedTopic === topic.key
                                                                        ? isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                                                        : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-emerald-500/20' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
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

                            {/* Breadcrumbs */}
                            <div className={cn('h-6 w-px mx-2', isDarkMode ? 'bg-slate-800' : 'bg-slate-200')} />
                            <Breadcrumb
                                items={[
                                    { label: selectedSubject, onClick: () => setActiveMenu(selectedClass) },
                                    { label: resources[selectedClass]?.[selectedSubject]?.[selectedTopic]?.name || selectedTopic, onClick: () => setActiveMenu(selectedClass) }
                                ]}
                                isDarkMode={isDarkMode}
                                showHome={false}
                            />

                            {/* Timer */}
                            <motion.div
                                animate={{
                                    backgroundColor: elapsedSeconds >= 300
                                        ? isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                                        : isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                                }}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold ml-2',
                                    elapsedSeconds >= 300
                                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
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
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className={cn('transition-colors', isDarkMode ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-500')} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search concepts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={cn(
                                        'w-64 pl-9 pr-3 py-2 rounded-xl text-sm border transition-all',
                                        isDarkMode
                                            ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                                            : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Subtopic Filters */}
                    {subtopics.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                            <Sparkles size={14} className={isDarkMode ? 'text-emerald-500/50' : 'text-emerald-600/50'} />
                            <div className="flex items-center gap-1">
                                {subtopics.map(sub => (
                                    <button
                                        key={sub}
                                        onClick={() => setSelectedSubtopic(sub)}
                                        className={cn(
                                            'px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border',
                                            selectedSubtopic === sub
                                                ? isDarkMode
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : isDarkMode
                                                    ? 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                                                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-300'
                                        )}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* ============ MAIN CONTENT GRID ============ */}
            <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredConcepts.map((concept, index) => (
                        <motion.div
                            key={concept.id}
                            variants={itemVariants}
                            layout
                        >
                            <ConceptCard
                                concept={concept}
                                index={index}
                                isDarkMode={isDarkMode}
                                onClick={() => setViewingConcept(concept)}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Empty State */}
                {
                    filteredConcepts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <p className={cn('text-lg', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                                {searchTerm ? 'No concepts found matching your search.' : 'No concepts available for this topic.'}
                            </p>
                        </motion.div>
                    )
                }
            </main >

            {/* WIDGET EDITOR MODAL - Removed */}


            {/* ============ DETAILED VIEW MODAL ============ */}
            < AnimatePresence >
                {viewingConcept && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
                        onClick={() => setViewingConcept(null)}
                    >
                        {/* Backdrop */}
                        <div
                            className={cn(
                                'absolute inset-0',
                                isDarkMode ? 'bg-black/90' : 'bg-black/70'
                            )}
                            style={{ backdropFilter: 'blur(8px)' }}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                'relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-8 md:p-10 shadow-2xl',
                                isDarkMode
                                    ? 'bg-slate-900 border border-slate-700'
                                    : 'bg-white border border-slate-200'
                            )}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setViewingConcept(null)}
                                className={cn(
                                    'absolute top-4 right-4 p-2.5 rounded-xl transition-all',
                                    isDarkMode
                                        ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                                        : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                )}
                            >
                                <X size={22} />
                            </button>

                            {/* Badges Row - Type */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {/* Type Badge */}
                                {viewingConcept.type && (
                                    <div className={cn(
                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold capitalize',
                                        isDarkMode
                                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                            : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                                    )}>
                                        {viewingConcept.type === 'formula' ? '📐' : '💡'} {viewingConcept.type}
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h2
                                className={cn(
                                    'text-3xl md:text-4xl font-bold mb-6 leading-tight',
                                    isDarkMode ? 'text-white' : 'text-slate-900'
                                )}
                                style={{ fontFamily: "'Patrick Hand', cursive" }}
                            >
                                {viewingConcept.concept}
                            </h2>

                            {/* Theory */}
                            {viewingConcept.theory && (
                                <div
                                    className={cn(
                                        'text-xl md:text-2xl leading-relaxed mb-6',
                                        isDarkMode ? 'text-slate-200' : 'text-slate-600'
                                    )}
                                    style={{ fontFamily: "'Patrick Hand', cursive" }}
                                >
                                    {viewingConcept.theory}
                                </div>
                            )}

                            {/* Formula */}
                            {viewingConcept.formula && (
                                <div
                                    className={cn(
                                        'p-6 md:p-8 rounded-2xl overflow-x-auto flex items-center justify-center mb-6',
                                        isDarkMode
                                            ? 'bg-slate-800 border border-emerald-500/30'
                                            : 'bg-gradient-to-br from-slate-50 to-emerald-50 border border-emerald-200/50'
                                    )}
                                >
                                    <div
                                        className={cn('scale-125', isDarkMode ? 'text-slate-100' : 'text-slate-800')}
                                        ref={(el) => {
                                            if (el && viewingConcept.formula) {
                                                try {
                                                    katex.render(viewingConcept.formula, el, {
                                                        throwOnError: false,
                                                        displayMode: true,
                                                        trust: true
                                                    });
                                                } catch (e) {
                                                    el.textContent = viewingConcept.formula;
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {/* Details */}
                            {viewingConcept.details && (
                                <div
                                    className={cn(
                                        'text-lg leading-relaxed mb-6',
                                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                                    )}
                                    style={{ fontFamily: "'Patrick Hand', cursive" }}
                                >
                                    {viewingConcept.details}
                                </div>
                            )}

                            {/* Interactive Graph Button */}
                            {viewingConcept.graph && (
                                <button
                                    onClick={() => {
                                        setViewingConcept(null);
                                        setActiveGraphWidget(viewingConcept);
                                    }}
                                    className={cn(
                                        'w-full p-4 rounded-xl flex items-center justify-between transition-all mb-6',
                                        isDarkMode
                                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30'
                                            : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'p-2 rounded-lg',
                                            isDarkMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-600'
                                        )}>
                                            <LineChart size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className={cn(
                                                'font-bold',
                                                isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                                            )}>
                                                📊 Interactive Graph
                                            </p>
                                            <p className={cn(
                                                'text-sm',
                                                isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                            )}>
                                                {viewingConcept.graph.yLabel} vs {viewingConcept.graph.xLabel}
                                            </p>
                                            {viewingConcept.graph.question && (
                                                <p className={cn(
                                                    'text-xs mt-1 italic',
                                                    isDarkMode ? 'text-amber-400' : 'text-amber-600'
                                                )}>
                                                    💡 {viewingConcept.graph.question}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )}

                            {/* Question Types Asked */}
                            {viewingConcept.questionTypes && viewingConcept.questionTypes.length > 0 && (
                                <div
                                    className={cn(
                                        'p-5 rounded-2xl mb-4',
                                        isDarkMode
                                            ? 'bg-purple-500/10 border border-purple-500/30'
                                            : 'bg-purple-50 border border-purple-200/50'
                                    )}
                                >
                                    <h4 className={cn(
                                        'font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2',
                                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                    )}>
                                        📝 Types of Questions Asked
                                    </h4>
                                    <ul className="space-y-2">
                                        {viewingConcept.questionTypes.map((q, idx) => (
                                            <li key={idx} className={cn(
                                                'flex items-start gap-2 text-base',
                                                isDarkMode ? 'text-purple-200' : 'text-purple-800'
                                            )}>
                                                <span className="text-purple-500 mt-1">•</span>
                                                <span style={{ fontFamily: "'Patrick Hand', cursive" }}>{q}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Common Mistakes */}
                            {viewingConcept.commonMistakes && viewingConcept.commonMistakes.length > 0 && (
                                <div
                                    className={cn(
                                        'p-5 rounded-2xl mb-4',
                                        isDarkMode
                                            ? 'bg-red-500/10 border border-red-500/30'
                                            : 'bg-red-50 border border-red-200/50'
                                    )}
                                >
                                    <h4 className={cn(
                                        'font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2',
                                        isDarkMode ? 'text-red-400' : 'text-red-600'
                                    )}>
                                        ⚠️ Common Mistakes to Avoid
                                    </h4>
                                    <ul className="space-y-2">
                                        {viewingConcept.commonMistakes.map((m, idx) => (
                                            <li key={idx} className={cn(
                                                'flex items-start gap-2 text-base',
                                                isDarkMode ? 'text-red-200' : 'text-red-800'
                                            )}>
                                                <span className="text-red-500 mt-1">✗</span>
                                                <span style={{ fontFamily: "'Patrick Hand', cursive" }}>{m}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Tips/Strategy */}
                            {viewingConcept.tips && (
                                <div
                                    className={cn(
                                        'p-5 rounded-2xl mb-4',
                                        isDarkMode
                                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                                            : 'bg-emerald-50 border border-emerald-200/50'
                                    )}
                                >
                                    <h4 className={cn(
                                        'font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2',
                                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                                    )}>
                                        💡 Pro Tips & Shortcuts
                                    </h4>
                                    <p
                                        className={cn(
                                            'text-lg leading-relaxed',
                                            isDarkMode ? 'text-emerald-200' : 'text-emerald-800'
                                        )}
                                        style={{ fontFamily: "'Patrick Hand', cursive" }}
                                    >
                                        {viewingConcept.tips}
                                    </p>
                                </div>
                            )}

                            {/* Shortcut/Tip (legacy field) */}
                            {viewingConcept.shortcut && (
                                <div
                                    className={cn(
                                        'p-5 rounded-2xl flex items-start gap-3',
                                        isDarkMode
                                            ? 'bg-amber-500/10 border border-amber-500/30'
                                            : 'bg-amber-50 border border-amber-200/50'
                                    )}
                                >
                                    <Lightbulb size={24} className={isDarkMode ? 'text-amber-400 mt-0.5' : 'text-amber-600 mt-0.5'} />
                                    <p
                                        className={cn(
                                            'text-lg md:text-xl italic',
                                            isDarkMode ? 'text-amber-200' : 'text-amber-800'
                                        )}
                                        style={{ fontFamily: "'Patrick Hand', cursive" }}
                                    >
                                        {viewingConcept.shortcut}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    );
};

export default ResourceCanvas;
