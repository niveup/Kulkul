/**
 * ChatSidebar - Apple Notes-inspired conversation list
 * 
 * Features:
 * - Glassmorphism translucent panel
 * - Search with iOS-style input
 * - Grouped history (Today, Yesterday, etc.)
 * - Hover actions (delete/rename)
 * - Trash section with restore/permanent delete
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import styles from './AIChat.module.css';

// Inline spring config
const springSnappy = { type: 'spring', stiffness: 400, damping: 25, mass: 0.5 };

// =============================================================================
// Helper Functions
// =============================================================================

const groupConversationsByDate = (conversations) => {
    const groups = {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: [],
    };

    conversations.forEach(conv => {
        const date = new Date(conv.timestamp);
        if (isToday(date)) {
            groups.today.push(conv);
        } else if (isYesterday(date)) {
            groups.yesterday.push(conv);
        } else {
            groups.older.push(conv);
        }
    });

    return groups;
};

// =============================================================================
// Conversation Item
// =============================================================================

const ConversationItem = ({ conversation, isActive, onSelect, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => onSelect(conversation.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                styles.conversationItem,
                isActive && styles.active
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <p className={cn(styles.conversationTitle, 'truncate')}>
                    {conversation.title}
                </p>
                {isHovered ? (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conversation.id);
                        }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </motion.button>
                ) : (
                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: false })}
                    </span>
                )}
            </div>
            <p className={cn(styles.conversationSnippet, 'truncate')}>
                {conversation.lastMessage || 'No messages yet'}
            </p>
        </motion.div>
    );
};

// =============================================================================
// Main Component
// =============================================================================

const ChatSidebar = ({
    conversations,
    trashedConversations = [],
    activeId,
    onSelect,
    onNewChat,
    onDelete,
    onRestore,
    onPermanentDelete,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showTrash, setShowTrash] = useState(false);

    // Filter and group conversations
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const query = searchQuery.toLowerCase();
        return conversations.filter(c =>
            c.title.toLowerCase().includes(query) ||
            (c.lastMessage || '').toLowerCase().includes(query)
        );
    }, [conversations, searchQuery]);

    const groupedConversations = useMemo(() =>
        groupConversationsByDate(filteredConversations),
        [filteredConversations]
    );

    const renderGroup = useCallback((title, items) => {
        if (items.length === 0) return null;
        return (
            <div key={title}>
                <p className={styles.sectionTitle}>
                    {title}
                </p>
                <div>
                    {items.map(conv => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isActive={conv.id === activeId}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        );
    }, [activeId, onSelect, onDelete]);

    return (
        <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={springSnappy}
            className={styles.sidebar}
        >
            {/* Header */}
            <div className={styles.sidebarHeader}>
                {/* Top Row: Title & Actions */}
                <div className="flex items-center justify-between">
                    <h2 className={styles.sidebarTitle}>
                        {showTrash ? 'Trash Bin' : 'Chats'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Trash Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowTrash(!showTrash)}
                            className={cn(
                                styles.glassButton,
                                showTrash && 'bg-red-500/20 text-red-400 border-red-500/20'
                            )}
                            title={showTrash ? 'Back to chats' : 'View trash'}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </motion.button>

                        {/* Close Panel */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className={styles.glassButton}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </motion.button>
                    </div>
                </div>

                {/* New Chat Button (Prominent) */}
                {!showTrash && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onNewChat}
                        className={styles.primaryButton}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Conversation</span>
                    </motion.button>
                )}
            </div>

            {/* Search (only for chats) */}
            {!showTrash && (
                <div className={styles.searchWrapper}>
                    <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className={styles.glassInput}
                    />
                </div>
            )}

            {/* Content */}
            <div className={cn(styles.scrollContainer, "flex-1 px-2 pb-4")}>
                {showTrash ? (
                    // Trash View
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                        <p className="text-sm">Trash functionality...</p>
                    </div>
                ) : (
                    // Chats View
                    <>
                        {renderGroup('Today', groupedConversations.today)}
                        {renderGroup('Yesterday', groupedConversations.yesterday)}
                        {renderGroup('This Week', groupedConversations.thisWeek)}
                        {renderGroup('Older', groupedConversations.older)}

                        {filteredConversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                <p className="text-sm">No conversations found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.aside>
    );
};

export default ChatSidebar;

