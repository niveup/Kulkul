import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import styles from './AIChat.module.css';

// Spring config
const springGentle = { type: 'spring', stiffness: 100, damping: 15, mass: 1 };

// ===========================================================================
// Premium Markdown Renderer (Billion Dollar Quality)
// ===========================================================================

// Code Block Component with Copy Button
const CodeBlock = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-xl overflow-hidden bg-[#0d1117] border border-white/5 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    {language || 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                    {copied ? (
                        <>
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            {/* Code Content */}
            <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-slate-300">
                <code>{code}</code>
            </pre>
        </div>
    );
};

// Inline LaTeX/Formula styling
const renderInlineFormatting = (text) => {
    if (!text) return text;

    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 text-cyan-300 text-sm font-mono border border-white/5">$1</code>')
        // LaTeX inline math $...$
        .replace(/\$([^$]+)\$/g, '<span class="px-1 py-0.5 mx-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-sm border border-purple-500/20">$1</span>');
};

// Main renderer
const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBlockLines = [];
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code block start/end
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLanguage = line.slice(3).trim();
                codeBlockLines = [];
            } else {
                // End of code block
                elements.push(
                    <CodeBlock
                        key={`code-${i}`}
                        language={codeLanguage}
                        code={codeBlockLines.join('\n')}
                    />
                );
                inCodeBlock = false;
                codeLanguage = '';
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockLines.push(line);
            continue;
        }

        // Headers
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">
                    {line.slice(4)}
                </h3>
            );
            continue;
        }
        if (line.startsWith('## ')) {
            elements.push(
                <h2 key={i} className="text-xl font-bold text-white mt-5 mb-2">
                    {line.slice(3)}
                </h2>
            );
            continue;
        }
        if (line.startsWith('# ')) {
            elements.push(
                <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-3">
                    {line.slice(2)}
                </h1>
            );
            continue;
        }

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
            elements.push(
                <div key={i} className="flex gap-2 my-1">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span
                        dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line.slice(2)) }}
                    />
                </div>
            );
            continue;
        }

        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
            elements.push(
                <div key={i} className="flex gap-2 my-1">
                    <span className="text-cyan-400 font-mono text-sm min-w-[1.5rem]">{numberedMatch[1]}.</span>
                    <span
                        dangerouslySetInnerHTML={{ __html: renderInlineFormatting(numberedMatch[2]) }}
                    />
                </div>
            );
            continue;
        }

        // Regular paragraph
        const processed = renderInlineFormatting(line);
        elements.push(
            <span
                key={i}
                className="block my-1"
                dangerouslySetInnerHTML={{ __html: processed || '&nbsp;' }}
            />
        );
    }

    return elements;
};

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
                styles.messageRow,
                isUser ? styles.user : styles.ai
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Assistant Avatar (Only for AI) */}
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 mr-4 mt-1 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-500/20">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                </div>
            )}

            {/* Message Content */}
            <div className={cn(
                isUser ? styles.bubbleUser : styles.bubbleAi,
                "relative group"
            )}>
                {/* AI Header Name */}
                {!isUser && (
                    <div className={styles.aiHeader}>
                        <span className={styles.aiName}>Neural Link</span>
                    </div>
                )}

                {/* Message Text */}
                <div className={cn(
                    'text-sm leading-relaxed',
                    // Text color handled by CSS module now
                )}>
                    {renderedContent}
                </div>

                {/* Timestamp */}
                <div className={cn(
                    'mt-2 text-xs opacity-50 block',
                    isUser ? 'text-right' : 'text-left'
                )}>
                    {format(new Date(message.timestamp), 'h:mm a')}
                </div>

                {/* Copy Button (on hover) */}
                {isHovered && !isUser && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleCopy}
                        className="absolute -right-12 top-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-colors"
                        title="Copy message"
                    >
                        {copied ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </motion.div>
    );
};

export default MessageBubble;
