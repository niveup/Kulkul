import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import formulas11 from '../../data/formulas_11.json';
import formulas12 from '../../data/formulas_12.json';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { Search, ChevronDown, Atom, Calculator, Beaker, PieChart, Moon, Sun, Clock, Sparkles, BookOpen, Lightbulb, X, Maximize2 } from 'lucide-react';
import TopicAnalysisModal from './TopicAnalysisModal';
import { shouldUseLocalStorage } from '../../utils/authMode';

// ============================================================================
// DESIGN SYSTEM - Apple-esque Muted Palette
// ============================================================================
const colors = {
    light: {
        bg: 'bg-slate-50',
        card: 'bg-white/80',
        cardHover: 'hover:bg-white',
        border: 'border-slate-200/60',
        text: 'text-slate-800',
        textMuted: 'text-slate-500',
        accent: 'text-blue-600',
        accentBg: 'bg-blue-600',
        formulaBg: 'bg-gradient-to-br from-slate-50 to-blue-50/50',
    },
    dark: {
        bg: 'bg-slate-950',
        card: 'bg-slate-900/80',
        cardHover: 'hover:bg-slate-800/90',
        border: 'border-slate-800/60',
        text: 'text-slate-100',
        textMuted: 'text-slate-400',
        accent: 'text-blue-400',
        accentBg: 'bg-blue-500',
        formulaBg: 'bg-gradient-to-br from-slate-900 to-blue-950/30',
    }
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

const dropdownVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: -10
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: { duration: 0.15 }
    }
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
const KatexRenderer = ({ latex }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current && latex) {
            try {
                katex.render(latex, containerRef.current, {
                    throwOnError: false,
                    displayMode: true,
                    trust: true
                });
            } catch (error) {
                containerRef.current.textContent = latex;
            }
        }
    }, [latex]);
    return <span ref={containerRef} className="katex-display-wrapper" />;
};

const MixedTextRenderer = ({ text, isDarkMode }) => {
    if (!text) return null;
    const processedText = text.replace(/\s+(\d+\.)\s/g, '\n$1 ');
    const lines = processedText.split(/\\n|\n/);

    const renderWithSubscripts = (str, key) => {
        const parts = str.split(/([A-Za-zλαβγδ]+_[A-Za-z0-9/]+)/g);
        return parts.map((part, i) => {
            if (part.includes('_')) {
                const [base, sub] = part.split('_');
                return (
                    <span key={`${key}-${i}`}>
                        {base}<sub className="text-xs opacity-70">{sub}</sub>
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <>
            {lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {line.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                                <strong
                                    key={i}
                                    className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                >
                                    {renderWithSubscripts(part.slice(2, -2), `b-${i}`)}
                                </strong>
                            );
                        }
                        return (
                            <span
                                key={i}
                                className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}
                            >
                                {renderWithSubscripts(part, `p-${i}`)}
                            </span>
                        );
                    })}
                </React.Fragment>
            ))}
        </>
    );
};

// Subject Icon Component
const SubjectIcon = ({ subject, isActive, isDarkMode }) => {
    const iconClass = isActive
        ? 'text-white'
        : isDarkMode ? 'text-slate-400' : 'text-slate-500';

    if (subject === 'Physics') return <Atom size={18} className={iconClass} />;
    if (subject === 'Chemistry') return <Beaker size={18} className={iconClass} />;
    if (subject === 'Math') return <Calculator size={18} className={iconClass} />;
    return <BookOpen size={18} className={iconClass} />;
};

