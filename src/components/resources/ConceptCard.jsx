import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Pencil, Check, Sparkles, Lightbulb } from 'lucide-react';
import { KatexRenderer, MixedTextRenderer } from '../common/Renderers';
import DifficultyBadge from './DifficultyBadge';
import TagChip from './TagChip';
import { useMastery, useResourceActions } from '../../store/resourceStore';


const ConceptCard = memo(({ concept, index, isDarkMode, onClick, onEdit }) => {
    const mastery = useMastery();
    const { updateMastery } = useResourceActions();
    const masteryLevel = mastery[concept.id] || 0;

    const [isHovered, setIsHovered] = useState(false);

    const handleMasteryClick = (e) => {
        e.stopPropagation();
        const nextLevel = (masteryLevel + 25) % 125;
        updateMastery(concept.id, nextLevel);
    };

    return (
        <motion.div
            layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-2xl p-5
                backdrop-blur-xl border cursor-pointer
                transition-all duration-500 break-inside-avoid mb-4
                ${isDarkMode
                    ? 'bg-slate-900/60 border-slate-700/50 hover:border-emerald-500/40 hover:bg-slate-800/80 shadow-slate-950/20'
                    : 'bg-white/70 border-slate-200/80 hover:border-emerald-300/50 hover:bg-white/90 shadow-slate-200/50'
                }
                ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
            `}
            style={{
                y: isHovered ? -4 : 0,
                rotateX: isHovered ? 2 : 0,
                rotateY: isHovered ? -2 : 0,
                perspective: 1000
            }}
        >
            {/* Expand hint icon */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className={`absolute top-3 left-3 p-1.5 rounded-lg z-20 ${isDarkMode ? 'bg-slate-800/80 text-emerald-400' : 'bg-white/80 text-emerald-600'}`}
            >
                <Maximize2 size={14} />
            </motion.div>

            {/* Subtle gradient overlay on hover */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className={`absolute inset-0 pointer-events-none ${isDarkMode
                    ? 'bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5'
                    : 'bg-gradient-to-br from-emerald-100/30 via-transparent to-teal-100/20'
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
                                ? 'bg-gradient-to-br from-slate-800/80 to-emerald-950/20 border border-emerald-500/20'
                                : 'bg-gradient-to-br from-slate-50 to-emerald-50/80 border border-emerald-200/50'
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

                {/* Phase 1: Difficulty Badge and Tags */}
                {(concept.difficulty || concept.tags?.length > 0) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {concept.difficulty && (
                            <DifficultyBadge
                                difficulty={concept.difficulty}
                                isDarkMode={isDarkMode}
                                size="sm"
                            />
                        )}
                        {concept.tags?.slice(0, 3).map(tag => (
                            <TagChip
                                key={tag}
                                tagId={tag}
                                isDarkMode={isDarkMode}
                                size="xs"
                            />
                        ))}
                        {concept.tags?.length > 3 && (
                            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                +{concept.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}


                {/* Mastery Progress Bar */}
                <div
                    onClick={handleMasteryClick}
                    className="mt-6 h-1.5 w-full bg-slate-200/30 dark:bg-slate-700/30 rounded-full overflow-hidden relative cursor-pointer group/mastery"
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${masteryLevel}%` }}
                        className={`h-full rounded-full ${masteryLevel === 100
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                            : 'bg-emerald-500/60'
                            }`}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/mastery:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-2 rounded-full shadow-sm">
                            Mastery: {masteryLevel}%
                        </span>
                    </div>
                </div>

            </div>
        </motion.div>
    );
});

export default ConceptCard;
