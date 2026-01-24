/**
 * AIChat - World-Class AI Chat Interface
 * 
 * A premium, Apple-inspired chat interface with:
 * - Glassmorphism effects
 * - Collapsible sidebar
 * - Dynamic input area
 * - Smooth spring animations
 * - Database persistence with trash
 * 
 * @architecture UI-first design with database backend
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../../contexts/AuthContext';
import { Lock } from 'lucide-react';

// Sub-components
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import InputArea from './InputArea';
import styles from './AIChat.module.css';

// =============================================================================
// AI Models Configuration
// =============================================================================

const AI_MODELS = [
    // CEREBRAS - Ultra-fast inference on Wafer-Scale Engine
    { id: 'cerebras-zai', name: 'Z.ai GLM 4.7', icon: '👑', description: '355B params - Largest!', provider: 'cerebras', model: 'zai-glm-4.7' },
    { id: 'cerebras-qwen235b', name: 'Qwen 3 235B', icon: '🏆', description: '235B params - Massive', provider: 'cerebras', model: 'qwen-3-235b-a22b-instruct-2507' },
    { id: 'cerebras-gptoss', name: 'GPT-OSS 120B', icon: '🎯', description: '120B params - Open Source', provider: 'cerebras', model: 'gpt-oss-120b' },
    { id: 'cerebras-qwen32b', name: 'Qwen 3 32B', icon: '🌟', description: '32B params - Balanced', provider: 'cerebras', model: 'qwen-3-32b' },

    // GOOGLE - Gemini models
    { id: 'gemini-2.0', name: 'Gemini 2.0 Flash', icon: '✨', description: 'Google - Fast & smart', provider: 'gemini', model: 'gemini-2.0-flash' },

    // GROQ - LPU inference engine
    { id: 'groq-llama', name: 'Llama 3.3 70B', icon: '💨', description: '70B params - Super fast', provider: 'groq', model: 'llama-3.3-70b-versatile' },

    // XIAOMI - MiMo reasoning model
    { id: 'mimo-flash', name: 'MiMo v2 Flash', icon: '🍊', description: 'Xiaomi - Fast reasoning', provider: 'mimo', model: 'mimo-v2-flash' },
];

// =============================================================================
// Main Component
// =============================================================================

import { useAppStore } from '../../../store';

const AIChat = ({ isDarkMode }) => {
    // Global Store
    const setDockCollapsed = useAppStore((state) => state.setDockCollapsed);
    const dockCollapsed = useAppStore((state) => state.dockCollapsed);

    // Track previous state to restore on unmount
    useEffect(() => {
        const previousState = dockCollapsed;
        setDockCollapsed(true); // Auto-collapse on enter

        return () => {
            // Restore previous state or force expand on exit
            // For now, per user request, we force expand (reappear)
            setDockCollapsed(false);
        };
    }, []); // Run once on mount

    // State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [trashedConversations, setTrashedConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [activeMessages, setActiveMessages] = useState([]);
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
    const [isThinking, setIsThinking] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { isAuthenticated } = useAuth();

    // Message cache for instant switching between conversations
    const messageCache = useRef({});

    // ==========================================================================
    // Load conversations from database
    // ==========================================================================
    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        const loadConversations = async () => {
            try {
                const [convRes, trashRes] = await Promise.all([
                    fetch('/api/conversations'),
                    fetch('/api/conversations/trash')
                ]);

                if (convRes.ok) {
                    const data = await convRes.json();
                    setConversations(data.map(c => ({
                        id: c.id,
                        title: c.title,
                        lastMessage: c.lastMessage || '',
                        timestamp: new Date(c.timestamp),
                        messages: [] // Messages loaded on demand
                    })));
                }

                if (trashRes.ok) {
                    const trashData = await trashRes.json();
                    setTrashedConversations(trashData);
                }
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadConversations();
    }, [isAuthenticated]);

    // ==========================================================================
    // Load messages when active conversation changes
    // ==========================================================================
    useEffect(() => {
        if (!activeConversationId) {
            setActiveMessages([]);
            return;
        }

        // Check cache first - instant load
        if (messageCache.current[activeConversationId]) {
            setActiveMessages(messageCache.current[activeConversationId]);
            return;
        }

        // Load from API and cache
        const loadMessages = async () => {
            try {
                const res = await fetch(`/api/conversations/${activeConversationId}`);
                if (res.ok) {
                    const data = await res.json();
                    const messages = data.messages || [];
                    messageCache.current[activeConversationId] = messages;
                    setActiveMessages(messages);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };
        loadMessages();
    }, [activeConversationId]);


    // Derived state
    const activeConversation = useMemo(() =>
        conversations.find(c => c.id === activeConversationId) || null,
        [conversations, activeConversationId]
    );

    // ==========================================================================
    // Handlers
    // ==========================================================================

    const handleNewChat = useCallback(() => {
        setActiveConversationId(null);
        setActiveMessages([]);
    }, []);

    const handleSelectConversation = useCallback((id) => {
        setActiveConversationId(id);
    }, []);

    const handleDeleteConversation = useCallback(async (id) => {
        // Optimistic UI - update immediately
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            setTrashedConversations(prev => [{ ...conv, deleted_at: new Date() }, ...prev]);
        }
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConversationId === id) {
            setActiveConversationId(null);
            setActiveMessages([]);
        }

        // API call in background
        try {
            await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    }, [conversations, activeConversationId]);

    const handleRestoreConversation = useCallback(async (id) => {
        // Optimistic UI - update immediately
        const conv = trashedConversations.find(c => c.id === id);
        if (conv) {
            setConversations(prev => [{ ...conv, timestamp: new Date() }, ...prev]);
        }
        setTrashedConversations(prev => prev.filter(c => c.id !== id));

        // API call in background
        try {
            await fetch(`/api/conversations/${id}/restore`, { method: 'POST' });
        } catch (error) {
            console.error('Failed to restore conversation:', error);
        }
    }, [trashedConversations]);

    const handlePermanentDelete = useCallback(async (id) => {
        // Optimistic UI - update immediately
        setTrashedConversations(prev => prev.filter(c => c.id !== id));

        // API call in background
        try {
            await fetch(`/api/conversations/${id}/permanent`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to permanently delete:', error);
        }
    }, []);


    const handleSendMessage = useCallback(async (content) => {
        if (!content.trim() || isThinking) return;

        // STEP 1: IMMEDIATE UI UPDATE (no awaits)
        const userMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        // Clear input and show thinking IMMEDIATELY
        setInputValue('');
        setIsThinking(true);

        // Determine conversation ID
        let currentConversationId = activeConversationId;
        const isNewConversation = !currentConversationId;

        if (isNewConversation) {
            // Create new conversation optimistically
            currentConversationId = `conv-${Date.now()}`;
            const title = content.trim().slice(0, 30) + (content.trim().length > 30 ? '...' : '');
            const newConv = {
                id: currentConversationId,
                title,
                lastMessage: content.trim(),
                timestamp: new Date(),
            };
            setConversations(prev => [newConv, ...prev]);
            setActiveConversationId(currentConversationId);
            setActiveMessages([userMessage]);
            messageCache.current[currentConversationId] = [userMessage];

            // Save to database in background (don't await)
            fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentConversationId,
                    title,
                    modelId: selectedModel.id,
                    modelName: selectedModel.name,
                    messages: [userMessage]
                })
            }).catch(err => console.error('Failed to create conversation:', err));
        } else {
            // Add to existing conversation
            setActiveMessages(prev => {
                const updated = [...prev, userMessage];
                messageCache.current[currentConversationId] = updated;
                return updated;
            });
            setConversations(prev => prev.map(c =>
                c.id === currentConversationId
                    ? { ...c, lastMessage: content.trim(), timestamp: new Date() }
                    : c
            ));

            // Save message to database in background (don't await)
            fetch(`/api/conversations/${currentConversationId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', content: content.trim() })
            }).catch(err => console.error('Failed to save message:', err));
        }

        // STEP 2: CALL AI API
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...activeMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
                    provider: selectedModel.provider,
                    model: selectedModel.model,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API error: ${response.status}`);
            }

            const data = await response.json();

            const aiMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: data.content || 'Sorry, I could not generate a response.',
                timestamp: new Date(),
            };

            // Add AI response to messages
            setActiveMessages(prev => {
                const updated = [...prev, aiMessage];
                messageCache.current[currentConversationId] = updated;
                return updated;
            });

            // Save AI response to database in background (don't await)
            fetch(`/api/conversations/${currentConversationId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'assistant', content: aiMessage.content })
            }).catch(err => console.error('Failed to save AI response:', err));

        } catch (error) {
            console.error('AI Chat Error:', error);

            const errorMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: `❌ **Error:** ${error.message}\n\nPlease try again or check your connection.`,
                timestamp: new Date(),
            };

            setActiveMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    }, [activeConversationId, activeMessages, selectedModel, isThinking]);


    const handleToggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    // ==========================================================================
    // Render
    // ==========================================================================

    if (!isAuthenticated) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4 max-w-md w-full"
                >
                    <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Restricted Access</h2>
                    <p className="text-slate-400">
                        The AI Core and Conversation History are protected.
                        Please authentication to verify your identity.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={cn(
                'h-[calc(100vh-120px)] flex items-center justify-center rounded-2xl',
                'bg-white/50 dark:bg-slate-900/50',
                'backdrop-blur-2xl',
            )}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Aurora Background Mesh (Scoped) */}
            <div className={styles.auroraMesh} />

            {/* Sidebar (Kept as is, or can be wrapped if needed) */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <ChatSidebar
                        conversations={conversations}
                        trashedConversations={trashedConversations}
                        activeId={activeConversationId}
                        onSelect={handleSelectConversation}
                        onNewChat={handleNewChat}
                        onDelete={handleDeleteConversation}
                        onRestore={handleRestoreConversation}
                        onPermanentDelete={handlePermanentDelete}
                        onClose={handleToggleSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Main Chat Area (Scoped) */}
            <div className={cn(styles.chatArea, "flex-1 flex flex-col min-w-0")}>

                {/* Header (Transparent Glass) */}
                <motion.header
                    className="flex items-center gap-3 px-6 py-4 z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Toggle Sidebar Button */}
                    {!sidebarOpen && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggleSidebar}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </motion.button>
                    )}

                    {/* Model Selector (Glass Pill) */}
                    <div className="flex-1 flex items-center justify-center relative">
                        <motion.button
                            onClick={() => setModelSelectorOpen(!modelSelectorOpen)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-sm font-medium text-white/90 shadow-lg"
                        >
                            <span>{selectedModel.name}</span>
                            <motion.svg
                                className="w-4 h-4 text-white/50"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ rotate: modelSelectorOpen ? 180 : 0 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </motion.button>

                        {/* Dropdown (Glass) */}
                        <AnimatePresence>
                            {modelSelectorOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-3 z-50 w-80 p-2 rounded-2xl bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 shadow-2xl"
                                >
                                    <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Neural Core
                                    </p>
                                    {AI_MODELS.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel(model);
                                                setModelSelectorOpen(false);
                                            }}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all',
                                                selectedModel.id === model.id
                                                    ? 'bg-white/10 text-white'
                                                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                                            )}
                                        >
                                            <div>
                                                <p className="font-medium text-sm">{model.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{model.model}</p>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Click outside to close */}
                        {modelSelectorOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setModelSelectorOpen(false)}
                            />
                        )}
                    </div>
                </motion.header>

                {/* Messages Area */}
                <ChatArea
                    messages={activeMessages}
                    isThinking={isThinking}
                />

                {/* Input Area */}
                <InputArea
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={handleSendMessage}
                    disabled={isThinking}
                    placeholder={`Message ${selectedModel.name}...`}
                    isThinking={isThinking}
                />
            </div>
        </div>
    );
};

export default AIChat;
