/**
 * WidgetEditor - Modal for Editing Widget Content
 * 
 * Features:
 * - Edit concept name, theory, formula, shortcut
 * - Live LaTeX preview
 * - Glassmorphism modal design
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useResourceActions } from '../../store/resourceStore';
import { cn } from '../../lib/utils';
import { X, Save, Eye, Code } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// =============================================================================
// LATEX PREVIEW
// =============================================================================
const LatexPreview = ({ latex, isDarkMode }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && latex) {
            try {
                katex.render(latex, ref.current, {
                    throwOnError: false,
                    displayMode: true,
                    trust: true
                });
            } catch (e) {
                ref.current.textContent = 'Invalid LaTeX';
            }
        }
    }, [latex]);

    return (
        <div
            className={cn(
                'p-4 rounded-xl min-h-[60px] flex items-center justify-center',
                isDarkMode
                    ? 'bg-slate-800 border border-slate-700'
                    : 'bg-slate-50 border border-slate-200'
            )}
        >
            <span ref={ref} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const WidgetEditor = ({ widget, onClose, isDarkMode, classLevel, subject, topicKey }) => {
    const { updateWidgetContent } = useResourceActions();
    const [formData, setFormData] = useState({
        concept: '',
        theory: '',
        formula: '',
        shortcut: ''
    });
    const [showLatexPreview, setShowLatexPreview] = useState(true);

    // Initialize form when widget changes
    useEffect(() => {
        if (widget) {
            setFormData({
                concept: widget.concept || '',
                theory: widget.theory || '',
                formula: widget.formula || '',
                shortcut: widget.shortcut || ''
            });
        }
    }, [widget]);

    // Handle save
    const handleSave = () => {
        if (!widget) return;

        updateWidgetContent(classLevel, subject, topicKey, widget.id, formData);
        onClose();
    };

    // Handle input change
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!widget) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center p-4 md:p-8 z-[99999]"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div
                    className={cn('absolute inset-0', isDarkMode ? 'bg-black/80' : 'bg-black/60')}
                    style={{ backdropFilter: 'blur(8px)' }}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        'relative w-full max-w-2xl max-h-[85vh] overflow-y-auto',
                        'rounded-3xl p-6 md:p-8 shadow-2xl',
                        isDarkMode
                            ? 'bg-slate-900 border border-slate-700'
                            : 'bg-white border border-slate-200'
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Edit Concept
                        </h2>
                        <button
                            onClick={onClose}
                            className={cn(
                                'p-2 rounded-xl transition-colors',
                                isDarkMode
                                    ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                            )}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        {/* Concept Name */}
                        <div>
                            <label className={cn('block text-sm font-semibold mb-2', isDarkMode ? 'text-slate-300' : 'text-slate-700')}>
                                Concept Name
                            </label>
                            <input
                                type="text"
                                value={formData.concept}
                                onChange={(e) => handleChange('concept', e.target.value)}
                                className={cn(
                                    'w-full px-4 py-3 rounded-xl border text-base transition-colors',
                                    isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                                )}
                                placeholder="e.g., Newton's First Law"
                            />
                        </div>

                        {/* Theory */}
                        <div>
                            <label className={cn('block text-sm font-semibold mb-2', isDarkMode ? 'text-slate-300' : 'text-slate-700')}>
                                Theory / Description
                            </label>
                            <textarea
                                value={formData.theory}
                                onChange={(e) => handleChange('theory', e.target.value)}
                                rows={4}
                                className={cn(
                                    'w-full px-4 py-3 rounded-xl border text-base transition-colors resize-none',
                                    isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                                )}
                                placeholder="Explain the concept..."
                            />
                        </div>

                        {/* Formula */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={cn('text-sm font-semibold', isDarkMode ? 'text-slate-300' : 'text-slate-700')}>
                                    Formula (LaTeX)
                                </label>
                                <button
                                    onClick={() => setShowLatexPreview(!showLatexPreview)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                                        isDarkMode
                                            ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                            : 'bg-slate-100 text-slate-500 hover:text-slate-700'
                                    )}
                                >
                                    {showLatexPreview ? <Code size={12} /> : <Eye size={12} />}
                                    {showLatexPreview ? 'Show Code' : 'Preview'}
                                </button>
                            </div>
                            <textarea
                                value={formData.formula}
                                onChange={(e) => handleChange('formula', e.target.value)}
                                rows={2}
                                className={cn(
                                    'w-full px-4 py-3 rounded-xl border font-mono text-sm transition-colors resize-none',
                                    isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                                )}
                                placeholder="e.g., F = ma"
                            />
                            {showLatexPreview && formData.formula && (
                                <div className="mt-2">
                                    <LatexPreview latex={formData.formula} isDarkMode={isDarkMode} />
                                </div>
                            )}
                        </div>

                        {/* Shortcut/Tip */}
                        <div>
                            <label className={cn('block text-sm font-semibold mb-2', isDarkMode ? 'text-slate-300' : 'text-slate-700')}>
                                Shortcut / Tip (Optional)
                            </label>
                            <textarea
                                value={formData.shortcut}
                                onChange={(e) => handleChange('shortcut', e.target.value)}
                                rows={2}
                                className={cn(
                                    'w-full px-4 py-3 rounded-xl border text-base transition-colors resize-none',
                                    isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                                )}
                                placeholder="Quick memory trick or important note..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={onClose}
                            className={cn(
                                'px-4 py-2.5 rounded-xl font-medium text-sm transition-colors',
                                isDarkMode
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-colors"
                        >
                            <Save size={16} />
                            Save Changes
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default WidgetEditor;
