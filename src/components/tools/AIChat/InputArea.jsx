/**
 * InputArea - Dynamic Island-style chat input
 * 
 * Features:
 * - Floating capsule design
 * - Auto-growing textarea
 * - Attachment & Voice buttons
 * - Send button with animation
 * - Focus state glow effect
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';

// Inline spring config
const springSnappy = { type: 'spring', stiffness: 400, damping: 25, mass: 0.5 };

// =============================================================================
// Main Component
// =============================================================================

const InputArea = ({
    value,
    onChange,
    onSend,
    disabled,
    placeholder = "Message...",
}) => {
    const textareaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [rows, setRows] = useState(1);

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
            setRows(Math.min(Math.ceil(newHeight / 24), 8));
        }
    }, [value]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) {
                onSend(value);
            }
        }
    }, [disabled, value, onSend]);

    const handleSend = useCallback(() => {
        if (!disabled && value.trim()) {
            onSend(value);
        }
    }, [disabled, value, onSend]);

    const hasContent = value.trim().length > 0;

    return (
        <div className={cn(
            'px-4 py-4',
            'border-t border-white/10 dark:border-white/5',
            'bg-white/30 dark:bg-white/5',
        )}>
            {/* Input Container - Full width, no rounded corners */}
            <motion.div
                animate={{
                    boxShadow: isFocused
                        ? '0 0 0 1px rgba(99, 102, 241, 0.3)'
                        : '0 0 0 0px transparent',
                }}
                transition={springSnappy}
                className={cn(
                    'relative flex items-end gap-2',
                    'px-3 py-2',
                    'bg-white/70 dark:bg-white/10',
                    'backdrop-blur-xl',
                    'transition-colors',
                )}
            >
                {/* Left Tools */}
                <div className="flex items-center gap-1 pb-1">
                    {/* Attachment Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                            'p-2 rounded-xl',
                            'text-slate-400 dark:text-slate-500',
                            'hover:text-indigo-500 dark:hover:text-indigo-400',
                            'hover:bg-indigo-500/10',
                            'transition-colors',
                        )}
                        title="Attach file"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </motion.button>

                    {/* Voice Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                            'p-2 rounded-xl',
                            'text-slate-400 dark:text-slate-500',
                            'hover:text-indigo-500 dark:hover:text-indigo-400',
                            'hover:bg-indigo-500/10',
                            'transition-colors',
                        )}
                        title="Voice input"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </motion.button>
                </div>

                {/* Textarea */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            'w-full resize-none',
                            'bg-transparent border-none outline-none',
                            'text-slate-800 dark:text-white',
                            'placeholder-slate-400 dark:placeholder-slate-500',
                            'text-sm leading-6',
                            'max-h-[200px]',
                            disabled && 'opacity-50 cursor-not-allowed',
                        )}
                        style={{
                            minHeight: '24px',
                            overflowY: rows > 6 ? 'auto' : 'hidden',
                        }}
                    />
                </div>

                {/* Send Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={disabled || !hasContent}
                    className={cn(
                        'flex-shrink-0 p-2.5 rounded-xl',
                        'transition-all duration-200',
                        hasContent && !disabled
                            ? [
                                'bg-gradient-to-r from-indigo-500 to-purple-600',
                                'text-white',
                                'shadow-lg shadow-indigo-500/30',
                                'hover:shadow-xl hover:shadow-indigo-500/40',
                            ]
                            : [
                                'bg-slate-100 dark:bg-white/5',
                                'text-slate-400 dark:text-slate-500',
                                'cursor-not-allowed',
                            ],
                    )}
                >
                    <AnimatePresence mode="wait">
                        {disabled ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                className="w-5 h-5"
                            >
                                <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </motion.div>
                        ) : (
                            <motion.svg
                                key="send"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </motion.svg>
                        )}
                    </AnimatePresence>
                </motion.button>
            </motion.div>
        </div>
    );
};

export default InputArea;