// ============================================================================
// CONCEPT CARD COMPONENT (Clickable)
// ============================================================================
const ConceptCard = ({ concept, index, isDarkMode, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={cardVariants}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-2xl p-5
                backdrop-blur-xl border cursor-pointer
                transition-all duration-300 break-inside-avoid mb-4
                ${isDarkMode
                    ? 'bg-slate-900/60 border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800/80'
                    : 'bg-white/70 border-slate-200/80 hover:border-blue-300/50 hover:bg-white/90'
                }
                ${isHovered ? 'shadow-xl shadow-blue-500/5' : 'shadow-lg shadow-slate-900/5'}
            `}
            style={{
                transform: isHovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
            }}
        >
            {/* Expand hint icon */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className={`absolute top-3 left-3 p-1.5 rounded-lg z-20 ${isDarkMode ? 'bg-slate-800/80 text-blue-400' : 'bg-white/80 text-blue-600'}`}
            >
                <Maximize2 size={14} />
            </motion.div>

            {/* Subtle gradient overlay on hover */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className={`absolute inset-0 pointer-events-none ${isDarkMode
                    ? 'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5'
                    : 'bg-gradient-to-br from-blue-100/30 via-transparent to-purple-100/20'
                    }`}
            />

            {/* Content */}
            <div className="relative z-10">
                {/* Concept Title */}
                <h3
                    className={`text-xl font-bold mb-3 leading-tight pr-16 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    style={{ fontFamily: "'Patrick Hand', cursive" }}
                >
                    {concept.concept}
                </h3>

                {/* Theory/Content */}
                {(concept.theory || concept.content || concept.details) && (
                    <div
                        className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                        style={{ fontFamily: "'Patrick Hand', cursive" }}
                    >
                        {concept.theory && <MixedTextRenderer text={concept.theory} isDarkMode={isDarkMode} />}
                        {concept.content && (
                            <div className="mt-2 whitespace-pre-line">
                                <MixedTextRenderer text={concept.content} isDarkMode={isDarkMode} />
                            </div>
                        )}
                        {concept.details && (
                            <div className="mt-2">
                                <MixedTextRenderer text={concept.details} isDarkMode={isDarkMode} />
                            </div>
                        )}
                    </div>
                )}

                {/* Formula - Premium Display */}
                {concept.formula && (
                    <div
                        className={`
                            relative p-4 rounded-xl overflow-x-auto
                            flex items-center justify-center
                            ${isDarkMode
                                ? 'bg-gradient-to-br from-slate-800/80 to-blue-900/20 border border-blue-500/20'
                                : 'bg-gradient-to-br from-slate-50 to-blue-50/80 border border-blue-200/50'
                            }
                        `}
                    >
                        <div className={isDarkMode ? 'text-slate-100' : 'text-slate-800'}>
                            <KatexRenderer latex={concept.formula} />
                        </div>
                    </div>
                )}

                {/* Shortcut/Tip Badge */}
                {concept.shortcut && (
                    <div
                        className={`
                            mt-4 p-3 rounded-xl flex items-start gap-2
                            ${isDarkMode
                                ? 'bg-amber-500/10 border border-amber-500/20'
                                : 'bg-amber-50 border border-amber-200/50'
                            }
                        `}
                    >
                        <Lightbulb size={16} className={isDarkMode ? 'text-amber-400 mt-0.5' : 'text-amber-600 mt-0.5'} />
                        <p
                            className={`text-sm italic ${isDarkMode ? 'text-amber-200/90' : 'text-amber-800'}`}
                            style={{ fontFamily: "'Patrick Hand', cursive" }}
                        >
                            <MixedTextRenderer text={concept.shortcut} isDarkMode={isDarkMode} />
                        </p>
                    </div>
                )}

                {/* JEE Favorite Badge */}
                {concept.isJeeFav && (
                    <div className={`
                        absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold
                        flex items-center gap-1
                        ${isDarkMode
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }
                    `}>
                        <Sparkles size={10} />
                        JEE
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ============================================================================
// EXPANDED CARD MODAL (Fullscreen with larger text)
// ============================================================================
const ExpandedCardModal = ({ concept, isDarkMode, onClose }) => {
    if (!concept) return null;

    // Use createPortal to render modal at document root level
    return ReactDOM.createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 md:p-8"
            style={{ zIndex: 99999 }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 ${isDarkMode ? 'bg-black/90' : 'bg-black/70'}`}
                style={{ backdropFilter: 'blur(8px)' }}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className={`
                    relative w-full max-w-4xl max-h-[85vh] overflow-y-auto
                    rounded-3xl p-8 md:p-10 shadow-2xl
                    ${isDarkMode
                        ? 'bg-slate-800 border border-slate-600'
                        : 'bg-white border border-slate-200'
                    }
                `}
                style={{ zIndex: 1 }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`
                        absolute top-4 right-4 p-2.5 rounded-xl transition-all
                        ${isDarkMode
                            ? 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'
                            : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                        }
                    `}
                >
                    <X size={22} />
                </button>

                {/* JEE Badge */}
                {concept.isJeeFav && (
                    <div className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold mb-4
                        ${isDarkMode
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }
                    `}>
                        <Sparkles size={14} />
                        JEE Important
                    </div>
                )}

                {/* Concept Title - LARGER */}
                <h2
                    className={`text-3xl md:text-4xl font-bold mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    style={{ fontFamily: "'Patrick Hand', cursive" }}
                >
                    {concept.concept}
                </h2>

                {/* Theory/Content - LARGER */}
                {(concept.theory || concept.content || concept.details) && (
                    <div
                        className={`text-xl md:text-2xl leading-relaxed mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}
                        style={{ fontFamily: "'Patrick Hand', cursive" }}
                    >
                        {concept.theory && <MixedTextRenderer text={concept.theory} isDarkMode={isDarkMode} />}
                        {concept.content && (
                            <div className="mt-3 whitespace-pre-line">
                                <MixedTextRenderer text={concept.content} isDarkMode={isDarkMode} />
                            </div>
                        )}
                        {concept.details && (
                            <div className="mt-3">
                                <MixedTextRenderer text={concept.details} isDarkMode={isDarkMode} />
                            </div>
                        )}
                    </div>
                )}

                {/* Formula - LARGER & CENTERED */}
                {concept.formula && (
                    <div
                        className={`
                            p-6 md:p-8 rounded-2xl overflow-x-auto
                            flex items-center justify-center
                            ${isDarkMode
                                ? 'bg-slate-900 border border-slate-600'
                                : 'bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200/50'
                            }
                        `}
                    >
                        <div className={`scale-125 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            <KatexRenderer latex={concept.formula} />
                        </div>
                    </div>
                )}

                {/* Shortcut/Tip - LARGER */}
                {concept.shortcut && (
                    <div
                        className={`
                            mt-6 p-5 rounded-2xl flex items-start gap-3
                            ${isDarkMode
                                ? 'bg-amber-500/10 border border-amber-500/30'
                                : 'bg-amber-50 border border-amber-200/50'
                            }
                        `}
                    >
                        <Lightbulb size={24} className={isDarkMode ? 'text-amber-400 mt-0.5' : 'text-amber-600 mt-0.5'} />
                        <p
                            className={`text-lg md:text-xl italic ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}
                            style={{ fontFamily: "'Patrick Hand', cursive" }}
                        >
                            <MixedTextRenderer text={concept.shortcut} isDarkMode={isDarkMode} />
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>,
        document.body
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Resources = ({ isDarkMode, onToggleTheme }) => {
    // --- STATE ---
    const [selectedClass, setSelectedClass] = useState('12');
    const [selectedSubject, setSelectedSubject] = useState('Physics');
    const [selectedTopic, setSelectedTopic] = useState('Electrostatics');
    const [searchTerm, setSearchTerm] = useState('');
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [activeMenu, setActiveMenu] = useState(null);
    const [expandedConcept, setExpandedConcept] = useState(null);

    // Refs
    const topicStartTimeRef = useRef(Date.now());
    const currentTopicRef = useRef({ cls: '12', subject: 'Physics', topic: 'Electrostatics' });
    const menuRef = useRef(null);

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (topicStartTimeRef.current) {
                const elapsed = Math.floor((Date.now() - topicStartTimeRef.current) / 1000);
                setElapsedSeconds(elapsed);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Log review function
    const logReviewIfQualified = useCallback(() => {
        if (!topicStartTimeRef.current) return;
        const timeSpent = (Date.now() - topicStartTimeRef.current) / 1000 / 60;
        const { cls, subject, topic } = currentTopicRef.current;

        if (timeSpent >= 5 && subject === 'Physics' && !shouldUseLocalStorage()) {
            const topicId = `${cls}-${subject.toLowerCase()}-${topic.toLowerCase().replace(/\s+/g, '-')}`;
            fetch('/api/srs/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicId, topicName: topic, classLevel: cls, subject })
            }).catch(err => console.log('[SRS] Topic review logging failed:', err));
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        const handleBeforeUnload = () => logReviewIfQualified();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            logReviewIfQualified();
        };
    }, [logReviewIfQualified]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- DATA ---
    const getFormulasForClass = (cls) => cls === '11' ? formulas11 : formulas12;
    const getTopicsForClassAndSubject = (cls, subject) => {
        if (subject === 'Physics') return getFormulasForClass(cls).map(f => f.topic);
        if (subject === 'Chemistry') return ['Atomic Structure', 'Chemical Bonding', 'Thermodynamics'];
        if (subject === 'Math') return ['Sets', 'Relations & Functions', 'Trigonometry'];
        return [];
    };

    const handleTopicClick = (cls, subject, topic) => {
        logReviewIfQualified();
        topicStartTimeRef.current = Date.now();
        currentTopicRef.current = { cls, subject, topic };
        setElapsedSeconds(0);
        setSelectedClass(cls);
        setSelectedSubject(subject);
        setSelectedTopic(topic);
        setActiveMenu(null);
    };

    const selectedFormula = (selectedClass === '11' ? formulas11 : formulas12).find(f => f.topic === selectedTopic);

    // Sorting
    const getConceptNumber = (concept) => {
        const match = concept.concept?.match(/^(\d+)\./);
        return match ? parseInt(match[1], 10) : 999;
    };
    const sortedConcepts = [...(selectedFormula?.concepts || [])].sort(
        (a, b) => getConceptNumber(a) - getConceptNumber(b)
    );

    // Universal Search
    const universalSearchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const results = [];
        const term = searchTerm.toLowerCase();

        [formulas11, formulas12].forEach((formulas, classIndex) => {
            formulas.forEach(chapter => {
                chapter.concepts?.forEach(concept => {
                    if (
                        concept.concept?.toLowerCase().includes(term) ||
                        concept.theory?.toLowerCase().includes(term) ||
                        concept.formula?.toLowerCase().includes(term)
                    ) {
                        results.push({
                            ...concept,
                            chapterName: chapter.topic,
                            className: classIndex === 0 ? '11' : '12'
                        });
                    }
                });
            });
        });

        return results.slice(0, 20);
    }, [searchTerm]);

    // Filter concepts
    const filteredConcepts = sortedConcepts.filter(c =>
        c.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.theory?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Theme colors
    const theme = isDarkMode ? colors.dark : colors.light;

    return (
        <div className={`min-h-screen w-full transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>

            {/* ============ NAVIGATION BAR ============ */}
            <nav
                ref={menuRef}
                className={`
                    sticky top-0 z-50 px-4 py-3
                    backdrop-blur-2xl border-b
                    ${isDarkMode
                        ? 'bg-slate-950/80 border-slate-800/50'
                        : 'bg-white/80 border-slate-200/50'
                    }
                `}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

                    {/* Left: Class Selectors */}
                    <div className="flex items-center gap-2">
                        {['11', '12'].map((cls) => (
                            <div key={cls} className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveMenu(activeMenu === cls ? null : cls)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
                                        transition-all duration-200
                                        ${activeMenu === cls
                                            ? isDarkMode
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                                : 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                            : isDarkMode
                                                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }
                                    `}
                                >
                                    Class {cls}
                                    <motion.div
                                        animate={{ rotate: activeMenu === cls ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={16} />
                                    </motion.div>
                                </motion.button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {activeMenu === cls && (
                                        <motion.div
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className={`
                                                absolute top-full left-0 mt-2 w-[650px] p-5
                                                rounded-2xl border shadow-2xl
                                                backdrop-blur-2xl z-50
                                                grid grid-cols-12 gap-5
                                                ${isDarkMode
                                                    ? 'bg-slate-900/95 border-slate-700/50'
                                                    : 'bg-white/95 border-slate-200/50'
                                                }
                                            `}
                                        >
                                            {/* Subjects Column */}
                                            <div className={`col-span-4 border-r pr-4 ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    Subjects
                                                </h4>
                                                <div className="space-y-1">
                                                    {['Physics', 'Chemistry', 'Math'].map(subj => (
                                                        <motion.button
                                                            key={subj}
                                                            whileHover={{ x: 4 }}
                                                            onClick={() => setSelectedSubject(subj)}
                                                            className={`
                                                                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                                text-left font-medium transition-all
                                                                ${selectedSubject === subj
                                                                    ? isDarkMode
                                                                        ? 'bg-blue-500/20 text-blue-300'
                                                                        : 'bg-blue-100 text-blue-700'
                                                                    : isDarkMode
                                                                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                                }
                                                            `}
                                                        >
                                                            <div className={`
                                                                p-2 rounded-lg
                                                                ${selectedSubject === subj
                                                                    ? isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
                                                                    : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                                                                }
                                                            `}>
                                                                <SubjectIcon subject={subj} isActive={selectedSubject === subj} isDarkMode={isDarkMode} />
                                                            </div>
                                                            {subj}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Topics Column */}
                                            <div className="col-span-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 sticky top-0 py-1 backdrop-blur-sm ${isDarkMode ? 'text-blue-400 bg-slate-900/80' : 'text-blue-600 bg-white/80'}`}>
                                                    {selectedSubject} Chapters
                                                </h4>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {getTopicsForClassAndSubject(cls, selectedSubject).map((topic, i) => (
                                                        <motion.button
                                                            key={i}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleTopicClick(cls, selectedSubject, topic)}
                                                            className={`
                                                                text-left px-3 py-2 rounded-lg text-sm font-medium
                                                                transition-all truncate
                                                                ${isDarkMode
                                                                    ? 'text-slate-400 hover:text-white hover:bg-blue-500/20'
                                                                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                                                                }
                                                            `}
                                                        >
                                                            {topic}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        {/* Current Topic Badge */}
                        <div className={`h-6 w-px mx-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                        <motion.div
                            key={selectedTopic}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                                px-3 py-1.5 rounded-lg text-sm font-semibold
                                ${isDarkMode
                                    ? 'bg-slate-800 text-slate-200'
                                    : 'bg-slate-100 text-slate-700'
                                }
                            `}
                        >
                            {selectedTopic}
                        </motion.div>

                        {/* Study Timer */}
                        <motion.div
                            animate={{
                                backgroundColor: elapsedSeconds >= 300
                                    ? isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'
                                    : isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)'
                            }}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold
                                ${elapsedSeconds >= 300
                                    ? isDarkMode ? 'text-green-400' : 'text-green-600'
                                    : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }
                            `}
                        >
                            <Clock size={12} />
                            <span>{String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}</span>
                            {elapsedSeconds >= 300 && <span className="text-[10px]">✓</span>}
                        </motion.div>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-3">
                        {/* Analysis Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsChartModalOpen(true)}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                                transition-all shadow-lg
                                ${isDarkMode
                                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/25'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                                }
                            `}
                        >
                            <PieChart size={14} />
                            <span className="hidden sm:inline">Analysis</span>
                        </motion.button>

                        {/* Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onToggleTheme}
                            className={`
                                p-2 rounded-xl transition-colors
                                ${isDarkMode
                                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }
                            `}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>

                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                            </div>
                            <input
                                type="text"
                                className={`
                                    w-64 pl-9 pr-4 py-2 rounded-xl text-sm font-medium
                                    border outline-none transition-all
                                    ${isDarkMode
                                        ? 'bg-slate-800/50 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:bg-slate-800'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-300 focus:bg-white'
                                    }
                                `}
                                placeholder="Search all chapters..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {searchTerm.trim() && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`
                                            absolute top-full right-0 mt-2 w-80 max-h-[400px] overflow-y-auto
                                            rounded-xl border shadow-2xl backdrop-blur-xl z-50
                                            ${isDarkMode
                                                ? 'bg-slate-900/95 border-slate-700/50'
                                                : 'bg-white/95 border-slate-200/50'
                                            }
                                        `}
                                    >
                                        {universalSearchResults.length > 0 ? (
                                            <>
                                                <div className={`px-3 py-2 border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500 border-slate-700/50' : 'text-slate-400 border-slate-200'}`}>
                                                    {universalSearchResults.length} results
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    {universalSearchResults.map((result, idx) => (
                                                        <motion.button
                                                            key={idx}
                                                            whileHover={{ x: 4 }}
                                                            onClick={() => {
                                                                handleTopicClick(result.className, 'Physics', result.chapterName);
                                                                setSearchTerm('');
                                                            }}
                                                            className={`
                                                                w-full text-left px-3 py-2 rounded-lg transition-colors
                                                                ${isDarkMode
                                                                    ? 'hover:bg-blue-500/20'
                                                                    : 'hover:bg-blue-50'
                                                                }
                                                            `}
                                                        >
                                                            <div className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                                {result.concept}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.className === '11'
                                                                    ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                                                                    : isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    Class {result.className}
                                                                </span>
                                                                <span className={`text-xs truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {result.chapterName}
                                                                </span>
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                No results for "{searchTerm}"
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ============ MAIN CONTENT ============ */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {filteredConcepts.length > 0 ? (
                    <motion.div
                        key={selectedTopic}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="columns-1 md:columns-2 lg:columns-2 xl:columns-3 gap-4"
                        style={{ columnFill: 'balance' }}
                    >
                        {filteredConcepts.map((concept, idx) => (
                            <ConceptCard
                                key={`${selectedTopic}-${idx}`}
                                concept={concept}
                                index={idx}
                                isDarkMode={isDarkMode}
                                onClick={() => setExpandedConcept(concept)}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="text-6xl mb-4 opacity-50">
                            {selectedSubject !== 'Physics' ? '🧪' : '🔍'}
                        </div>
                        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {selectedSubject !== 'Physics' ? 'Coming Soon!' : 'No results found'}
                        </h3>
                        <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {selectedSubject !== 'Physics'
                                ? `Notes for ${selectedSubject} are being prepared.`
                                : 'Try searching for something else.'
                            }
                        </p>
                    </motion.div>
                )}
            </main>

            {/* Topic Analysis Modal */}
            <TopicAnalysisModal
                isOpen={isChartModalOpen}
                onClose={() => setIsChartModalOpen(false)}
                topicData={selectedFormula}
                isDarkMode={isDarkMode}
            />

            {/* Expanded Concept Modal */}
            <AnimatePresence>
                {expandedConcept && (
                    <ExpandedCardModal
                        concept={expandedConcept}
                        isDarkMode={isDarkMode}
                        onClose={() => setExpandedConcept(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Resources;
