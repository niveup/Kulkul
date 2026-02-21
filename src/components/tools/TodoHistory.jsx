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

            {/* Header Area */}
            <div className="p-4 pb-2 flex items-center justify-between relative z-10 shrink-0">
                <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        {monthName}
                    </h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">
                        {yearName}
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                    <button
                        onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                        className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <ChevronLeft size={12} strokeWidth={3} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentMonth(getTodayIST()); onDateSelect(getTodayIST()); }}
                        className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-90 ${currentMonth.getMonth() === getTodayIST().getMonth() && currentMonth.getFullYear() === getTodayIST().getFullYear()
                                ? 'bg-transparent text-white/10 cursor-default select-none'
                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                            }`}
                        disabled={currentMonth.getMonth() === getTodayIST().getMonth() && currentMonth.getFullYear() === getTodayIST().getFullYear()}
                    >
                        Today
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                        className={`p-1 rounded-md transition-all active:scale-90 ${(currentMonth.getMonth() === getTodayIST().getMonth() && currentMonth.getFullYear() === getTodayIST().getFullYear())
                                ? 'text-white/5 cursor-default select-none'
                                : 'text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                        disabled={currentMonth.getMonth() === getTodayIST().getMonth() && currentMonth.getFullYear() === getTodayIST().getFullYear()}
                    >
                        <ChevronRight size={12} strokeWidth={3} />
                    </button>
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
