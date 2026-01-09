/**
 * ChatArea - Main message display area
 * 
 * Features:
 * - iMessage/ChatGPT style message bubbles
 * - "Thinking" shimmer animation
 * - Auto-scroll to latest message
 * - Markdown rendering ready
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';

// Inline spring config
const springGentle = { type: 'spring', stiffness: 100, damping: 15, mass: 1 };

// =============================================================================
// Main Component
// =============================================================================

const ChatArea = ({ messages, isThinking }) => {
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, isThinking]);

    // Empty state
    if (messages.length === 0 && !isThinking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springGentle}
                    className="text-center max-w-md"
                >
                    {/* Animated Icon */}
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="mb-6"
                    >
                        <div className={cn(
                            'w-20 h-20 mx-auto rounded-3xl',
                            'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
                            'flex items-center justify-center',
                            'shadow-2xl shadow-indigo-500/30',
                        )}>
                            <span className="text-4xl">✨</span>
                        </div>
                    </motion.div>

                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        How can I help you today?
                    </h3>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className={cn(
                'flex-1 overflow-y-auto',
                'px-4 py-6',
                'space-y-4',
            )}
        >
            {/* Messages */}
            <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isLast={index === messages.length - 1 && !isThinking}
                    />
                ))}
            </AnimatePresence>

            {/* Thinking Indicator */}
            <AnimatePresence>
                {isThinking && <ThinkingIndicator />}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={bottomRef} className="h-1" />
        </div>
    );
};

export default ChatArea;
