import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    RefreshCw,
    Database,
    Clock,
    MessageSquare,
    CheckSquare,
    Brain,
    AlertTriangle,
    Shield,
    X,
    Loader2,
    HardDrive,
    Cloud
} from 'lucide-react';
import { shouldUseLocalStorage } from '../../utils/authMode';
import { localSessions, localTodos, localConversations } from '../../services/localStorageAdapter';

const AdminPanel = ({ isDarkMode }) => {
    const [stats, setStats] = useState({
        sessions: 0,
        todos: 0,
        conversations: 0,
        conversationsTrash: 0,
        srsTopics: 0,
        vaultFiles: 0
    });
    const [dbStorage, setDbStorage] = useState({
        used: 0,
        total: 5 * 1024 * 1024 * 1024 // 5GB typical free tier
    });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Fetch stats on mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Guest mode: get stats from localStorage
            if (shouldUseLocalStorage()) {
                const sessions = JSON.parse(localStorage.getItem('pomodoro_sessions') || '[]');
                const todos = JSON.parse(localStorage.getItem('daily_todos') || '[]');
                const conversations = JSON.parse(localStorage.getItem('ai_conversations') || '[]');
                setStats({
                    sessions: sessions.length,
                    todos: todos.length,
                    conversations: conversations.length,
                    conversationsTrash: 0,
                    srsTopics: 0,
                    vaultFiles: 0
                });
                setDbStorage({ used: 0, total: 5 * 1024 * 1024 * 1024 });
                setLoading(false);
                return;
            }

            // Authenticated mode: fetch from API
            const [sessionsRes, todosRes, convRes, trashRes, srsRes, vaultRes, dbRes] = await Promise.allSettled([
                fetch('/api/sessions'),
                fetch('/api/todos'),
                fetch('/api/conversations'),
                fetch('/api/conversations/trash'),
                fetch('/api/srs/topics'),
                fetch('/api/vault/list'),
                fetch('/api/admin/db-stats')
            ]);

            setStats({
                sessions: sessionsRes.status === 'fulfilled' && sessionsRes.value.ok
                    ? (await sessionsRes.value.json()).length || 0 : 0,
                todos: todosRes.status === 'fulfilled' && todosRes.value.ok
                    ? (await todosRes.value.json()).length || 0 : 0,
                conversations: convRes.status === 'fulfilled' && convRes.value.ok
                    ? (await convRes.value.json()).length || 0 : 0,
                conversationsTrash: trashRes.status === 'fulfilled' && trashRes.value.ok
                    ? (await trashRes.value.json()).length || 0 : 0,
                srsTopics: srsRes.status === 'fulfilled' && srsRes.value.ok
                    ? (await srsRes.value.json()).length || 0 : 0,
                vaultFiles: vaultRes.status === 'fulfilled' && vaultRes.value.ok
                    ? (await vaultRes.value.json()).files?.length || 0 : 0
            });

            // Get database storage stats
            if (dbRes.status === 'fulfilled' && dbRes.value.ok) {
                const dbData = await dbRes.value.json();
                if (dbData.success) {
                    setDbStorage({
                        used: dbData.used || 0,
                        total: dbData.total || 5 * 1024 * 1024 * 1024
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
        setLoading(false);
    };

    const handleDelete = async (type) => {
        setDeleting(type);
        try {
            // Guest mode: clear localStorage
            if (shouldUseLocalStorage()) {
                switch (type) {
                    case 'sessions':
                        localStorage.removeItem('pomodoro_sessions');
                        localStorage.removeItem('active_timer');
                        break;
                    case 'todos':
                        localStorage.removeItem('daily_todos');
                        break;
                    case 'conversations':
                    case 'conversationsTrash':
                        localStorage.removeItem('ai_conversations');
                        break;
                    default:
                        break;
                }
                await fetchStats();
                setDeleting(null);
                setConfirmDelete(null);
                return;
            }

            // Authenticated mode: call API
            let endpoint = '';
            const method = 'DELETE';

            switch (type) {
                case 'sessions':
                    endpoint = '/api/sessions/all';
                    break;
                case 'todos':
                    endpoint = '/api/todos/all';
                    break;
                case 'conversations':
                    // Delete all conversations (active and trash) via bulk endpoint
                    await fetch('/api/conversations/all', { method: 'DELETE' });
                    await fetchStats();
                    setDeleting(null);
                    setConfirmDelete(null);
                    return;
                case 'conversationsTrash':
                    endpoint = '/api/conversations/trash/all';
                    break;
                case 'srsTopics':
                    endpoint = '/api/srs/topics/all';
                    break;
                default:
                    return;
            }

            const response = await fetch(endpoint, { method });

            if (response.ok) {
                await fetchStats();
            } else {
                console.error(`Failed to delete ${type}`);
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
        setDeleting(null);
        setConfirmDelete(null);
    };

    const dataCategories = [
        {
            id: 'sessions',
            label: 'Study Sessions',
            icon: Clock,
            count: stats.sessions,
            color: 'blue',
            description: 'Timer sessions and study time data'
        },
        {
            id: 'todos',
            label: 'Todo Items',
            icon: CheckSquare,
            count: stats.todos,
            color: 'green',
            description: 'All todo tasks and their states'
        },
        {
            id: 'conversations',
            label: 'AI Conversations',
            icon: MessageSquare,
            count: stats.conversations,
            color: 'purple',
            description: 'Active AI chat conversations'
        },
        {
            id: 'conversationsTrash',
            label: 'Trashed Chats',
            icon: Trash2,
            count: stats.conversationsTrash,
            color: 'red',
            description: 'Deleted conversations in trash'
        },
        {
            id: 'srsTopics',
            label: 'SRS Data',
            icon: Brain,
            count: stats.srsTopics,
            color: 'amber',
            description: 'Spaced repetition review data'
        }
    ];

    const colorClasses = {
        blue: {
            bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
            border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
            icon: isDarkMode ? 'text-blue-400' : 'text-blue-600',
            text: isDarkMode ? 'text-blue-300' : 'text-blue-700'
        },
        green: {
            bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
            border: isDarkMode ? 'border-green-500/30' : 'border-green-200',
            icon: isDarkMode ? 'text-green-400' : 'text-green-600',
            text: isDarkMode ? 'text-green-300' : 'text-green-700'
        },
        purple: {
            bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
            border: isDarkMode ? 'border-purple-500/30' : 'border-purple-200',
            icon: isDarkMode ? 'text-purple-400' : 'text-purple-600',
            text: isDarkMode ? 'text-purple-300' : 'text-purple-700'
        },
        red: {
            bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
            border: isDarkMode ? 'border-red-500/30' : 'border-red-200',
            icon: isDarkMode ? 'text-red-400' : 'text-red-600',
            text: isDarkMode ? 'text-red-300' : 'text-red-700'
        },
        amber: {
            bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
            border: isDarkMode ? 'border-amber-500/30' : 'border-amber-200',
            icon: isDarkMode ? 'text-amber-400' : 'text-amber-600',
            text: isDarkMode ? 'text-amber-300' : 'text-amber-700'
        }
    };

    // Helper for formatting file sizes
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const dbStoragePercent = Math.round((dbStorage.used / dbStorage.total) * 100);

    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                        <Shield size={28} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                    </div>
                    <div>
                        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Admin Panel
                        </h1>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Manage and delete stored data from the database
                        </p>
                    </div>
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className={`
                            ml-auto p-2 rounded-xl transition-all
                            ${isDarkMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                : 'bg-white hover:bg-slate-100 text-slate-600'
                            }
                        `}
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Database Storage Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                        mb-6 p-5 rounded-2xl border
                        ${isDarkMode
                            ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20'
                            : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200'
                        }
                    `}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                            <HardDrive size={24} className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Database Storage
                                </h3>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                                    {loading ? '...' : `${formatFileSize(dbStorage.used)} / ${formatFileSize(dbStorage.total)}`}
                                </span>
                            </div>
                            <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dbStoragePercent}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {dbStoragePercent}% used
                                </span>
                                <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {formatFileSize(dbStorage.total - dbStorage.used)} available
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Warning Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                        mb-8 p-4 rounded-2xl border flex items-start gap-3
                        ${isDarkMode
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-red-50 border-red-200'
                        }
                    `}
                >
                    <AlertTriangle size={20} className={isDarkMode ? 'text-red-400 mt-0.5' : 'text-red-600 mt-0.5'} />
                    <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                            Danger Zone
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-red-400/80' : 'text-red-600/80'}`}>
                            Deleting data is permanent and cannot be undone. Make sure you want to proceed before clicking delete.
                        </p>
                    </div>
                </motion.div>

                {/* Data Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dataCategories.map((category, index) => {
                        const Icon = category.icon;
                        const colors = colorClasses[category.color];

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    p-5 rounded-2xl border transition-all
                                    ${isDarkMode
                                        ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}>
                                            <Icon size={20} className={colors.icon} />
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {category.label}
                                            </h3>
                                            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                                        {loading ? '...' : category.count}
                                    </div>
                                </div>

                                {confirmDelete === category.id ? (
                                    <div className={`
                                        p-3 rounded-xl border flex items-center justify-between
                                        ${isDarkMode
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : 'bg-red-50 border-red-200'
                                        }
                                    `}>
                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                                            Delete all {category.label.toLowerCase()}?
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmDelete(null)}
                                                className={`
                                                    px-3 py-1 rounded-lg text-sm font-medium
                                                    ${isDarkMode
                                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                    }
                                                `}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                disabled={deleting === category.id}
                                                className={`
                                                    px-3 py-1 rounded-lg text-sm font-medium
                                                    bg-red-500 text-white hover:bg-red-600
                                                    disabled:opacity-50 flex items-center gap-1
                                                `}
                                            >
                                                {deleting === category.id && <Loader2 size={14} className="animate-spin" />}
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDelete(category.id)}
                                        disabled={category.count === 0 || loading}
                                        className={`
                                            w-full py-2.5 rounded-xl text-sm font-medium
                                            flex items-center justify-center gap-2
                                            transition-all disabled:opacity-40 disabled:cursor-not-allowed
                                            ${isDarkMode
                                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                            }
                                        `}
                                    >
                                        <Trash2 size={16} />
                                        Delete All
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Delete All Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`
                        mt-8 p-6 rounded-2xl border-2 border-dashed
                        ${isDarkMode
                            ? 'border-red-500/30 bg-red-500/5'
                            : 'border-red-300 bg-red-50/50'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Database size={24} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                            <div>
                                <h3 className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                                    Reset All Data
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-red-400/80' : 'text-red-600/80'}`}>
                                    This will permanently delete all sessions, todos, chat history, and SRS data.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
                                    setDeleting('all');
                                    try {
                                        await Promise.all([
                                            handleDelete('sessions'),
                                            handleDelete('todos'),
                                            handleDelete('conversations'),
                                            handleDelete('srsTopics')
                                        ]);
                                    } catch (err) {
                                        console.error('Error resetting all:', err);
                                    }
                                    setDeleting(null);
                                }
                            }}
                            className={`
                                px-4 py-2 rounded-xl font-semibold
                                bg-red-500 text-white hover:bg-red-600
                                transition-all flex items-center gap-2
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {deleting === 'all' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Trash2 size={18} />
                            )}
                            Reset All
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminPanel;
