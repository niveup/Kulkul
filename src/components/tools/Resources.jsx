import React, { useState, useRef } from 'react';
import formulas11 from '../../data/formulas_11.json';
import formulas12 from '../../data/formulas_12.json';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { Search, BookOpen, ChevronRight, Star, Bookmark, Zap, Edit3 } from 'lucide-react';

// Helper component to render LaTeX
const KatexRenderer = ({ latex }) => {
    const containerRef = useRef(null);

    React.useEffect(() => {
        if (containerRef.current && latex) {
            try {
                katex.render(latex, containerRef.current, {
                    throwOnError: false,
                    displayMode: true,
                    trust: true
                });
            } catch (error) {
                console.error('KaTeX render error:', error);
                containerRef.current.textContent = latex;
            }
        }
    }, [latex]);

    return <span ref={containerRef} />;
};

// Helper to render text with bold markdown, newlines, numbered points, and subscripts
const MixedTextRenderer = ({ text }) => {
    if (!text) return null;

    // First, add line breaks before numbered points (1. 2. 3. etc.) but not at the start
    let processedText = text.replace(/\s+(\d+\.)\s/g, '\n$1 ');

    // Split by explicit newlines
    const lines = processedText.split(/\\n|\n/);

    // Function to render a part with subscripts
    const renderWithSubscripts = (str, key) => {
        // Match patterns like X_L, λ_min, T_1/2, n_e, etc.
        const parts = str.split(/([A-Za-zλαβγδ]+_[A-Za-z0-9/]+)/g);
        return parts.map((part, i) => {
            if (part.includes('_')) {
                const [base, sub] = part.split('_');
                return (
                    <span key={`${key}-${i}`}>
                        {base}<sub className="text-xs">{sub}</sub>
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
                            return <strong key={i} className="text-slate-900 font-bold">{renderWithSubscripts(part.slice(2, -2), `b-${i}`)}</strong>;
                        }
                        return <span key={i}>{renderWithSubscripts(part, `p-${i}`)}</span>;
                    })}
                </React.Fragment>
            ))}
        </>
    );
};

const Resources = () => {
    const [selectedClass, setSelectedClass] = useState('12');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const formulas = selectedClass === '11' ? formulas11 : formulas12;
    const topics = formulas.map(f => f.topic);

    const filteredTopics = topics.filter(topic =>
        topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedFormula = formulas.find(f => f.topic === selectedTopic);

    // Helper function to extract number from concept name for sorting
    const getConceptNumber = (concept) => {
        const match = concept.concept?.match(/^(\d+)\./);
        return match ? parseInt(match[1], 10) : 999;
    };

    // Sort ALL concepts by their number (no JEE/other split)
    const sortedConcepts = [...(selectedFormula?.concepts || [])].sort(
        (a, b) => getConceptNumber(a) - getConceptNumber(b)
    );

    return (
        <div className="flex gap-4 h-full w-full mx-auto font-sans">

            {/* LEFT SIDEBAR - Compact Topics */}
            <div className="w-56 flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">

                {/* Class Selector Tabs */}
                <div className="p-3 border-b border-slate-100">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['11', '12'].map((cls) => (
                            <button
                                key={cls}
                                onClick={() => { setSelectedClass(cls); setSelectedTopic(null); }}
                                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${selectedClass === cls
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Class {cls}th
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Topic List */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredTopics.map((topic, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedTopic(topic)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all group ${selectedTopic === topic
                                ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            <span className="truncate">{topic}</span>
                            {selectedTopic === topic && (
                                <Edit3 size={12} className="text-indigo-400 flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL - Maximized Content */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {!selectedTopic ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center bg-slate-50/30">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm border border-slate-100">
                            <span className="text-4xl">📚</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Chapter</h3>
                        <p className="text-slate-500">Choose a chapter from the sidebar to start studying.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/10">

                        {/* ALL CONCEPTS - Single Unified Grid (sorted by number) */}
                        {sortedConcepts.length > 0 && (
                            <div className="animate-fadeIn">
                                {/* 2-Column Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sortedConcepts.map((concept, idx) => (
                                        <div key={`concept-${idx}`} className="bg-white rounded-xl p-5 border-l-4 border-l-amber-400 border border-amber-100 shadow-sm hover:shadow-md transition-all">
                                            {/* Concept Title */}
                                            <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                                {concept.concept}
                                            </h3>

                                            {/* Theory/Content */}
                                            {(concept.theory || concept.content || concept.details) && (
                                                <div className="text-slate-600 text-lg leading-relaxed mb-3" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                                    {concept.theory && <MixedTextRenderer text={concept.theory} />}
                                                    {concept.content && (
                                                        <div className="mt-1 whitespace-pre-line">
                                                            <MixedTextRenderer text={concept.content} />
                                                        </div>
                                                    )}
                                                    {concept.details && (
                                                        <div className="mt-1">
                                                            <MixedTextRenderer text={concept.details} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Formula */}
                                            {concept.formula && (
                                                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 overflow-x-auto flex justify-center">
                                                    <KatexRenderer latex={concept.formula} />
                                                </div>
                                            )}

                                            {/* Shortcut/Tip */}
                                            {concept.shortcut && (
                                                <div className="mt-3 p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                                                    <p className="text-slate-700 italic text-base" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                                                        💡 <MixedTextRenderer text={concept.shortcut} />
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default Resources;
