import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Calendar as CalendarIcon, History } from 'lucide-react';
import { getISTDate, isTodayIST, getTodayIST } from '../../utils/dateUtils';
import TodoHistory from './TodoHistory';

const TodayTimeline = ({ sessions = [] }) => {
    const [viewDate, setViewDate] = useState(getTodayIST());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const isToday = isTodayIST(viewDate);

    // Filter sessions for the selected date
    const displaySessions = useMemo(() => {
        return sessions
            .filter(session => {
                const sessionDate = new Date(session.timestamp);
                const compareDate = new Date(viewDate);
                sessionDate.setHours(0, 0, 0, 0);
                compareDate.setHours(0, 0, 0, 0);
                return sessionDate.getTime() === compareDate.getTime();
            })
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [sessions, viewDate]);

    // Calculate total focus time for the selected date
    const totalFocusTime = useMemo(() => {
        return displaySessions.reduce((acc, session) => {
            if (session.status === 'completed') {
                return acc + (session.minutes || 0);
            } else if (session.status === 'failed' && session.elapsedSeconds) {
                return acc + Math.floor(session.elapsedSeconds / 60);
            }
            return acc;
        }, 0);
    }, [displaySessions]);

    const navigateDate = (days) => {
        const newDate = new Date(viewDate);
        newDate.setDate(newDate.getDate() + days);
        if (newDate > getTodayIST()) return;
        setViewDate(newDate);
    };

    const formatDateHeading = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatTimeRange = (timestamp, minutes) => {
        const startTime = new Date(timestamp);
        const endTime = new Date(startTime.getTime() + (minutes * 60 * 1000));

        const options = {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const startStr = startTime.toLocaleTimeString('en-US', options);
        const endStr = endTime.toLocaleTimeString('en-US', options);

        return `${startStr} - ${endStr}`;
    };

    const formatDuration = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="h-full flex flex-col group/timeline overflow-hidden">
            {/* Header: Celestial Navigator */}
            <div className="flex items-center justify-between mb-6 px-1 shrink-0">
                <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-3xl rounded-full p-0.5 border border-white/10 shadow-inner">
                    <motion.button
                        whileHover={{ scale: 1.1, x: -1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigateDate(-1)}
                        className="p-1.5 rounded-full bg-white/5 text-white/40 hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={10} strokeWidth={3.5} />
                    </motion.button>

                    <div className="flex flex-col items-center w-32 px-1">
                        {/* Fixed width to prevent layout shift with varying date lengths */}
                        <span className="text-[7px] font-medium uppercase tracking-[0.2em] text-white/60 mb-0 leading-none">
                            {/* Increased visibility from white/30 */}
                            {formatDateHeading(viewDate)}
                        </span>
                        <h3 className={`text-sm font-semibold tracking-normal leading-tight transition-all duration-300 ${isToday ? 'text-white' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]'}`}>
                            {isToday ? 'Live' : 'Archive'}
                        </h3>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1, x: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigateDate(1)}
                        disabled={isToday}
                        className={`p-1.5 rounded-full transition-all shadow-sm ${isToday
                            ? 'text-white/5 cursor-not-allowed'
                            : 'bg-white/5 text-white/40 hover:text-white'
                            }`}
                    >
                        <ArrowRight size={10} strokeWidth={3.5} />
                    </motion.button>
                </div>

                <div className="flex items-center gap-2">
                    {!isToday && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05, y: -0.5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewDate(getTodayIST())}
                            className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        >
                            <span className="text-[9px] font-medium uppercase tracking-[0.2em]">Today</span>
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className={`h-9 aspect-square flex items-center justify-center rounded-full transition-all duration-300 border overflow-hidden relative group/btn ${isCalendarOpen
                            ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_5px_15px_rgba(6,182,212,0.3)]'
                            : 'bg-[#050508]/40 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                            }`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700`} />
                        <CalendarIcon size={14} className="relative z-10" />
                    </motion.button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-4 px-3 py-2 bg-white/5 rounded-2xl border border-white/5 mx-1">
                <div className="flex items-center gap-2">
                    <History size={12} className="text-cyan-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Daily Focus</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                    <Clock size={12} className="text-cyan-400" />
                    <span className="text-xs font-medium">{formatDuration(totalFocusTime)}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                    {isCalendarOpen ? (
                        <motion.div
                            key="calendar-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute inset-0 z-50 flex flex-col"
                        >
                            <TodoHistory
                                onDateSelect={(date) => {
                                    setViewDate(date);
                                    setIsCalendarOpen(false);
                                }}
                                selectedDate={viewDate}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={viewDate.toDateString()}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="h-full flex flex-col px-2 overflow-y-auto custom-scrollbar"
                        >
                            {/* Timeline */}
                            <div className="relative pt-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-white/5"></div>

                                <div className="space-y-4 pb-4">
                                    {displaySessions.length === 0 ? (
                                        <div className="pl-8 py-10 flex flex-col items-center justify-center text-center opacity-40">
                                            <History size={32} strokeWidth={1} className="mb-3" />
                                            <p className="text-xs font-medium">No sessions recorded for this day.</p>
                                        </div>
                                    ) : (
                                        displaySessions.map((session, index) => (
                                            <motion.div
                                                key={session.id || index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.02,
                                                    ease: [0.23, 1, 0.32, 1]
                                                }}
                                                className="relative pl-8 group"
                                            >
                                                {/* Status Dot */}
                                                <div className={`
                                                    absolute left-[7px] top-1.5 w-2 h-2 rounded-full border-2 z-10 transition-all
                                                    ${session.status === 'completed'
                                                        ? 'bg-emerald-500 border-emerald-500/30'
                                                        : 'bg-rose-500 border-rose-500/30'
                                                    }
                                                `} />

                                                {/* Session Card */}
                                                <div className={`
                                                    p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden
                                                    ${session.status === 'completed'
                                                        ? 'bg-emerald-500/[0.03] border-emerald-500/10 hover:border-emerald-500/20'
                                                        : 'bg-rose-500/[0.03] border-rose-500/10 hover:border-rose-500/20'
                                                    }
                                                `}>
                                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                                                    <div className="flex items-start justify-between relative z-10">
                                                        <div className="flex items-start gap-2.5">
                                                            <div className={`p-1.5 rounded-lg ${session.status === 'completed' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                                                {session.status === 'completed' ? (
                                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                                ) : (
                                                                    <AlertTriangle size={12} className="text-rose-500" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-white text-xs font-semibold">
                                                                    {session.status === 'completed' ? 'Focus Session' : 'Interrupted'}
                                                                </p>
                                                                <p className="text-white/40 text-[10px] font-medium mt-0.5 tracking-tight">
                                                                    {formatTimeRange(session.timestamp, session.status === 'completed' ? session.minutes : Math.floor(session.elapsedSeconds / 60))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-white text-xs font-semibold">
                                                                {formatDuration(session.minutes || Math.floor(session.elapsedSeconds / 60))}
                                                            </p>
                                                            <p className={`
                                                                text-[9px] font-medium uppercase tracking-wider mt-0.5
                                                                ${session.status === 'completed' ? 'text-emerald-500/50' : 'text-rose-500/50'}
                                                            `}>
                                                                {session.status === 'completed' ? 'Done' : 'Fail'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default React.memo(TodayTimeline);
