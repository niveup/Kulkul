import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react';

const SessionHistory = React.memo(({ sessionHistory, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filter, setFilter] = useState('completed'); // 'all', 'completed', 'failed' - default to completed
    const [timeRange, setTimeRange] = useState('week'); // 'today', 'week', 'month', 'year'

    // Filter and group sessions
    const filteredSessions = useMemo(() => {
        const now = new Date();
        let cutoff;

        switch (timeRange) {
            case 'today':
                cutoff = new Date(now.toDateString());
                break;
            case 'week':
                cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
            default:
                cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }

        return sessionHistory
            .filter(s => new Date(s.timestamp) >= cutoff)
            .filter(s => filter === 'all' || s.status === filter)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [sessionHistory, filter, timeRange]);

    // Stats
    const stats = useMemo(() => {
        const completed = filteredSessions.filter(s => s.status === 'completed');
        const failed = filteredSessions.filter(s => s.status === 'failed');
        const totalMinutes = completed.reduce((acc, s) => acc + (s.minutes || 0), 0);

        return {
            total: filteredSessions.length,
            completed: completed.length,
            failed: failed.length,
            totalTime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        };
    }, [filteredSessions]);

    // Group by date
    const groupedByDate = useMemo(() => {
        const groups = {};
        filteredSessions.forEach(session => {
            const date = new Date(session.timestamp).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(session);
        });
        return groups;
    }, [filteredSessions]);

    const formatTime = useCallback((timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    return (
        <div className={`rounded-3xl p-4 ${isDarkMode ? 'bg-slate-800/50 border border-white/10' : 'bg-white/60 backdrop-blur-xl border border-white/50'}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <Calendar size={18} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-500'} />
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Session History</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'}`}>
                        {stats.total} sessions
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 mt-4 mb-3">
                            <div className="flex gap-1">
                                {['today', 'week', 'month', 'year'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-2 py-1 text-xs rounded-lg transition-colors ${timeRange === range
                                            ? 'bg-indigo-500 text-white'
                                            : isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {range.charAt(0).toUpperCase() + range.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1 ml-auto">
                                {['all', 'completed', 'failed'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-2 py-1 text-xs rounded-lg transition-colors ${filter === f
                                            ? f === 'completed' ? 'bg-green-500 text-white' : f === 'failed' ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'
                                            : isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {f === 'all' ? 'All' : f === 'completed' ? '✓' : '✗'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className={`grid grid-cols-4 gap-2 p-3 rounded-xl mb-3 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                            <div className="text-center">
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.total}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-500">{stats.completed}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>Done</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-red-500">{stats.failed}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>Failed</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>{stats.totalTime}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>Focus</p>
                            </div>
                        </div>

                        {/* Session List */}
                        <div className="max-h-64 overflow-y-auto space-y-3 custom-scrollbar">
                            {Object.keys(groupedByDate).length === 0 ? (
                                <p className={`text-center py-4 text-sm ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                                    No sessions found
                                </p>
                            ) : (
                                Object.entries(groupedByDate).map(([date, sessions]) => (
                                    <div key={date}>
                                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{date}</p>
                                        <div className="space-y-1">
                                            {sessions.map((session, idx) => (
                                                <div
                                                    key={session.id || idx}
                                                    className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {session.status === 'completed' ? (
                                                            <CheckCircle size={14} className="text-green-500" />
                                                        ) : (
                                                            <XCircle size={14} className="text-red-500" />
                                                        )}
                                                        <span className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                                                            {session.minutes} min
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                                                        {formatTime(session.timestamp)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default SessionHistory;
