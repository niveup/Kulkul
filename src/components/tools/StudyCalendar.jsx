import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSessionStore } from '../../store';

const StudyCalendar = ({ goalMinutes }) => {
    const { sessions } = useSessionStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lastUpdate, setLastUpdate] = useState(null);

    // Check if we need to update (every day at 2 AM)
    useEffect(() => {
        const checkAndUpdate = () => {
            const now = new Date();
            const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : null;

            // If it's past 2 AM and we haven't updated today
            if (now.getHours() >= 2 && (!lastUpdateDate || lastUpdateDate.getDate() !== now.getDate())) {
                setLastUpdate(now.toISOString());
            }
        };

        checkAndUpdate();
        const interval = setInterval(checkAndUpdate, 60000);

        return () => clearInterval(interval);
    }, [lastUpdate]);

    // Group sessions by date and calculate total minutes
    const dailyData = useMemo(() => {
        const data = {};

        sessions.forEach(session => {
            const date = new Date(session.timestamp).toDateString();
            if (!data[date]) {
                data[date] = 0;
            }
            if (session.status === 'completed') {
                data[date] += session.minutes || 0;
            } else if (session.status === 'failed' && session.elapsedSeconds) {
                data[date] += Math.floor(session.elapsedSeconds / 60);
            }
        });

        return data;
    }, [sessions]);

    // Get calendar days for the current month
    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toDateString();
            const minutes = dailyData[dateStr] || 0;
            days.push({
                date,
                dateStr,
                day,
                minutes
            });
        }

        return days;
    };

    const getProgressColor = (minutes) => {
        if (goalMinutes <= 0 || minutes <= 0) return 'rgba(255, 255, 255, 0.03)';

        const percentage = (minutes / goalMinutes) * 100;

        if (percentage >= 100) return '#10b981'; // Emerald (Goal Reached)
        if (percentage >= 75) return '#06b6d4';  // Cyan (Significant)
        if (percentage >= 50) return '#3b82f6';  // Blue (Steady)
        if (percentage >= 25) return '#6366f1';  // Indigo (Gaining)
        return '#8b5cf6';                        // Violet (Minimal)
    };

    const getBorderColor = (minutes) => {
        const percentage = (minutes / (goalMinutes || 1)) * 100;
        if (percentage >= 100) return 'border-emerald-500/30';
        if (percentage >= 75) return 'border-cyan-500/30';
        if (percentage >= 50) return 'border-blue-500/30';
        if (percentage >= 25) return 'border-indigo-500/30';
        if (minutes > 0) return 'border-violet-500/30';
        return 'border-white/5';
    };

    const getProgressPercentage = (minutes) => {
        if (goalMinutes <= 0) return 0;
        return Math.min(100, (minutes / goalMinutes) * 100);
    };

    const formatHours = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const calendarDays = getCalendarDays();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="w-full">
            {/* Color Legend */}
            <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
                {[
                    { label: 'GOAL', color: 'bg-emerald-500' },
                    { label: 'HIGH', color: 'bg-cyan-500' },
                    { label: 'MID', color: 'bg-blue-500' },
                    { label: 'LOW', color: 'bg-indigo-500' },
                    { label: 'START', color: 'bg-violet-500' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 grayscale-[0.2] hover:grayscale-0 transition-all">
                        <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm shadow-black/20`} />
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {monthNames[currentDate.getMonth()]} <span className="text-white/30 font-medium">{currentDate.getFullYear()}</span>
                    </h3>
                </div>

                <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <ChevronLeft size={14} strokeWidth={3} />
                    </button>

                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-90 ${currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()
                            ? 'bg-transparent text-white/10 cursor-default'
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] active:shadow-none'
                            }`}
                        disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                    >
                        Today
                    </button>

                    <button
                        onClick={goToNextMonth}
                        className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-0.5 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-[10px] text-white/40 text-center font-bold tracking-tighter uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, index) => (
                    <motion.div
                        key={day?.dateStr || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.01 }}
                        className={`relative aspect-[4/3] rounded-md overflow-hidden border ${day ? getBorderColor(day.minutes) : 'border-transparent'} ${day ? 'cursor-pointer hover:scale-105 transition-transform' : 'bg-transparent'
                            }`}
                    >
                        {day ? (
                            <>
                                {/* Background Base */}
                                <div className="absolute inset-0 bg-white/[0.03]" />

                                {/* Progress Fill (Literal Depiction) */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                                    style={{
                                        height: `${Math.min(100, (day.minutes / (goalMinutes || 1)) * 100)}%`,
                                        background: getProgressColor(day.minutes),
                                        opacity: day.minutes > 0 ? 1 : 0
                                    }}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(100, (day.minutes / (goalMinutes || 1)) * 100)}%` }}
                                />

                                {day.minutes >= goalMinutes && goalMinutes > 0 && (
                                    <div className="absolute inset-0 bg-white/10 animate-pulse mix-blend-overlay" />
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                                    <span className="text-[18px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none leading-none">
                                        {day.day}
                                    </span>
                                    {day.minutes > 0 && (
                                        <div className="flex flex-col items-center mt-1 select-none">
                                            <span className="text-[13px] text-white font-bold leading-tight uppercase tracking-tighter drop-shadow-md">
                                                {formatHours(day.minutes)}
                                            </span>
                                            <span className="text-[12px] text-white/70 font-black leading-none drop-shadow-md">
                                                {Math.round(getProgressPercentage(day.minutes))}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StudyCalendar;
