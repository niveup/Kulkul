import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';

// Inline spring config
const springGentle = { type: 'spring', stiffness: 100, damping: 15, mass: 1 };

// =============================================================================
// Simple Markdown Renderer
// =============================================================================

const renderMarkdown = (text) => {
    if (!text) return null;

    // Split by lines for processing
    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent = [];

    lines.forEach((line, lineIndex) => {
        // Code block handling
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={`code-${lineIndex}`} className="my-2 p-3 bg-slate-800 dark:bg-slate-900 rounded-lg overflow-x-auto">
                        <code className="text-sm text-emerald-400 font-mono">{codeContent.join('\n')}</code>
                    </pre>
                );
                codeContent = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeContent.push(line);
            return;
        }

        // Process inline markdown
        let processed = line;

        // Bold: **text** or __text__
        processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        processed = processed.replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>');

        // Italic: *text* or _text_
        processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>');
        processed = processed.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em class="italic">$1</em>');

        // Inline code: `code`
        processed = processed.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400">$1</code>');

        // Headers
        if (processed.startsWith('### ')) {
            processed = `<h3 class="text-base font-bold mt-3 mb-1">${processed.slice(4)}</h3>`;
        } else if (processed.startsWith('## ')) {
            processed = `<h2 class="text-lg font-bold mt-3 mb-1">${processed.slice(3)}</h2>`;
        } else if (processed.startsWith('# ')) {
            processed = `<h1 class="text-xl font-bold mt-3 mb-1">${processed.slice(2)}</h1>`;
        }

        // Bullet points
        if (processed.startsWith('• ') || processed.startsWith('- ') || processed.startsWith('* ')) {
            processed = `<li class="ml-4 list-disc">${processed.slice(2)}</li>`;
        }

        // Numbered lists
        const numberedMatch = processed.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
            processed = `<li class="ml-4 list-decimal">${numberedMatch[2]}</li>`;
        }

        if (processed.trim()) {
            elements.push(
                <span
                    key={lineIndex}
                    dangerouslySetInnerHTML={{ __html: processed }}
                    className="block"
                />
            );
        } else {
            elements.push(<br key={lineIndex} />);
        }
    });

    return elements;
};

// =============================================================================
// Main Component
// =============================================================================

const MessageBubble = ({ message, isLast }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [copied, setCopied] = useState(false);

    const isUser = message.role === 'user';

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [message.content]);

    // Memoize markdown rendering for performance
    const renderedContent = useMemo(() => {
        if (isUser) return message.content;
        return renderMarkdown(message.content);
    }, [message.content, isUser]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={springGentle}
            className={cn(
                'flex gap-3',
                isUser ? 'justify-end' : 'justify-start',
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Assistant Avatar */}
            {!isUser && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-xl',
                        'bg-gradient-to-br from-indigo-500 to-purple-600',
                        'flex items-center justify-center',
                        'shadow-lg shadow-indigo-500/30',
                    )}
                >
                    <span className="text-sm">✨</span>
                </motion.div>
            )}

            {/* Message Content */}
            <div className={cn(
                'relative max-w-[70%] group',
            )}>
                <motion.div
                    className={cn(
                        'px-4 py-3 rounded-2xl',
                        isUser
                            ? [
                                // User bubble: gradient pill
                                'bg-gradient-to-br from-indigo-500 to-purple-600',
                                'text-white',
                                'rounded-br-md',
                                'shadow-lg shadow-indigo-500/20',
                            ]
                            : [
                                // Assistant bubble: glass card
                                'bg-white/60 dark:bg-white/10',
                                'backdrop-blur-md',
                                'border border-white/30 dark:border-white/10',
                                'text-slate-800 dark:text-slate-100',
                                'rounded-bl-md',
                            ],
                    )}
                >
                    {/* Message Text */}
                    <div className={cn(
                        'text-sm leading-relaxed',
                        isUser ? 'text-white whitespace-pre-wrap' : 'text-slate-800 dark:text-slate-100',
                    )}>
                        {renderedContent}
                    </div>

                    {/* Timestamp */}
                    <div className={cn(
                        'mt-1 text-xs',
                        isUser ? 'text-white/60' : 'text-slate-400 dark:text-slate-500',
                    )}>
                        {format(new Date(message.timestamp), 'h:mm a')}
                    </div>
                </motion.div>

                {/* Copy Button (on hover) */}
                {isHovered && !isUser && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleCopy}
                        className={cn(
                            'absolute -right-10 top-2',
                            'p-2 rounded-lg',
                            'bg-white/50 dark:bg-white/10',
                            'hover:bg-white dark:hover:bg-white/20',
                            'text-slate-500 dark:text-slate-400',
                            'transition-colors',
                        )}
                        title="Copy message"
                    >
                        {copied ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </motion.button>
                )}
            </div>

            {/* User Avatar */}
            {isUser && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-xl',
                        'bg-gradient-to-br from-emerald-400 to-cyan-500',
                        'flex items-center justify-center text-white font-semibold text-sm',
                        'shadow-lg shadow-emerald-500/30',
                    )}
                >
                    U
                </motion.div>
            )}
        </motion.div>
    );
};

export default MessageBubble;
