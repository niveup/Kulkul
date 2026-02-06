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
        if (goalMinutes <= 0) return 'bg-white/10';

        const percentage = (minutes / goalMinutes) * 100;

        if (percentage >= 100) return 'bg-emerald-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        if (percentage >= 25) return 'bg-orange-500';
        return 'bg-red-500';
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
            <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
                {[
                    { label: '100%+', color: 'bg-emerald-500' },
                    { label: '75-99%', color: 'bg-blue-500' },
                    { label: '50-74%', color: 'bg-yellow-500' },
                    { label: '25-49%', color: 'bg-orange-500' },
                    { label: '0-24%', color: 'bg-red-500' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded ${item.color}`} />
                        <span className="text-[9px] text-white/60">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={goToPreviousMonth}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                    <ChevronLeft size={14} />
                </button>
                <h3 className="text-[12px] font-medium text-white/70 uppercase tracking-wide">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                    onClick={goToNextMonth}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-0.5 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-[8px] text-white/40 text-center font-medium">
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
                        className={`relative aspect-[4/3] rounded-md overflow-hidden border border-white/10 ${
                            day ? 'cursor-pointer hover:scale-105 transition-transform' : 'bg-transparent'
                        }`}
                    >
                        {day ? (
                            <>
                                <div
                                    className={`absolute inset-0 ${getProgressColor(day.minutes)} transition-all duration-300`}
                                    style={{ opacity: getProgressPercentage(day.minutes) / 100 }}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                                    <span className="text-[14px] font-bold text-white drop-shadow-lg">
                                        {day.day}
                                    </span>
                                    {day.date <= new Date() && (
                                        <>
                                            <span className="text-[12px] text-white/90 font-medium leading-tight">
                                                {formatHours(day.minutes)}
                                            </span>
                                            <span className="text-[12px] text-white/80 font-bold leading-tight">
                                                {Math.round(getProgressPercentage(day.minutes))}%
                                            </span>
                                        </>
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
