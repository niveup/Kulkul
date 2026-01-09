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

// Inline spring config (to avoid import issues)
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
        <motion.button
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(conversation.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                'w-full flex items-start gap-3 p-3 rounded-xl text-left',
                'transition-all duration-200',
                'group relative',
                isActive
                    ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-white/50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300',
            )}
        >
            {/* Active Indicator */}
            {isActive && (
                <motion.div
                    layoutId="activeSidebarItem"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-indigo-500"
                    transition={springSnappy}
                />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                        'font-medium truncate',
                        isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white',
                    )}>
                        {conversation.title}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: false })}
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {conversation.lastMessage || 'No messages yet'}
                </p>
            </div>

            {/* Delete Button (on hover) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conversation.id);
                        }}
                        className={cn(
                            'absolute right-2 top-1/2 -translate-y-1/2',
                            'p-1.5 rounded-lg',
                            'bg-red-500/10 text-red-500',
                            'hover:bg-red-500/20',
                            'transition-colors',
                        )}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// =============================================================================
// Trash Item
// =============================================================================

const TrashItem = ({ conversation, onRestore, onPermanentDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl',
                'bg-red-500/5 dark:bg-red-500/10',
                'text-slate-500 dark:text-slate-400',
                'relative',
            )}
        >
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-slate-600 dark:text-slate-300">
                    {conversation.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Deleted {formatDistanceToNow(new Date(conversation.deleted_at), { addSuffix: true })}
                </p>
            </div>

            {/* Action Buttons (on hover) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1"
                    >
                        {/* Restore Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRestore(conversation.id)}
                            className={cn(
                                'p-1.5 rounded-lg',
                                'bg-green-500/10 text-green-500',
                                'hover:bg-green-500/20',
                                'transition-colors',
                            )}
                            title="Restore"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </motion.button>

                        {/* Permanent Delete Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onPermanentDelete(conversation.id)}
                            className={cn(
                                'p-1.5 rounded-lg',
                                'bg-red-500/10 text-red-500',
                                'hover:bg-red-500/20',
                                'transition-colors',
                            )}
                            title="Delete permanently"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
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
            <div key={title} className="mb-4">
                <p className="px-3 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {title}
                </p>
                <div className="space-y-1">
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
            className={cn(
                'flex flex-col h-full overflow-hidden',
                'bg-white/40 dark:bg-slate-800/40',
                'border-r border-white/20 dark:border-white/5',
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/5">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {showTrash ? 'Trash' : 'Chats'}
                </h2>
                <div className="flex items-center gap-2">
                    {/* Trash Toggle Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTrash(!showTrash)}
                        className={cn(
                            'p-2 rounded-xl relative',
                            showTrash
                                ? 'bg-red-500/20 text-red-500'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10',
                            'transition-colors',
                        )}
                        title={showTrash ? 'Show chats' : 'Show trash'}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {trashedConversations.length > 0 && !showTrash && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                                {trashedConversations.length}
                            </span>
                        )}
                    </motion.button>

                    {/* New Chat Button */}
                    {!showTrash && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onNewChat}
                            className={cn(
                                'p-2 rounded-xl',
                                'bg-indigo-500 text-white',
                                'hover:bg-indigo-600',
                                'shadow-lg shadow-indigo-500/30',
                                'transition-colors',
                            )}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </motion.button>
                    )}

                    {/* Close Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className={cn(
                            'p-2 rounded-xl',
                            'text-slate-500 dark:text-slate-400',
                            'hover:bg-white/50 dark:hover:bg-white/10',
                            'transition-colors',
                        )}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Search (only for chats) */}
            {!showTrash && (
                <div className="p-3">
                    <div className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl',
                        'bg-white/50 dark:bg-white/5',
                        'border border-white/20 dark:border-white/10',
                        'focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20',
                        'transition-all',
                    )}>
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className={cn(
                                'flex-1 bg-transparent border-none outline-none',
                                'text-sm text-slate-700 dark:text-slate-200',
                                'placeholder-slate-400 dark:placeholder-slate-500',
                            )}
                        />
                        {searchQuery && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={() => setSearchQuery('')}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                {showTrash ? (
                    // Trash View
                    <>
                        {trashedConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <p className="text-sm">Trash is empty</p>
                                <p className="text-xs mt-1 text-slate-400">Items auto-delete after 1 day</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="px-3 py-1 text-xs text-slate-400 dark:text-slate-500">
                                    Items will be permanently deleted after 1 day
                                </p>
                                {trashedConversations.map(conv => (
                                    <TrashItem
                                        key={conv.id}
                                        conversation={conv}
                                        onRestore={onRestore}
                                        onPermanentDelete={onPermanentDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Chats View
                    <>
                        {renderGroup('Today', groupedConversations.today)}
                        {renderGroup('Yesterday', groupedConversations.yesterday)}
                        {renderGroup('This Week', groupedConversations.thisWeek)}
                        {renderGroup('Older', groupedConversations.older)}

                        {filteredConversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
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

