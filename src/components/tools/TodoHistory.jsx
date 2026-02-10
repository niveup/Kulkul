import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, Target } from 'lucide-react';
import { isTodayIST, getTodayIST } from '../../utils/dateUtils';
import { useTaskStore } from '../../store';

const TodoHistory = ({ onDateSelect, selectedDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || getTodayIST()));
    const tasks = useTaskStore(state => state.tasks);

    // Sync currentMonth when selectedDate changes
    useEffect(() => {
        if (selectedDate) {
            const dateMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            if (dateMonth.getTime() !== currentMonth.getTime()) {
                setCurrentMonth(dateMonth);
            }
        }
    }, [selectedDate, currentMonth]);

    const monthData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = date.toDateString();

            const dayTodos = tasks.filter(t => new Date(t.createdAt || t.created_at).toDateString() === dateStr);
            const total = dayTodos.length;
            const completed = dayTodos.filter(t => t.completed).length;
            const rate = total > 0 ? (completed / total) : 0;

            days.push({
                date,
                day: d,
                hasData: total > 0,
                totalTasks: total,
                completedTasks: completed,
                completionRate: rate,
                isToday: isTodayIST(date),
                isSelected: selectedDate?.toDateString() === dateStr
            });
        }
        return days;
    }, [currentMonth, tasks, selectedDate]);

    const changeMonth = (offset) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const yearName = currentMonth.getFullYear();

    return (
        <div className="flex flex-col h-full bg-[#050508]/60 backdrop-blur-3xl rounded-[1.5rem] border border-white/5 shadow-2xl overflow-hidden relative group/calendar">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-emerald-500/5 pointer-events-none" />

            {/* Header */}
            <div className="p-4 pb-2 flex items-center justify-between relative z-10 shrink-0">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-sm font-semibold text-white tracking-normal">{monthName}</h2>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">{yearName}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-0.5">
                    {!(currentMonth.getMonth() === getTodayIST().getMonth() && currentMonth.getFullYear() === getTodayIST().getFullYear()) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrentMonth(getTodayIST()); onDateSelect(getTodayIST()); }}
                            className="p-1 px-3 rounded-full text-[8px] font-medium uppercase tracking-wider bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all active:scale-95 border border-cyan-500/20"
                        >
                            Today
                        </button>
                    )}
                    <div className="flex gap-0.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                            className="p-1 px-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                        >
                            <ChevronLeft size={10} strokeWidth={3} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                            disabled={currentMonth.getMonth() === getTodayIST().getMonth() && currentMonth.getFullYear() === getTodayIST().getFullYear()}
                            className={`p-1 px-1.5 rounded-full transition-all active:scale-95 ${currentMonth.getMonth() === getTodayIST().getMonth() && currentMonth.getFullYear() === getTodayIST().getFullYear()
                                ? 'text-white/5 cursor-not-allowed'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <ChevronRight size={10} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="px-4 pb-4 flex-1 relative z-10 flex flex-col min-h-0 overflow-hidden">
                {/* Day Labels - Single Row, No Tracking, Perfect Alignment */}
                <div className="grid grid-cols-7 mb-2 border-b border-white/5 pb-1.5">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="text-center text-[9px] font-bold text-white/20">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Container to prevent wrapping */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                    <div className="grid grid-cols-7 gap-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={monthName}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                className="contents"
                            >
                                {monthData.map((day, i) => (
                                    <div key={i} className="aspect-square flex items-center justify-center">
                                        {day ? (
                                            <motion.button
                                                whileHover={day.date <= getTodayIST() ? { scale: 1.1 } : {}}
                                                whileTap={day.date <= getTodayIST() ? { scale: 0.95 } : {}}
                                                disabled={day.date > getTodayIST()}
                                                onClick={() => onDateSelect(day.date)}
                                                className={`
                                                    w-full h-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative
                                                    ${day.isSelected
                                                        ? 'bg-cyan-500 text-white shadow-lg z-10 border-cyan-400'
                                                        : day.date > getTodayIST()
                                                            ? 'bg-transparent text-white/5 cursor-not-allowed border-transparent'
                                                            : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/60 border-white/5 hover:border-white/10'
                                                    }
                                                    ${day.isToday && !day.isSelected ? 'ring-1 ring-cyan-500/30 font-black' : ''}
                                                    border box-border
                                                `}
                                            >
                                                <span className={`text-[11px] font-medium tracking-normal ${day.isSelected ? 'text-white' : 'text-white/80'}`}>
                                                    {day.day}
                                                </span>

                                                {day.hasData && !day.isSelected && (
                                                    <div className="absolute bottom-1 flex gap-0.5">
                                                        <div
                                                            className={`w-1 h-1 rounded-full ${day.completionRate === 1 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                                                            style={{ opacity: 0.4 + (day.completionRate * 0.6) }}
                                                        />
                                                    </div>
                                                )}
                                            </motion.button>
                                        ) : null}
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TodoHistory);
