import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import styles from './AIChat.module.css';

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
                    {/* Neural Orb Logo */}
                    <div className="mb-8 flex justify-center">
                        <div className={styles.neuralOrb}>
                            <div className={styles.orbCore} />
                            <div className={styles.orbRing} />
                            <div className={styles.orbRing} />
                        </div>
                    </div>

                    <h3 className="text-xl font-medium text-white/90 tracking-wide">
                        Neural Core Online
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">
                        System ready. Initialize request.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className={cn(
                styles.scrollContainer,
                'flex-1 px-4 py-6 space-y-4' // Keep padding/spacing utility classes
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

            {/* Scroll anchor + spacer for fixed input bar */}
            <div ref={bottomRef} className="h-24" />
        </div>
    );
};

export default ChatArea;
