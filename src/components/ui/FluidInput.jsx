/**
 * Fluid Input Component - Project Aether
 * 
 * An input field that morphs between states:
 * - Collapsed: Pill-shaped, minimal
 * - Focused: Expanded with full toolbar
 * - Thinking: Animated loading state
 * 
 * Inspired by Apple's "Dynamic Island" concept.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Sparkles,
    Mic,
    Paperclip,
    X,
    Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { springs } from '../../lib/motion';

const FluidInput = ({
    value = '',
    onChange,
    onSubmit,
    placeholder = 'Ask anything...',
    isLoading = false,
    className,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef(null);

    // Auto-expand when there's content or focused
    useEffect(() => {
        setIsExpanded(isFocused || value.length > 0);
    }, [isFocused, value]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (value.trim() && !isLoading) {
            onSubmit?.(value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            layout
            className={cn(
                'relative',
                className
            )}
        >
            <motion.form
                layout
                onSubmit={handleSubmit}
                animate={{
                    borderRadius: isExpanded ? 24 : 9999,
                }}
                transition={springs.snappy}
                className={cn(
                    'relative overflow-hidden',
                    'bg-slate-800/80 backdrop-blur-xl',
                    'border border-white/10',
                    'shadow-2xl shadow-black/20',
                    isLoading && 'border-cyan-500/50'
                )}
            >
                {/* Glow effect when loading */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"
                        />
                    )}
                </AnimatePresence>

                <div className="relative flex items-center gap-3 p-3">
                    {/* AI Sparkle Icon */}
                    <motion.div
                        animate={{
                            scale: isLoading ? [1, 1.2, 1] : 1,
                            rotate: isLoading ? [0, 180, 360] : 0,
                        }}
                        transition={{
                            duration: 2,
                            repeat: isLoading ? Infinity : 0,
                            ease: 'linear',
                        }}
                        className={cn(
                            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                            'bg-gradient-to-br from-cyan-500 to-purple-600',
                            'shadow-lg shadow-cyan-500/30'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="text-white animate-spin" />
                        ) : (
                            <Sparkles size={20} className="text-white" />
                        )}
                    </motion.div>

                    {/* Input Field */}
                    <motion.div
                        layout
                        className="flex-1 relative"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => onChange?.(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={handleKeyDown}
                            placeholder={isLoading ? 'Thinking...' : placeholder}
                            disabled={isLoading}
                            className={cn(
                                'w-full bg-transparent border-none outline-none',
                                'text-white placeholder-slate-400',
                                'text-base font-medium',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        />
                    </motion.div>

                    {/* Action Buttons */}
                    <AnimatePresence mode="wait">
                        {value.length > 0 ? (
                            <motion.div
                                key="submit"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={springs.snappy}
                                className="flex items-center gap-2"
                            >
                                {/* Clear button */}
                                <motion.button
                                    type="button"
                                    onClick={() => onChange?.('')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center',
                                        'bg-white/5 hover:bg-white/10',
                                        'text-slate-400 hover:text-white',
                                        'transition-colors'
                                    )}
                                >
                                    <X size={16} />
                                </motion.button>

                                {/* Submit button */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center',
                                        'bg-gradient-to-r from-cyan-500 to-cyan-600',
                                        'text-white shadow-lg shadow-cyan-500/30',
                                        'hover:shadow-cyan-500/50 transition-shadow',
                                        'disabled:opacity-50 disabled:cursor-not-allowed'
                                    )}
                                >
                                    <Send size={18} />
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-1"
                            >
                                {/* Mic button */}
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        'w-9 h-9 rounded-full flex items-center justify-center',
                                        'text-slate-400 hover:text-white hover:bg-white/10',
                                        'transition-colors'
                                    )}
                                >
                                    <Mic size={18} />
                                </motion.button>

                                {/* Attach button */}
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        'w-9 h-9 rounded-full flex items-center justify-center',
                                        'text-slate-400 hover:text-white hover:bg-white/10',
                                        'transition-colors'
                                    )}
                                >
                                    <Paperclip size={18} />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Expanded toolbar (shown when focused with content) */}
                <AnimatePresence>
                    {isExpanded && value.length > 20 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={springs.snappy}
                            className="border-t border-white/5 px-4 py-2"
                        >
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Press</span>
                                <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-slate-400">Enter</kbd>
                                <span>to send</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>
        </motion.div>
    );
};

export default FluidInput;
