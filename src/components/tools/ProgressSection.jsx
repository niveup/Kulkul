import React, { useMemo, useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { TrendingUp, Clock, Activity, BarChart3, Zap, Calendar, Sparkles, Target, Moon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const ProgressSection = ({ sessionHistory = [], isDarkMode, onToggleTheme, onDateChange }) => {
    const containerRef = useRef(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [pickerMonth, setPickerMonth] = useState(new Date());

    // Filter sessions by selected date
    const filteredSessions = useMemo(() => {
        if (!selectedDate) return sessionHistory;
        const dateStr = selectedDate.toDateString();
        return sessionHistory.filter(s => new Date(s.timestamp).toDateString() === dateStr);
    }, [sessionHistory, selectedDate]);

    const stats = useMemo(() => {
        const sessions = selectedDate ? filteredSessions : sessionHistory;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const failedSessions = sessions.filter(s => s.status === 'failed').length;

        // Calculate total focus time:
        // - Completed sessions: count full minutes
        // - Failed sessions: count actual elapsed time (elapsedSeconds)
        const totalMinutes = sessions.reduce((acc, s) => {
            if (s.status === 'completed') {
                return acc + (s.minutes || 0);
            } else if (s.status === 'failed' && s.elapsedSeconds) {
                // Count the actual time spent in failed sessions
                return acc + Math.floor(s.elapsedSeconds / 60);
            }
            return acc;
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        return {
            sessions: completedSessions,
            failedSessions: failedSessions,
            totalSessions: sessions.length,
            time: `${hours}h ${mins}m`,
            efficiency: sessions.length > 0
                ? Math.round((completedSessions / sessions.length) * 100)
                : 100
        };
    }, [sessionHistory, filteredSessions, selectedDate]);


    // Get days with sessions for calendar highlighting
    const daysWithSessions = useMemo(() => {
        const days = new Set();
        sessionHistory.forEach(s => {
            days.add(new Date(s.timestamp).toDateString());
        });
        return days;
    }, [sessionHistory]);

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add empty cells for days before the first
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
        if (onDateChange) onDateChange(date);
    };

    const clearDate = () => {
        setSelectedDate(null);
        if (onDateChange) onDateChange(null);
    };

    // GSAP Premium Entrance Animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set('.progress-card', { opacity: 0, y: 60, scale: 0.95 });
            gsap.set('.progress-header', { opacity: 0, y: -30 });
            gsap.set('.stat-number', { opacity: 0, scale: 0.8 });
            gsap.set('.activity-item', { opacity: 0, x: 30 });

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                delay: 0.1
            });

            tl.to('.progress-header', { opacity: 1, y: 0, duration: 0.8 })
                .to('.progress-card', { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.12, ease: 'back.out(1.2)' }, '-=0.4')
                .to('.stat-number', { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'elastic.out(1, 0.5)' }, '-=0.6')
                .to('.activity-item', { opacity: 1, x: 0, duration: 0.5, stagger: 0.08 }, '-=0.4');

            // Note: live-pulse animation uses CSS animation instead of GSAP for better performance
        }, containerRef);

        return () => ctx.revert();
    }, []);


    const handleMouseMove = (e, cardEl) => {
        if (!cardEl) return;
        const rect = cardEl.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 25;
        const y = (e.clientY - rect.top - rect.height / 2) / 25;

        gsap.to(cardEl, {
            x: x, y: y, rotateX: -y * 0.3, rotateY: x * 0.3,
            boxShadow: `${-x * 2}px ${-y * 2}px 30px rgba(99, 102, 241, 0.15)`,
            duration: 0.4, ease: 'power2.out'
        });
    };

    const handleMouseLeave = (cardEl) => {
        if (!cardEl) return;
        gsap.to(cardEl, {
            x: 0, y: 0, rotateX: 0, rotateY: 0,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
            duration: 0.6, ease: 'elastic.out(1, 0.4)'
        });
    };

    return (
        <div className={`min-h-full ${isDarkMode ? 'dark' : ''}`}>
            <div
                ref={containerRef}
                className="relative w-full min-h-[650px] p-1 transition-colors duration-500 bg-transparent dark:bg-slate-900/50"
                style={{ perspective: '1200px' }}
            >
                {/* Header */}
                <div className="progress-header flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Target size={22} strokeWidth={2} />
                            </div>
                            Your Progress
                            {selectedDate && (
                                <span className="text-lg font-medium text-indigo-500 dark:text-indigo-400 ml-2">
                                    • {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1.5 ml-14 text-sm font-medium">
                            {selectedDate ? `Showing data for ${selectedDate.toLocaleDateString()}` : 'Overview • Analytics • Insights'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedDate && (
                            <button
                                onClick={clearDate}
                                className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                            >
                                <X size={14} />
                                Clear filter
                            </button>
                        )}
                        <button
                            onClick={onToggleTheme}
                            className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                            title={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
                        >
                            {isDarkMode ? <Moon size={18} fill="currentColor" /> : <Moon size={18} />}
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>

                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Live</span>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* Hero Card */}
                        <div
                            className="progress-card hero-card group relative p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 shadow-2xl shadow-indigo-300/40 overflow-hidden"
                            style={{ transformStyle: 'preserve-3d' }}
                            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white ring-1 ring-white/30">
                                        <Clock size={20} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-white/90 font-medium tracking-wide text-sm uppercase">
                                        {selectedDate ? 'Focus Time (Selected Date)' : 'Total Focus Time'}
                                    </span>
                                </div>

                                <h3 className="stat-number text-5xl lg:text-6xl font-bold text-white tracking-tighter drop-shadow-lg">
                                    {stats.time}
                                </h3>

                                <div className="mt-6 flex items-center gap-3">
                                    <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium flex items-center gap-2">
                                        <Zap size={14} className="fill-amber-300 text-amber-300" />
                                        {selectedDate ? 'Daily' : 'Aggregated'}
                                    </span>
                                    <span className="text-white/80 text-sm">
                                        {selectedDate ? `On ${selectedDate.toLocaleDateString()}` : 'Across all sessions'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="progress-card group p-5 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-md transition-all duration-300"
                                style={{ transformStyle: 'preserve-3d' }}
                                onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                                onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800">
                                        <Activity size={20} strokeWidth={1.5} />
                                    </div>
                                    <Sparkles size={16} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="stat-number text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-0.5">{stats.sessions}</div>
                                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    {selectedDate ? 'Sessions Today' : 'Total Sessions'}
                                </div>
                            </div>

                            <div className="progress-card group p-5 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-md transition-all duration-300"
                                style={{ transformStyle: 'preserve-3d' }}
                                onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
                                onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-800">
                                        <BarChart3 size={20} strokeWidth={1.5} />
                                    </div>
                                    <Sparkles size={16} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="stat-number text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-0.5">{stats.efficiency}%</div>
                                <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Focus Efficiency</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity List */}
                    <div className="lg:col-span-5">
                        <div className="progress-card h-full p-5 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-md flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <button
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className={`p-2 rounded-lg transition-colors ${showDatePicker ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}
                                    >
                                        <Calendar size={18} strokeWidth={2} />
                                    </button>
                                    <span className="text-sm font-bold uppercase tracking-wide">
                                        {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent Activity'}
                                    </span>
                                </div>
                            </div>

                            {/* Date Picker Dropdown */}
                            {showDatePicker && (
                                <div className="mb-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <button onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                                            <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
                                        </button>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                                            <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                            <div key={d} className="p-1 font-medium text-slate-400">{d}</div>
                                        ))}
                                        {getDaysInMonth(pickerMonth).map((day, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => day && handleDateSelect(day)}
                                                disabled={!day}
                                                className={`p-2 rounded-lg text-xs transition-colors ${!day ? '' :
                                                    selectedDate?.toDateString() === day.toDateString()
                                                        ? 'bg-indigo-500 text-white'
                                                        : daysWithSessions.has(day.toDateString())
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 font-semibold'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                {day?.getDate() || ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                {filteredSessions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-12">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-4">
                                            <Activity size={28} className="text-slate-300 dark:text-slate-500" />
                                        </div>
                                        <p className="text-sm font-medium">{selectedDate ? 'No activity on this day' : 'No activity yet'}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            {selectedDate ? 'Try selecting a different date' : 'Complete a focus session to see it here'}
                                        </p>
                                    </div>
                                ) : (
                                    [...filteredSessions].reverse().slice(0, 10).map((session, idx) => (
                                        <div
                                            key={session.id || idx}
                                            className="activity-item group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all cursor-default"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${session.status === 'completed' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' : 'bg-gradient-to-br from-rose-400 to-rose-500 text-white'}`}>
                                                    {session.status === 'completed' ? <TrendingUp size={18} /> : <Activity size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-slate-900 dark:text-white font-semibold text-base">{session.minutes} Minutes</div>
                                                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                        {new Date(session.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${session.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400'}`}>
                                                {session.status === 'completed' ? 'Done' : 'Failed'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressSection;
